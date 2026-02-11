import { Router } from "express";
import { getMe, updateMe, getAllUsers } from "./user.controller";
import { protect } from "../auth/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { updateUserSchema } from "./user.schema";

const router: Router = Router();

router.get("/me", protect, getMe);
router.put("/me", protect, validate(updateUserSchema), updateMe);
router.get("/", protect, allowRoles("admin"), getAllUsers);

export default router;