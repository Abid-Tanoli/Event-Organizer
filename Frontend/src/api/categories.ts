
import axiosInstance from './axios';
import { Category, ApiResponse } from '../types';

export const categoriesAPI = {
  getAll: async () => {
    const response = await axiosInstance.get<ApiResponse>('/category');
    return response.data;
  },

  create: async (data: { name: string }) => {
    const response = await axiosInstance.post<ApiResponse>('/category', data);
    return response.data;
  },
};