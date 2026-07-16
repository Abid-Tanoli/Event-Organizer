import axiosInstance from './axios';

export const usersAPI = {
  getAll: async () => {
    const response = await axiosInstance.get('/user');
    return response.data;
  },
};