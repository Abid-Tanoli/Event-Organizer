import axiosInstance from "./axios";

export interface ListResult<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const listFromResponse = <T>(response: any, key: string): ListResult<T> => ({
  items: response.data.data[key],
  pagination: response.data.data.pagination,
});

export const eventsAPI = {
  getPublicEvents: async (params?: any) => {
    const response = await axiosInstance.get("/events/all", {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 6,
        status: "approved",
        category: params?.category,
        eventType: params?.eventType,
        search: params?.search,
      },
    });
    return listFromResponse(response, "events");
  },

  getAllEvents: async (params?: any) => {
    const response = await axiosInstance.get("/events/all", { params });
    return listFromResponse(response, "events");
  },

  getFeaturedEvents: async () => {
    const response = await axiosInstance.get("/events/featured");
    return response.data.data;
  },

  getEventById: async (id: string) => {
    const response = await axiosInstance.get(`/events/${id}`);
    return response.data.data;
  },

  createEvent: async (data: any) => {
    const response = await axiosInstance.post("/events/create", data);
    return response.data.data;
  },

  updateEvent: async (id: string, data: any) => {
    const response = await axiosInstance.put(`/events/${id}`, data);
    return response.data.data;
  },

  updateStatus: async (id: string, data: any) => {
    const response = await axiosInstance.put(`/events/status/${id}`, data);
    return response.data.data;
  },

  toggleFeatured: async (id: string, isFeatured: boolean) => {
    const response = await axiosInstance.put(`/events/featured/${id}`, { isFeatured });
    return response.data.data;
  },

  deleteEvent: async (id: string) => {
    const response = await axiosInstance.delete(`/events/${id}`);
    return response.data.data;
  },

  likeEvent: async (id: string) => {
    const response = await axiosInstance.post(`/events/like/${id}`);
    return response.data.data;
  },

  shareEvent: async (id: string) => {
    const response = await axiosInstance.post(`/events/share/${id}`);
    return response.data.data;
  },
};