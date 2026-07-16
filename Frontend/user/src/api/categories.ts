import axiosInstance from "./axios";

export const categoriesAPI = {
  getAll: async () => {
    const response = await axiosInstance.get("/category");
    return response.data.data;
  },

  create: async (data: { name: string }) => {
    const response = await axiosInstance.post("/category", data);
    return response.data.data;
  },

  update: async (id: string, data: { name: string }) => {
    const response = await axiosInstance.put(`/category/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/category/${id}`);
    return response.data.data;
  },
};