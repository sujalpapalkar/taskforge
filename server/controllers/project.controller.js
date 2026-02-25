const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const sendResponse = require('../utils/sendResponse');

exports.createProject = async (req, res, next) => {
  try {
    const { name, description, deadline, tags, color } = req.body;

    const project = await Project.create({
      name, description, deadline, tags, color,
      owner: req.user._id,
      members: [{ user: req.user._id, role: req.user.role }]
    });

    await project.populate('owner members.user', 'name email avatar role');
    sendResponse(res, 201, 'Project created successfully', { project });
  } catch (error) {
    next(error);
  }
};

exports.getProjects = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (req.user.role !== 'Admin') {
      query.$or = [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ];
    }

    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;
    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('owner', 'name email avatar')
        .populate('members.user', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Project.countDocuments(query)
    ]);

    const projectsWithProgress = await Promise.all(
      projects.map(async (p) => {
        const progress = await p.calculateProgress();
        return { ...p.toObject(), progress };
      })
    );

    sendResponse(res, 200, 'Projects fetched', {
      projects: projectsWithProgress,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar role')
      .populate('members.user', 'name email avatar role');

    if (!project) throw new AppError('Project not found', 404);

    const progress = await project.calculateProgress();
    sendResponse(res, 200, 'Project fetched', {
      project: { ...project.toObject(), progress }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'description', 'status', 'deadline', 'tags', 'color'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('owner members.user', 'name email avatar');

    if (!project) throw new AppError('Project not found', 404);
    sendResponse(res, 200, 'Project updated', { project });
  } catch (error) {
    next(error);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) throw new AppError('Project not found', 404);

    await Task.deleteMany({ project: req.params.id });
    await project.deleteOne();

    sendResponse(res, 200, 'Project and all tasks deleted successfully');
  } catch (error) {
    next(error);
  }
};

exports.addMember = async (req, res, next) => {
  try {
    const { email, role = 'Member' } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new AppError('User not found', 404);

    const project = await Project.findById(req.params.id);
    if (!project) throw new AppError('Project not found', 404);

    const alreadyMember = project.members.some(
      m => m.user.toString() === user._id.toString()
    );
    if (alreadyMember) throw new AppError('User is already a project member', 400);

    project.members.push({ user: user._id, role });
    await project.save();
    await project.populate('members.user', 'name email avatar');

    sendResponse(res, 200, 'Member added', { project });
  } catch (error) {
    next(error);
  }
};

exports.removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) throw new AppError('Project not found', 404);

    if (project.owner.toString() === req.params.userId) {
      throw new AppError('Cannot remove the project owner', 400);
    }

    project.members = project.members.filter(
      m => m.user.toString() !== req.params.userId
    );
    await project.save();

    sendResponse(res, 200, 'Member removed', { project });
  } catch (error) {
    next(error);
  }
};