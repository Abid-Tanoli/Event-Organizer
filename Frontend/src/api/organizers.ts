import axiosInstance from './axios';
import { Organizer, ApiResponse, PaginatedResponse } from '../types';

export const organizersAPI = {
  getAll: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await axiosInstance.get<PaginatedResponse<Organizer>>('/organizers/all', { params });
    return response.data;
  },

  getApproved: async () => {
    const response = await axiosInstance.get<PaginatedResponse<Organizer>>('/organizers/approved');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<Organizer>>(`/organizers/get/${id}`);
    return response.data;
  },

  create: async (data: Partial<Organizer>) => {
    const response = await axiosInstance.post<ApiResponse<Organizer>>('/organizers/create', data);
    return response.data;
  },

  updateStatus: async (id: string, data: { status: string; rejectionReason?: string }) => {
    const response = await axiosInstance.put<ApiResponse<Organizer>>(`/organizers/status/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse<Organizer>>(`/organizers/delete/${id}`);
    return response.data;
  },
};
