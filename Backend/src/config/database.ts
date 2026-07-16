import mongoose from "mongoose";

// Cache the connection for Vercel serverless reuse
let cachedConnection: typeof mongoose | null = null;

export const connectDB = async (): Promise<void> => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) throw new Error("MongoDB connection string (MONGO_URI) is not defined in .env");

    cachedConnection = await mongoose.connect(mongoURI);
    console.log("✅ MongoDB connected successfully");
    console.log(`📊 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected");
  cachedConnection = null;
});
mongoose.connection.on("error", (err) => console.error("❌ MongoDB error:", err));
