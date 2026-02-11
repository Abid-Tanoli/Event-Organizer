
import axiosInstance from './axios';
import { User } from '../types';

export const usersAPI = {
  getAll: async () => {
    const response = await axiosInstance.get('/user');
    return response.data;
  },
};