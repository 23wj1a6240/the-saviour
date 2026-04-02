import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('saviour_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('saviour_token');
      localStorage.removeItem('saviour_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
