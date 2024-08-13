import axios from 'axios';
import Cookies from 'js-cookie';
import { refresh } from './auth';
import { isTokenExpired } from '../shared/utils/auth-utils';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  async (config) => {
    let token = Cookies.get('token');

    if (token && isTokenExpired(token)) {
      try {
        await refresh();
        token = Cookies.get('token');
      } catch (error) {
        window.location.href = '/';
        return Promise.reject(error);
      }
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await refresh();

        return api(originalRequest); 
      } catch (err) {
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
