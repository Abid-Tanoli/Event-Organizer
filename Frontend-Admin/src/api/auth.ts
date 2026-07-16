import axiosInstance from './axios';
import { AuthResponse, User } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export const authAPI = {
  adminLogin: async (data: LoginPayload): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/admin-login', data);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await axiosInstance.get<User>('/user/me');
    return response.data;
  },

  updateProfile: async (data: { name: string }): Promise<User> => {
    const response = await axiosInstance.put<User>('/user/me', data);
    return response.data;
  },
};
