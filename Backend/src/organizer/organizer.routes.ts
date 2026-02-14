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

router.get("/approved", getApprovedOrganizers as any);
router.get("/get/:id", getOrganizerById as any);
router.post("/create", createOrganizer as any);
router.get("/user/:userId", getOrganizerByUserId as any);
router.get("/stats/:id", getOrganizerStats as any);
router.put("/update/:id", updateOrganizer as any);
router.get("/all", getAllOrganizers as any);
router.put("/status/:id", updateOrganizerStatus as any);
router.delete("/delete/:id", deleteOrganizer as any);

export default router;