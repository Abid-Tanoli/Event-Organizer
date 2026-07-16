import axiosInstance from './axios';
import { AuthResponse, User } from '../types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'organizer';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authAPI = {
  register: async (data: RegisterPayload): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginPayload): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', data);
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
