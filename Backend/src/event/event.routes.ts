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

const router = Router();

router.post("/create", createEvent as any);
router.get("/all", getAllEvents as any);
router.get("/featured", getFeaturedEvents as any);
router.put("/status/:id", updateEventStatus as any);
router.put("/featured/:id", toggleFeatured as any);
router.post("/like/:id", likeEvent as any);
router.post("/share/:id", shareEvent as any);
router.get("/:id", getEventById as any);
router.put("/:id", updateEvent as any);
router.delete("/:id", deleteEvent as any);

export default router;
