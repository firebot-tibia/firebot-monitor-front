import { AuthDTO } from '../shared/dtos/auth.dto';
import api from './api';

export const login = async (data: AuthDTO) => {
  const response = await api.post(`/login`, data);
  return response.data;
};

export const refresh = async () => {
    const response = await api.post('/refresh');
    return response.data;
};
