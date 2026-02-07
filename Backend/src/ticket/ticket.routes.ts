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

router.get("/reference/:reference", getTicketByReference);
router.post("/create", createTicket);
router.get("/get/:id", getTicketById);
router.get("/user/:userId", getTicketsByUser);
router.post("/cancel/:id", cancelTicket);
router.get("/event/:eventId", getTicketsByEvent);
router.get("/organizer/:organizerId", getTicketsByOrganizer);
router.get("/stats/:eventId", getTicketStats);
router.post("/checkin", checkInTicket);
router.put("/update/:id", updateTicket);

export default router;