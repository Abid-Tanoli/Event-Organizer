import { Request, Response } from "express";
import { User } from "../models/user.model";

export const getMe = async (req: any, res: Response) => {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
};






export const updateMe = async (req: any, res: Response) => {
    const { name } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user.id,
        { name },
        { new: true }
    ).select("-password");

    res.json(user);
};



export const getAllUsers = async (_: Request, res: Response) => {
  const users = await User.find().select("-password");
  res.json(users);
};
