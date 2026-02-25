const express = require('express');
const router = express.Router();
const { protect, authorize, isProjectMember } = require('../middleware/auth.middleware');
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} = require('../controllers/project.controller');

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(isProjectMember, getProject)
  .put(isProjectMember, updateProject)
  .delete(authorize('Admin'), deleteProject);

router.post('/:id/members', isProjectMember, addMember);
router.delete('/:id/members/:userId', isProjectMember, removeMember);

// Nested task routes
router.use('/:projectId/tasks', require('./task.routes'));

module.exports = router;