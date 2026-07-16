import { Request, Response } from "express";
import { createAdmin, findAdminByEmail, getAllAdmins, deleteAdminById } from "./admin.model";

export const createAdminController = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existing = await findAdminByEmail(email);
    if (existing) return res.status(400).json({ success: false, message: "Admin already exists" });

    const admin = await createAdmin(name, email, password);
    return res.status(201).json({ success: true, message: "Admin created", data: admin });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error });
  }
};

export const getAdminsController = async (_req: Request, res: Response) => {
  try {
    const admins = await getAllAdmins();
    return res.json({ success: true, message: "Admins fetched", data: admins });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error });
  }
};

export const deleteAdminController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteAdminById(id);
    return res.json({ success: true, message: "Admin deleted", data: null });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error });
  }
};
