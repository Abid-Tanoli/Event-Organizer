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

router.post("/create", createEvent);
router.get("/all", getAllEvents);
router.get("/featured", getFeaturedEvents);
router.put("/status/:id", updateEventStatus);
router.put("/featured/:id", toggleFeatured);
router.post("/like/:id", likeEvent);
router.post("/share/:id", shareEvent);
router.get("/:id", getEventById);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;
