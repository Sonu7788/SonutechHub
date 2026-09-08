import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('javadsa_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle blocked or unauthorized accounts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.isBlocked) {
      alert(error.response.data.message || 'Your account has been blocked from practice by the administrator.');
      localStorage.removeItem('javadsa_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

// Categories endpoints
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getBySlug: (idOrSlug) => api.get(`/categories/${idOrSlug}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Questions endpoints
export const questionAPI = {
  getAll: (params) => api.get('/questions', { params }),
  getByIdOrSlug: (idOrSlug) => api.get(`/questions/${idOrSlug}`),
  create: (data) => api.post('/questions', data),
  update: (id, data) => api.put(`/questions/${id}`, data),
  delete: (id) => api.delete(`/questions/${id}`),
  bulkUpload: (formData) => api.post('/questions/bulk-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  downloadTemplate: () => api.get('/questions/template', { responseType: 'blob' }),
};

// Execution & Submissions (Strictly Protected)
export const executeAPI = {
  run: (data) => api.post('/execute/run', data),
  submit: (data) => api.post('/execute/submit', data),
};

export const submissionAPI = {
  getQuestionSubmissions: (questionId) => api.get(`/submissions/question/${questionId}`),
  getMyStats: () => api.get('/submissions/my-stats'),
  getAdminAnalytics: () => api.get('/submissions/admin-analytics'),
};

// Admin User Management
export const adminUserAPI = {
  getAll: (params) => api.get('/admin/users', { params }),
  getById: (id) => api.get(`/admin/users/${id}`),
  update: (id, data) => api.put(`/admin/users/${id}`, data),
  toggleBlock: (id, data) => api.patch(`/admin/users/${id}/toggle-block`, data),
  delete: (id) => api.delete(`/admin/users/${id}`),
};

// Global Leaderboard
export const leaderboardAPI = {
  getLeaderboard: (params) => api.get('/leaderboard', { params }),
};

export default api;

