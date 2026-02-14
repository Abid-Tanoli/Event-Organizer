import { Request, Response } from "express";
import { createAdmin, findAdminByEmail, getAllAdmins, deleteAdminById } from "./admin.model";

export const createAdminController = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existing = await findAdminByEmail(email);
    if (existing) res.status(400).json({ success: false, message: "Admin already exists" });

    const admin = await createAdmin(name, email, password);
    res.status(201).json({ success: true, message: "Admin created", data: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

export const getAdminsController = async (_req: Request, res: Response) => {
  try {
    const admins = await getAllAdmins();
    res.json({ success: true, data: admins });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

export const deleteAdminController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteAdminById(id);
    res.json({ success: true, message: "Admin deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
