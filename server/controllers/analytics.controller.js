const Task = require('../models/Task');
const Project = require('../models/Project');
const AppError = require('../utils/AppError');
const sendResponse = require('../utils/sendResponse');

exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.role === 'Admin';

    const projectFilter = isAdmin
      ? {}
      : { $or: [{ owner: userId }, { 'members.user': userId }] };

    const userProjects = await Project.find(projectFilter).select('_id');
    const projectIds = userProjects.map(p => p._id);
    const taskFilter = { project: { $in: projectIds } };
    const now = new Date();

    const [
      statusDistribution,
      priorityDistribution,
      overdueCount,
      totalTasks,
      recentActivity,
      projectStats
    ] = await Promise.all([
      Task.aggregate([
        { $match: taskFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { name: '$_id', value: '$count', _id: 0 } }
      ]),
      Task.aggregate([
        { $match: taskFilter },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $project: { name: '$_id', value: '$count', _id: 0 } }
      ]),
      Task.countDocuments({
        ...taskFilter,
        dueDate: { $lt: now },
        status: { $ne: 'Done' }
      }),
      Task.countDocuments(taskFilter),
      Task.aggregate([
        {
          $match: {
            ...taskFilter,
            createdAt: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $project: { date: '$_id', count: 1, _id: 0 } }
      ]),
      Project.aggregate([
        { $match: { _id: { $in: projectIds } } },
        {
          $lookup: {
            from: 'tasks',
            localField: '_id',
            foreignField: 'project',
            as: 'tasks'
          }
        },
        {
          $project: {
            name: 1,
            status: 1,
            deadline: 1,
            totalTasks: { $size: '$tasks' },
            completedTasks: {
              $size: {
                $filter: {
                  input: '$tasks',
                  as: 'task',
                  cond: { $eq: ['$$task.status', 'Done'] }
                }
              }
            }
          }
        }
      ])
    ]);

    const completedTasks = statusDistribution.find(s => s.name === 'Done')?.value || 0;
    const completionRate = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    sendResponse(res, 200, 'Dashboard analytics', {
      summary: {
        totalProjects: projectIds.length,
        totalTasks,
        completedTasks,
        completionRate,
        overdueCount
      },
      charts: {
        statusDistribution,
        priorityDistribution,
        recentActivity
      },
      projectStats
    });
  } catch (error) {
    next(error);
  }
};