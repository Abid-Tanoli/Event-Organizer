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
  createCategory
);

router.get("/", protect, getCategories);

router.put(
  "/:id",
  protect,
  allowRoles("admin"),
  validate(categorySchema),
  updateCategory
);

router.delete(
  "/:id",
  protect,
  allowRoles("admin"),
  deleteCategory
);

export default router;

