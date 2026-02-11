import mongoose from "mongoose";
import dotenv from "dotenv";
import { Event } from "../event/event.model";
import { Category } from "../category/category.model";
import { User } from "../user/user.model";

dotenv.config();

const seedEvents = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    const categories = await Category.find();
    const admin = await User.findOne({ role: "admin" });

    if (!admin) {
      throw new Error("Admin not found. Please create admin first.");
    }

    const musicCategory = categories.find(c => c.name === "Music");
    const techCategory = categories.find(c => c.name === "Technology");

    if (!musicCategory || !techCategory) {
      throw new Error("Required categories not found.");
    }

    await Event.deleteMany({});

    await Event.insertMany([
      {
        title: "Music Festival 2026",
        description: "Biggest music event of the year.",
        location: "Karachi",
        date: new Date("2026-03-15"),
        price: 2000,
        totalSeats: 500,
        availableSeats: 500,
        category: musicCategory._id,
        organizer: admin._id,
      },
      {
        title: "Tech Conference 2026",
        description: "Latest tech trends and innovations.",
        location: "Lahore",
        date: new Date("2026-04-10"),
        price: 3000,
        totalSeats: 300,
        availableSeats: 300,
        category: techCategory._id,
        organizer: admin._id,
      },
    ]);

    console.log("✅ Events seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding events:", error);
    process.exit(1);
  }
};

seedEvents();
