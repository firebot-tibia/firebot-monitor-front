import { AuthDTO } from '../shared/dtos/auth.dto';
import api from './api';

export const login = async (data: AuthDTO) => {
  const response = await api.post(`/login`, data);
  return response.data;
};

export const refresh = async () => {
  try {
    const response = await api.post('/refresh');
    return response.data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw new Error('Failed to refresh token');
  }
};
