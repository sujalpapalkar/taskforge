const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) throw new AppError('Not authenticated. Please login.', 401);

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) throw new AppError('User not found or deactivated.', 401);

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Access token expired. Please refresh.', 401));
    }
    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`Role '${req.user.role}' is not authorized for this action.`, 403)
      );
    }
    next();
  };
};

const isProjectMember = async (req, res, next) => {
  try {
    const Project = require('../models/Project');
    const projectId = req.params.projectId || req.params.id || req.body.project;
    const project = await Project.findById(projectId);
    if (!project) throw new AppError('Project not found', 404);

    const isMember = project.members.some(
      m => m.user.toString() === req.user._id.toString()
    );
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isMember && !isOwner && !isAdmin) {
      throw new AppError('You are not a member of this project.', 403);
    }

    req.project = project;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protect, authorize, isProjectMember };