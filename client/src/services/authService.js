import api from './api';

const authService = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  logout:   ()     => api.post('/auth/logout'),
  refresh:  ()     => api.post('/auth/refresh'),
  getMe:    ()     => api.get('/auth/me'),
  updateProfile:    (data) => api.put('/auth/profile', data),
  changePassword:   (data) => api.put('/auth/change-password', data),
};

export default authService;