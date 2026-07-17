import { Router } from "express";
import {
  cancelTicket,
  checkInTicket,
  createTicket,
  getTicketById,
  getTicketByReference,
  getTicketsByEvent,
  getTicketsByOrganizer,
  getTicketsByUser,
  getTicketStats,
  updateTicket,
  getAllTickets,
} from "./ticket.controller";
import { protect } from "../auth/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";

const router: Router = Router();

// Authenticated user routes - booking, viewing own tickets
router.post("/create", protect, createTicket as any);
router.get("/reference/:reference", protect, getTicketByReference as any);
router.get("/get/:id", protect, getTicketById as any);
router.get("/user/:userId", protect, getTicketsByUser as any);
router.post("/cancel/:id", protect, cancelTicket as any);

// Organizer routes - view tickets for their events
router.get("/organizer/:organizerId", protect, allowRoles("organizer", "admin"), getTicketsByOrganizer as any);

// Admin-only routes
router.get("/all", protect, allowRoles("admin"), getAllTickets as any);
router.get("/event/:eventId", protect, allowRoles("admin"), getTicketsByEvent as any);
router.get("/stats/:eventId", protect, allowRoles("admin"), getTicketStats as any);
router.post("/checkin", protect, allowRoles("admin"), checkInTicket as any);
router.put("/update/:id", protect, allowRoles("admin"), updateTicket as any);

export default router;
