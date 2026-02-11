import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User } from "../user/user.model";

dotenv.config();

const createAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    const existingAdmin = await User.findOne({ email: "admin@eventhub.com" });

    if (existingAdmin) {
      console.log("❌ Admin already exists!");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await User.create({
      name: "Admin User",
      email: "admin@eventhub.com",
      password: hashedPassword,
      role: "admin",
      isVerified: true,
    });

    console.log("✅ Admin created successfully!");
    console.log("📧 Email: admin@eventhub.com");
    console.log("🔑 Password: Admin@123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

createAdmin();
