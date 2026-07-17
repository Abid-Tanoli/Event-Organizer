import axiosInstance from "./axios";
import { Ticket, ApiResponse, PaginatedResponse } from "../types";

export const ticketsAPI = {
  getAll: async (): Promise<Ticket[]> => {
    const response = await axiosInstance.get<ApiResponse<Ticket[]>>("/tickets/all");
    return response.data.data as Ticket[];
  },

  create: async (data: any): Promise<Ticket> => {
    const response = await axiosInstance.post<ApiResponse<Ticket>>("/tickets/create", data);
    return response.data.data as Ticket;
  },

  getByUser: async (userId: string, params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Ticket>["data"]> => {
    const response = await axiosInstance.get<PaginatedResponse<Ticket>>(`/tickets/user/${userId}`, { params });
    return response.data.data;
  },

  getByEvent: async (eventId: string, params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Ticket>["data"]> => {
    const response = await axiosInstance.get<PaginatedResponse<Ticket>>(`/tickets/event/${eventId}`, { params });
    return response.data.data;
  },

  cancel: async (id: string, reason: string): Promise<Ticket> => {
    const response = await axiosInstance.post<ApiResponse<Ticket>>(`/tickets/cancel/${id}`, { cancellationReason: reason });
    return response.data.data as Ticket;
  },

  checkIn: async (bookingReference: string): Promise<Ticket> => {
    const response = await axiosInstance.post<ApiResponse<Ticket>>("/tickets/checkin", { bookingReference });
    return response.data.data as Ticket;
  },
};