import axios from 'axios';
import { Platform } from 'react-native';
import { getItem, setItem, deleteItem } from './storage';

const API_BASE_URL = __DEV__
  ? Platform.OS === 'web'
    ? 'http://localhost:3000'
    : 'http://10.0.11.136:3000'
  : 'https://fitness-j6ka.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await getItem('refreshToken');
        if (refreshToken) {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, null, {
            headers: { Authorization: `Bearer ${refreshToken}` },
          });
          await setItem('accessToken', res.data.accessToken);
          await setItem('refreshToken', res.data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return api(originalRequest);
        }
      } catch {
        await deleteItem('accessToken');
        await deleteItem('refreshToken');
      }
    }
    return Promise.reject(error);
  },
);

export default api;
