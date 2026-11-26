import apiClient from './client';

export const authAPI = {
  register: (payload) => apiClient.post('/api/auth/register', payload),
  login: (payload) => apiClient.post('/api/auth/login', payload),
  getProfile: () => apiClient.get('/api/auth/profile'),
};

export const adminAPI = {
  getStats: () => apiClient.get('/api/admin/stats'),
  getUsers: () => apiClient.get('/api/admin/users'),
  updateUserRole: (id, role) => apiClient.patch(`/api/admin/users/${id}/role`, { role }),
  deleteUser: (id) => apiClient.delete(`/api/admin/users/${id}`),
  deleteResource: (id) => apiClient.delete(`/api/admin/resources/${id}`),
};

export const resourcesAPI = {
  getAll: () => apiClient.get('/api/resources'),
  create: (payload) => apiClient.post('/api/resources', payload),
};

export const doubtsAPI = {
  create: (payload) => apiClient.post('/api/doubts', payload),
  getAll: () => apiClient.get('/api/doubts'),
  answer: (id, answer_text) => apiClient.post(`/api/doubts/${id}/answer`, { answer_text }),
  getAnswers: (id) => apiClient.get(`/api/doubts/${id}/answers`),
};

export const quizzesAPI = {
  create: (payload) => apiClient.post('/api/quizzes', payload),
  addQuestion: (quizId, payload) => apiClient.post(`/api/quizzes/${quizId}/questions`, payload),
  getAll: () => apiClient.get('/api/quizzes'),
  getQuestions: (quizId) => apiClient.get(`/api/quizzes/${quizId}/questions`),
  submit: (quizId, answers) => apiClient.post(`/api/quizzes/${quizId}/submit`, { answers }),
  getResults: (quizId) => apiClient.get(`/api/quizzes/${quizId}/results`),
};
