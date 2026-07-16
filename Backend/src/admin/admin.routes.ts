import { Router } from "express";
import { createAdminController, getAdminsController, deleteAdminController } from "./admin.controller";
import { adminAuth, protect } from "../auth/auth.middleware";

const router = Router();

router.post("/create", protect, adminAuth, createAdminController as any);
router.get("/all", protect, adminAuth, getAdminsController as any);
router.delete("/:id", protect, adminAuth, deleteAdminController as any);

export default router;