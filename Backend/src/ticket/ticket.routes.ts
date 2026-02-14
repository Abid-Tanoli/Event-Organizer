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
} from "./ticket.controller";

const router: Router = Router();

router.get("/reference/:reference", getTicketByReference as any);
router.post("/create", createTicket as any);
router.get("/get/:id", getTicketById as any);
router.get("/user/:userId", getTicketsByUser as any);
router.post("/cancel/:id", cancelTicket as any);
router.get("/event/:eventId", getTicketsByEvent as any);
router.get("/organizer/:organizerId", getTicketsByOrganizer as any);
router.get("/stats/:eventId", getTicketStats as any);
router.post("/checkin", checkInTicket as any);
router.put("/update/:id", updateTicket as any);

export default router;