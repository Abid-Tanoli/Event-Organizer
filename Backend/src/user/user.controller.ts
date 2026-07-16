import { Request, Response } from "express";
import { User } from "../user/user.model";

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, message: "User fetched", data: user });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
};

export const updateMe = async (req: any, res: Response) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name },
      { new: true }
    ).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, message: "User updated", data: user });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Failed to update user" });
  }
};

export const getAllUsers = async (_: Request, res: Response) => {
  try {
    const users = await User.find().select("-password");
    return res.json({ success: true, message: "Users fetched", data: users });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};
