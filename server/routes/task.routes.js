const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams lets /:projectId flow in from project routes
const { protect } = require('../middleware/auth.middleware');
const {
  createTask,
  getTasksByProject,
  updateTask,
  deleteTask,
  addComment,
} = require('../controllers/task.controller');

// Apply auth to all routes
router.use(protect);

// ── Nested routes ─────────────────────────────────────────────────────────────
// Used by: GET  /api/projects/:projectId/tasks
//          POST /api/projects/:projectId/tasks
router.route('/')
  .get(getTasksByProject)
  .post(createTask);

// ── Standalone routes ─────────────────────────────────────────────────────────
// Used by: PUT    /api/tasks/:id
//          DELETE /api/tasks/:id
router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

// Used by: POST /api/tasks/:id/comments
router.post('/:id/comments', addComment);

module.exports = router;