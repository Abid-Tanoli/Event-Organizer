import { Router } from "express";
import {
  createPaymentIntent,
  getOrganizerEarnings,
  getPaymentHistory,
  handleWebhook,
  processRefund,
  verifyPayment,
} from "./payment.controller";

const router: Router = Router();

router.post("/create-intent", createPaymentIntent);
router.post("/verify", verifyPayment);
router.get("/history/:userId", getPaymentHistory);
router.get("/earnings/:organizerId", getOrganizerEarnings);
router.post("/refund/:ticketId", processRefund);
router.post("/webhook", handleWebhook);

export default router;