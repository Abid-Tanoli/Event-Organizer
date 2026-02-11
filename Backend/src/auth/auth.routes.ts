import { Router } from "express";
import type { Router as ExpressRouter } from "express";

import { register, login } from "./auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema } from "./auth.schema";

const router: ExpressRouter = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

export default router;
