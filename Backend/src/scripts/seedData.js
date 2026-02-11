const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  name: String,
  icon: String,
}, { timestamps: true });

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  category: mongoose.Schema.Types.ObjectId,
  date: Date,
  time: String,
  location: String,
  city: String,
  price: Number,
  totalSeats: Number,
  availableSeats: Number,
  status: String,
  isFeatured: Boolean,
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const Category = mongoose.model("Category", categorySchema);
const Event = mongoose.model("Event", eventSchema);

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Event.deleteMany({});

    // Create admin
    const hashedPassword = await bcrypt.hash("Admin@123", 10);
    await User.create({
      name: "Admin",
      email: "admin@eventhub.com",
      password: hashedPassword,
      role: "admin",
    });
    console.log("✅ Admin created (admin@eventhub.com / Admin@123)");

    // Create categories
    const categories = await Category.insertMany([
      { name: "Music", icon: "🎵" },
      { name: "Sports", icon: "⚽" },
      { name: "Technology", icon: "💻" },
      { name: "Food", icon: "🍔" },
      { name: "Art", icon: "🎨" },
    ]);
    console.log("✅ Categories created");

    // Create events
    await Event.insertMany([
      {
        title: "Summer Music Festival 2026",
        description: "Three days of amazing music with top artists",
        image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3",
        category: categories[0]._id,
        date: new Date("2026-07-15"),
        time: "14:00",
        location: "Central Park, New York",
        city: "New York",
        price: 99,
        totalSeats: 5000,
        availableSeats: 5000,
        status: "approved",
        isFeatured: true,
      },
      {
        title: "Tech Summit 2026",
        description: "Leading technology conference",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
        category: categories[2]._id,
        date: new Date("2026-09-20"),
        time: "09:00",
        location: "Convention Center, San Francisco",
        city: "San Francisco",
        price: 299,
        totalSeats: 1000,
        availableSeats: 1000,
        status: "approved",
        isFeatured: true,
      },
      {
        title: "Food Festival",
        description: "Taste cuisines from around the world",
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1",
        category: categories[3]._id,
        date: new Date("2026-08-10"),
        time: "12:00",
        location: "Downtown LA",
        city: "Los Angeles",
        price: 49,
        totalSeats: 3000,
        availableSeats: 3000,
        status: "approved",
        isFeatured: false,
      },
    ]);
    console.log("✅ Events created\n");

    console.log("🎉 Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

seed();