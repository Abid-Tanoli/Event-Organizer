import { Router } from "express";
import {
  createOrganizer,
  deleteOrganizer,
  getAllOrganizers,
  getApprovedOrganizers,
  getOrganizerById,
  getOrganizerByUserId,
  getOrganizerStats,
  updateOrganizer,
  updateOrganizerStatus,
} from "./organizer.controller";
import { protect } from "../auth/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";

const router: Router = Router();

// Public routes - anyone can browse
router.get("/approved", getApprovedOrganizers as any);
router.get("/get/:id", getOrganizerById as any);
router.get("/stats/:id", getOrganizerStats as any);

// Authenticated routes - user must be logged in
router.post("/create", protect, createOrganizer as any);
router.get("/user/:userId", protect, getOrganizerByUserId as any);
router.put("/update/:id", protect, updateOrganizer as any);

// Admin-only routes
router.get("/all", protect, allowRoles("admin"), getAllOrganizers as any);
router.put("/status/:id", protect, allowRoles("admin"), updateOrganizerStatus as any);
router.delete("/delete/:id", protect, allowRoles("admin"), deleteOrganizer as any);

export default router;
