import axios from 'axios';
import { getSession } from 'next-auth/react';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session && session.access_token) {
      config.headers['Authorization'] = `Bearer ${session.access_token}`;
      config.headers['x-refresh-token'] = `${session.refresh_token}`;
    } else {
      window.location.href = '/';
      return Promise.reject('No access token found');
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
        const session = await getSession();

        if (session && session.access_token) {
          originalRequest.headers['Authorization'] = `Bearer ${session.access_token}`;
          originalRequest.headers['x-refresh-token'] = `${session.refresh_token}`;
          return api(originalRequest); 
        } else {
          window.location.href = '/';
        }
      } catch (err) {
        window.location.href = '/';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
