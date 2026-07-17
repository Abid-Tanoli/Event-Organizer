import axiosInstance from "./axios";

export const statsAPI = {
  getSummary: async () => {
    const response = await axiosInstance.get("/stats/summary");
    return response.data.data;
  },
};
