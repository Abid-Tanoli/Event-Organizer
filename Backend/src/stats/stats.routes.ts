import { Router } from "express";
import { getStatsSummary } from "./stats.controller";

const router = Router();

router.get("/summary", getStatsSummary);

export default router;
