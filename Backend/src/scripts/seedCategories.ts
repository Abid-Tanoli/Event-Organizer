import mongoose from "mongoose";
import dotenv from "dotenv";
import { Category } from "../category/category.model";

dotenv.config();

const seedCategories = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    await Category.deleteMany({});

    await Category.insertMany([
      { name: "Music" },
      { name: "Technology" },
      { name: "Sports" },
      { name: "Business" },
      { name: "Education" },
    ]);

    console.log("✅ Categories seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    process.exit(1);
  }
};

seedCategories();
