import { Router } from "express";
import { createAdminController, getAdminsController, deleteAdminController } from "./admin.controller";

const router = Router();

// Create new admin
router.post("/create", createAdminController as any);

// Get all admins
router.get("/all", getAdminsController as any);

// Delete admin
router.delete("/:id", deleteAdminController as any);

export default router;
