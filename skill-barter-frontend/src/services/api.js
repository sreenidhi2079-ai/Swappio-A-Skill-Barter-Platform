import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://swappio-a-skill-barter-platform.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getWsUrl = (endpoint) => {
  const base = import.meta.env.VITE_API_URL || '/api';
  if (base.startsWith('http')) {
    return base.replace(/^http/, 'ws') + endpoint;
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const cleanBase = base.replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${protocol}//${window.location.host}${cleanBase}${cleanEndpoint}`;
};

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
};

export const skillService = {
  getAllSkills: () => api.get('/skills'),
  getOffers: () => api.get('/skills/offers'),
  getRequests: () => api.get('/skills/requests'),
  searchSkills: (query) => api.get(`/skills/search?q=${query}`),
  getMatches: (userName) => api.get('/skills/matches', { params: { user_name: userName } }),
  createSkillListing: (skillData) => api.post('/skills', skillData),
  deleteSkill: (id) => api.delete(`/skills/${id}`),
};


export default api;
