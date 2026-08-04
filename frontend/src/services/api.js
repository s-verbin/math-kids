import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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

export const farmAPI = {
  getShop: () => api.get('/farm/shop'),
  getMyFarm: () => api.get('/farm/my-farm'),
  buyAnimal: (animalId, name) => api.post('/farm/buy-animal', { animalId, name }),
  buyItem: (itemId, quantity) => api.post('/farm/buy-item', { itemId, quantity }),
  feedAnimal: (userAnimalId) => api.post('/farm/feed', { userAnimalId }),
  petAnimal: (userAnimalId) => api.post('/farm/pet', { userAnimalId }),
  equipItem: (inventoryId, userAnimalId) => api.post('/farm/equip', { inventoryId, userAnimalId }),
  sellAnimal: (userAnimalId) => api.post('/farm/sell-animal', { userAnimalId }),
  sellItem: (inventoryId) => api.post('/farm/sell-item', { inventoryId }),
  cleanPoop: () => api.post('/farm/clean-poop'),
};

export const analyticsAPI = {
  startSession: (data) => api.post('/analytics/start', data),
};

export default api;
