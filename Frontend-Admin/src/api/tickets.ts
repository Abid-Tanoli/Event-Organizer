import axiosInstance from './axios';
import { Ticket, ApiResponse, PaginatedResponse } from '../types';

export const ticketsAPI = {
  create: async (data: any): Promise<ApiResponse<Ticket>> => {
    const response = await axiosInstance.post('/tickets/create', data);
    return response.data;
  },

  getByUser: async (userId: string, params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Ticket>> => {
    const response = await axiosInstance.get(`/tickets/user/${userId}`, { params });
    return response.data;
  },

  getByEvent: async (eventId: string, params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Ticket>> => {
    const response = await axiosInstance.get(`/tickets/event/${eventId}`, { params });
    return response.data;
  },

  cancel: async (id: string, reason: string): Promise<ApiResponse<Ticket>> => {
    const response = await axiosInstance.post(`/tickets/cancel/${id}`, { cancellationReason: reason });
    return response.data;
  },

  checkIn: async (bookingReference: string): Promise<ApiResponse<Ticket>> => {
    const response = await axiosInstance.post('/tickets/checkin', { bookingReference });
    return response.data;
  },
};
