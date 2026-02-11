import axiosInstance from './axios';
import { Event, ApiResponse, PaginatedResponse } from '../types';

export const eventsAPI = {
  getPublicEvents: async (params?: {
    category?: string;
    eventType?: string;
    city?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Event>> => {
    const response = await axiosInstance.get('/events/public', { params });
    return response.data;
  },

  getFeaturedEvents: async (): Promise<ApiResponse<Event[]>> => {
    const response = await axiosInstance.get('/events/featured');
    return response.data;
  },

  getEventById: async (id: string): Promise<ApiResponse<Event>> => {
    const response = await axiosInstance.get(`/events/get/${id}`);
    return response.data;
  },

  getAllEvents: async (params?: Record<string, any>): Promise<PaginatedResponse<Event>> => {
    const response = await axiosInstance.get('/events/all', { params });
    return response.data;
  },

  createEvent: async (data: Partial<Event>): Promise<ApiResponse<Event>> => {
    const response = await axiosInstance.post('/events/create', data);
    return response.data;
  },

  updateEvent: async (id: string, data: Partial<Event>): Promise<ApiResponse<Event>> => {
    const response = await axiosInstance.put(`/events/update/${id}`, data);
    return response.data;
  },

  updateEventStatus: async (id: string, data: { status: string; rejectionReason?: string }) => {
    const response = await axiosInstance.put(`/events/status/${id}`, data);
    return response.data;
  },

  toggleFeatured: async (id: string, isFeatured: boolean) => {
    const response = await axiosInstance.put(`/events/featured/${id}`, { isFeatured });
    return response.data;
  },

  deleteEvent: async (id: string) => {
    const response = await axiosInstance.delete(`/events/delete/${id}`);
    return response.data;
  },

  likeEvent: async (id: string) => {
    const response = await axiosInstance.post(`/events/like/${id}`);
    return response.data;
  },

  shareEvent: async (id: string) => {
    const response = await axiosInstance.post(`/events/share/${id}`);
    return response.data;
  },
};