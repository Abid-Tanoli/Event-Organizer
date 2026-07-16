import axiosInstance from "./axios";
import { AuthResponse, User } from "../types";

export interface LoginPayload {
  email: string;
  password: string;
}

export const authAPI = {
  adminLogin: async (data: LoginPayload): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/admin-login", data);
    return response.data.data;
  },

  getMe: async (): Promise<User> => {
    const response = await axiosInstance.get("/user/me");
    return response.data.data;
  },

  updateProfile: async (data: { name: string }): Promise<User> => {
    const response = await axiosInstance.put("/user/me", data);
    return response.data.data;
  },
};