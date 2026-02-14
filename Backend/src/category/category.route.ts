import { Router } from "express";
import { createCategory, getCategories, updateCategory, deleteCategory } from "./category.controller";
import { validate } from "../middlewares/validate.middleware";
import { categorySchema } from "./category.schema";
import { protect } from "../auth/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";

const router = Router();


router.post(
  "/",
  protect,
  allowRoles("admin"),
  validate(categorySchema),
  createCategory as any
);

router.get("/", protect, getCategories as any);

router.put(
  "/:id",
  protect,
  allowRoles("admin"),
  validate(categorySchema),
  updateCategory as any
);

router.delete(
  "/:id",
  protect,
  allowRoles("admin"),
  deleteCategory as any
);

export default router;

