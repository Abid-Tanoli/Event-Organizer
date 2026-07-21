import axiosInstance from "./axios";

export interface AdminStats {
  totalEvents: number;
  totalUsers: number;
  totalOrganizers: number;
  totalTicketsSold: number;
  totalRevenue: number;
}

export const statsAPI = {
  getSummary: async (): Promise<AdminStats> => {
    const response = await axiosInstance.get("/stats/summary");
    return response.data.data;
  },
};
