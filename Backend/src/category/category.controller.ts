import { Request, Response } from "express";
import { Category } from "../category/category.model";

// ------------------------ CREATE CATEGORY ------------------------
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

    return res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Category creation failed", error: error.message });
  }
};

// ------------------------ GET ALL CATEGORIES ------------------------
export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find();

    return res.json({
      message: "Categories fetched successfully",
      categories,
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Failed to fetch categories", error: error.message });
  }
};

// ------------------------ UPDATE CATEGORY ------------------------
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.json({
      message: "Category updated successfully",
      category,
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Category update failed", error: error.message });
  }
};

// ------------------------ DELETE CATEGORY ------------------------
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.json({
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Category deletion failed", error: error.message });
  }
};
