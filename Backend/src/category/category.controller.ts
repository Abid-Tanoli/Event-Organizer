import { Request, Response } from "express";
import { Category } from "../category/category.model";

export const createCategory = async (req: any, res: Response) => {
  try {
    const { name } = req.body;

    const exist = await Category.findOne({ name });
    if (exist) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }

    const category = await Category.create({ name });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Category creation failed" });
  }
};

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find();

    return res.json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
};

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
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    return res.json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Category update failed" });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    return res.json({
      success: true,
      message: "Category deleted successfully",
      data: null,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: "Category deletion failed" });
  }
};
