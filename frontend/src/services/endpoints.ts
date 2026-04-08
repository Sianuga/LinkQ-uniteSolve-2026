import api from './api';

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/me'),
};

export const eventsApi = {
  list: (params?: { university?: string; category?: string }) =>
    api.get('/events', { params }),
  get: (id: string) => api.get(`/events/${id}`),
  join: (id: string) => api.post(`/events/${id}/join`),
  participants: (id: string) => api.get(`/events/${id}/participants`),
};

export const connectionsApi = {
  list: () => api.get('/connections'),
  send: (targetUserId: string) =>
    api.post('/connections', { target_user_id: targetUserId }),
  update: (id: string, status: 'ACCEPTED' | 'REJECTED') =>
    api.patch(`/connections/${id}`, { status }),
};
