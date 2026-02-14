import { Router } from "express";
import { createAdminController, getAdminsController, deleteAdminController } from "./admin.controller";

const router = Router();

// Create new admin
router.post("/create", createAdminController);

// Get all admins
router.get("/all", getAdminsController);

// Delete admin
router.delete("/:id", deleteAdminController);

export default router;
