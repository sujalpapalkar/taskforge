import api from './api';

const taskService = {
  // Tasks
  getByProject: (projectId, params) => api.get(`/projects/${projectId}/tasks`, { params }),
  create:       (projectId, data)   => api.post(`/projects/${projectId}/tasks`, data),
  update:       (id, data)          => api.put(`/tasks/${id}`, data),
  delete:       (id)                => api.delete(`/tasks/${id}`),

  // Comments
  addComment:   (id, content)       => api.post(`/tasks/${id}/comments`, { content }),

  // Analytics
  getDashboard: ()                  => api.get('/analytics/dashboard'),
};

export default taskService;