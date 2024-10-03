import axios from 'axios';
import { useAuthStore } from '../store/auth-store';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  const getAccessToken = useAuthStore.getState().getAccessToken;
  const accessToken = await getAccessToken();
  
  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshAccessToken = useAuthStore.getState().refreshAccessToken;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await refreshAccessToken();
        const newAccessToken = useAuthStore.getState().accessToken;
        
        if (newAccessToken) {
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          throw new Error('Failed to refresh token');
        }
      } catch (refreshError) {
        useAuthStore.getState().clearTokens();
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;