import axios from "./axios";

export const eventsAPI = {

  getPublicEvents: (params?: any) =>
    axios.get("/events/all", {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 6,
        status: "approved",
        category: params?.category,
        eventType: params?.eventType,
        search: params?.search,
      },
    }),

  getAllEvents: (params?: any) =>
    axios.get("/events/all", { params }),

  getFeaturedEvents: () =>
    axios.get("/events/featured"),

  getEventById: (id: string) =>
    axios.get(`/events/${id}`),

  createEvent: (data: any) =>
    axios.post("/events/create", data),

  updateEvent: (id: string, data: any) =>
    axios.put(`/events/${id}`, data),

  updateStatus: (id: string, data: any) =>
    axios.put(`/events/status/${id}`, data),

  toggleFeatured: (id: string, isFeatured: boolean) =>
    axios.put(`/events/featured/${id}`, { isFeatured }),

  deleteEvent: (id: string) =>
    axios.delete(`/events/${id}`),

  likeEvent: (id: string) =>
    axios.post(`/events/like/${id}`),

  shareEvent: (id: string) =>
    axios.post(`/events/share/${id}`),
};
