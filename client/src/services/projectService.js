import api from './api';

const projectService = {
  // Projects
  getAll:    (params) => api.get('/projects', { params }),
  getById:   (id)     => api.get(`/projects/${id}`),
  create:    (data)   => api.post('/projects', data),
  update:    (id, data) => api.put(`/projects/${id}`, data),
  delete:    (id)     => api.delete(`/projects/${id}`),

  // Members
  addMember:    (id, data)         => api.post(`/projects/${id}/members`, data),
  removeMember: (id, userId)       => api.delete(`/projects/${id}/members/${userId}`),
};

export default projectService;