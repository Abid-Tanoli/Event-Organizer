import axiosInstance from "./axios";
import { AuthResponse, User } from "../types";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authAPI = {
  register: async (data: RegisterPayload): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/register", data);
    return response.data.data;
  },

  login: async (data: LoginPayload): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/login", data);
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