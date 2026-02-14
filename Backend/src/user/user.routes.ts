import { Router } from "express";
import { getMe, updateMe, getAllUsers } from "./user.controller";
import { protect } from "../auth/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { updateUserSchema } from "./user.schema";

const router: Router = Router();

router.get("/me", protect, getMe as any);
router.put("/me", protect, validate(updateUserSchema), updateMe as any);
router.get("/", protect, allowRoles("admin"), getAllUsers as any);

export default router;