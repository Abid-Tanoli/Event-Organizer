import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getEventById,
  getFeaturedEvents,
  likeEvent,
  shareEvent,
  toggleFeatured,
  updateEvent,
  updateEventStatus,
} from "./event.controller";
import { protect } from "../auth/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

// Public routes - anyone can browse events
router.get("/all", getAllEvents as any);
router.get("/featured", getFeaturedEvents as any);
router.get("/:id", getEventById as any);

// Authenticated user routes
router.post("/like/:id", protect, likeEvent as any);
router.post("/share/:id", protect, shareEvent as any);

// Organizer + Admin routes (organizer creates/updates their own events)
router.post("/create", protect, allowRoles("organizer", "admin"), upload.single("coverImage"), createEvent as any);
router.put("/:id", protect, allowRoles("organizer", "admin"), upload.single("coverImage"), updateEvent as any);

// Admin-only routes (approval, featuring, deletion, status)
router.put("/status/:id", protect, allowRoles("admin"), updateEventStatus as any);
router.put("/featured/:id", protect, allowRoles("admin"), toggleFeatured as any);
router.delete("/:id", protect, allowRoles("admin"), deleteEvent as any);

export default router;
