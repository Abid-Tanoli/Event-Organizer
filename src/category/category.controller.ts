import { Request, Response } from "express";
import { Category } from "../category/category.model";

// ------------------------ CREATE CATEGORY ------------------------
export const createCategory = async (req: any, res: Response) => {
  try {
    const { name } = req.body;

    // Check if category already exists
    const exist = await Category.findOne({ name });
    if (exist) {
      return res.status(400).json({ message: "Category already exists" });
    }

    // Create category
    const category = await Category.create({ name });

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Category creation failed", error: error.message });
  }
};

// ------------------------ GET ALL CATEGORIES ------------------------
export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find();

    res.json({
      message: "Categories fetched successfully",
      categories,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch categories", error: error.message });
  }
};
