import axios from 'axios';
import { getStoredAuth, clearStoredAuth } from '../store/authStore';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const { token } = getStoredAuth();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (r) => r,
  async (err) => {
    const originalRequest = err.config;
    
    if (err.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return axios(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken, user } = getStoredAuth();
      if (!refreshToken) {
        isRefreshing = false;
        clearStoredAuth();
        if (typeof window !== 'undefined' && window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
        return Promise.reject(err);
      }

      try {
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
        const res = await axios.post(`${baseURL}/accounts/token/refresh/`, {
          refresh: refreshToken
        });
        
        const newAccessToken = res.data.access;
        // Depending on backend config, sometimes it gives a new refresh token too
        const newRefreshToken = res.data.refresh || refreshToken;
        
        // Use setStoredAuth directly since we can't easily access useAuth hook here
        localStorage.setItem('centr-form-auth', JSON.stringify({
          user,
          token: newAccessToken,
          refreshToken: newRefreshToken
        }));
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearStoredAuth();
        if (typeof window !== 'undefined' && window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  }
);
