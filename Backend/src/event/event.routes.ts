import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getEventById,
  getEventsByOrganizer,
  getFeaturedEvents,
  getPublicEvents,
  incrementEventLikes,
  incrementEventShares,
  toggleFeatured,
  updateEvent,
  updateEventStatus,
} from "./event.controller";

const router = Router();

router.get("/public", getPublicEvents);
router.get("/featured", getFeaturedEvents);
router.get("/get/:id", getEventById);
router.post("/like/:id", incrementEventLikes);
router.post("/share/:id", incrementEventShares);
router.post("/create", createEvent);
router.get("/organizer/:organizerId", getEventsByOrganizer);
router.put("/update/:id", updateEvent);
router.get("/all", getAllEvents);
router.put("/status/:id", updateEventStatus);
router.put("/featured/:id", toggleFeatured);
router.delete("/delete/:id", deleteEvent);

export default router;