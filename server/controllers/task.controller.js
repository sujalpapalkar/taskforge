const Task = require('../models/Task');
const Project = require('../models/Project');
const AppError = require('../utils/AppError');
const sendResponse = require('../utils/sendResponse');

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, assignee, priority, status, dueDate, tags } = req.body;

    const project = await Project.findById(req.params.projectId);
    if (!project) throw new AppError('Project not found', 404);

    const task = await Task.create({
      title, description, assignee, priority, status, dueDate, tags,
      project: req.params.projectId,
      reporter: req.user._id
    });

    await task.populate([
      { path: 'assignee', select: 'name email avatar' },
      { path: 'reporter', select: 'name email avatar' }
    ]);

    sendResponse(res, 201, 'Task created', { task });
  } catch (error) {
    next(error);
  }
};

exports.getTasksByProject = async (req, res, next) => {
  try {
    const { status, priority, assignee, search } = req.query;
    const query = { project: req.params.projectId };

    if (status)   query.status   = status;
    if (priority) query.priority = priority;
    if (assignee) query.assignee = assignee;
    if (search)   query.title    = { $regex: search, $options: 'i' };

    const tasks = await Task.find(query)
      .populate('assignee reporter', 'name email avatar')
      .sort({ createdAt: -1 });

    const grouped = {
      'Todo':        [],
      'In Progress': [],
      'Review':      [],
      'Done':        [],
    };
    tasks.forEach(task => {
      if (grouped[task.status]) grouped[task.status].push(task);
    });

    sendResponse(res, 200, 'Tasks fetched', { tasks, grouped, total: tasks.length });
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    // ── Find task first ───────────────────────────────────────────────────────
    const task = await Task.findById(req.params.id);
    if (!task) throw new AppError('Task not found', 404);

    // ── Permission check ──────────────────────────────────────────────────────
    const userId     = req.user._id.toString();
    const isAdmin    = req.user.role === 'Admin';
    const isManager  = req.user.role === 'Manager';
    const isAssignee = task.assignee?.toString() === userId;
    const isReporter = task.reporter?.toString() === userId;

    // Admin & Manager → full access to any task
    // Member          → only tasks they are assignee or reporter of
    if (!isAdmin && !isManager && !isAssignee && !isReporter) {
      throw new AppError('You are not authorized to update this task', 403);
    }

    // Members can only change status — not title, priority, assignee, etc.
    if (!isAdmin && !isManager) {
      const requestedFields  = Object.keys(req.body);
      const memberAllowed    = ['status'];
      const hasDisallowed    = requestedFields.some(f => !memberAllowed.includes(f));
      if (hasDisallowed) {
        throw new AppError('Members can only update task status', 403);
      }
    }

    // ── Build update object ───────────────────────────────────────────────────
    const allowedFields = ['title', 'description', 'status', 'priority', 'assignee', 'dueDate', 'tags'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // ── Apply update ──────────────────────────────────────────────────────────
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('assignee reporter', 'name email avatar');

    // ── Recalculate project progress ──────────────────────────────────────────
    const project = await Project.findById(task.project);
    if (project && typeof project.calculateProgress === 'function') {
      project.progress = await project.calculateProgress();
      await project.save();
    }

    sendResponse(res, 200, 'Task updated', { task: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    // ── Permission check ──────────────────────────────────────────────────────
    const task = await Task.findById(req.params.id);
    if (!task) throw new AppError('Task not found', 404);

    const userId     = req.user._id.toString();
    const isAdmin    = req.user.role === 'Admin';
    const isManager  = req.user.role === 'Manager';
    const isReporter = task.reporter?.toString() === userId;

    // Only Admin, Manager, or the task creator (reporter) can delete
    if (!isAdmin && !isManager && !isReporter) {
      throw new AppError('You are not authorized to delete this task', 403);
    }

    await Task.findByIdAndDelete(req.params.id);

    sendResponse(res, 200, 'Task deleted');
  } catch (error) {
    next(error);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) throw new AppError('Comment content is required', 400);

    const task = await Task.findById(req.params.id);
    if (!task) throw new AppError('Task not found', 404);

    // Any project member can comment — no extra restriction needed
    task.comments.push({ author: req.user._id, content: content.trim() });
    await task.save();
    await task.populate('comments.author', 'name avatar');

    sendResponse(res, 201, 'Comment added', { comments: task.comments });
  } catch (error) {
    next(error);
  }
};