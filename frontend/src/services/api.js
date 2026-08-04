import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('🔑 Token from localStorage:', token ? 'EXISTS' : 'MISSING');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✅ Authorization header set');
  } else {
    console.log('❌ No token found in localStorage');
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateAvatar: (avatar) => api.put('/user/avatar', { avatar }),
};

export const topicsAPI = {
  getAll: () => api.get('/topics'),
  getById: (id) => api.get(`/topics/${id}`),
};

export const lessonsAPI = {
  start: (topicId) => api.post('/lessons/start', { topicId }),
  submit: (data) => api.post('/lessons/submit', data),
  getLeaderboard: () => api.get('/lessons/leaderboard'),
  getAchievements: () => api.get('/lessons/achievements'),
};

export default api;
