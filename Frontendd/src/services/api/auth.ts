import api from './config';
import { LoginFormData, SignUpFormData, AuthUser } from '@/types/auth';

const authService = {
  login: async (data: LoginFormData) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  signup: async (data: SignUpFormData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async (): Promise<AuthUser> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  }
};

export default authService; 