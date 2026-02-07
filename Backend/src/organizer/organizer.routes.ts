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

const router: Router = Router();

router.get("/approved", getApprovedOrganizers);
router.get("/get/:id", getOrganizerById);
router.post("/create", createOrganizer);
router.get("/user/:userId", getOrganizerByUserId);
router.get("/stats/:id", getOrganizerStats);
router.put("/update/:id", updateOrganizer);
router.get("/all", getAllOrganizers);
router.put("/status/:id", updateOrganizerStatus);
router.delete("/delete/:id", deleteOrganizer);

export default router;