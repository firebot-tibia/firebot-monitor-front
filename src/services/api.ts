import axios from 'axios';
import { getSession, signIn, signOut } from 'next-auth/react';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

const excludedRoutes = ['/login', '/refresh'];

api.interceptors.request.use(
  async (config) => {
    if (excludedRoutes.some(route => config.url?.includes(route))) {
      return config;
    }

    const session = await getSession();
    if (session?.access_token) {
      config.headers['Authorization'] = `Bearer ${session.access_token}`;
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

    if (excludedRoutes.some(route => originalRequest.url?.includes(route))) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await signIn('refresh');
        
        const newSession = await getSession();

        if (newSession?.access_token) {
          originalRequest.headers['Authorization'] = `Bearer ${newSession.access_token}`;
          return api(originalRequest);
        } else {
          await signOut({ redirect: false });
          window.location.href = '/';
          return Promise.reject('Session expired');
        }
      } catch (refreshError) {
        await signOut({ redirect: false });
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;