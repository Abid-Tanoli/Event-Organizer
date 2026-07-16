import axiosInstance from "./axios";
import { Organizer, ApiResponse, PaginatedResponse } from "../types";

export const organizersAPI = {
  getAll: async (params?: { status?: string; page?: number; limit?: number }): Promise<PaginatedResponse<Organizer>["data"]> => {
    const response = await axiosInstance.get<PaginatedResponse<Organizer>>("/organizers/all", { params });
    return response.data.data;
  },

  getApproved: async (): Promise<PaginatedResponse<Organizer>["data"]> => {
    const response = await axiosInstance.get<PaginatedResponse<Organizer>>("/organizers/approved");
    return response.data.data;
  },

  getById: async (id: string): Promise<Organizer> => {
    const response = await axiosInstance.get<ApiResponse<Organizer>>(`/organizers/get/${id}`);
    return response.data.data as Organizer;
  },

  create: async (data: Partial<Organizer>): Promise<Organizer> => {
    const response = await axiosInstance.post<ApiResponse<Organizer>>("/organizers/create", data);
    return response.data.data as Organizer;
  },

  updateStatus: async (id: string, data: { status: string; rejectionReason?: string }): Promise<Organizer> => {
    const response = await axiosInstance.put<ApiResponse<Organizer>>(`/organizers/status/${id}`, data);
    return response.data.data as Organizer;
  },

  delete: async (id: string): Promise<Organizer | null> => {
    const response = await axiosInstance.delete<ApiResponse<Organizer | null>>(`/organizers/delete/${id}`);
    return response.data.data as Organizer | null;
  },
};