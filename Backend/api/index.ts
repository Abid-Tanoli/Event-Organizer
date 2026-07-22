import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../src/config/database";
import app from "../src/index";

let dbConnected = false;

const ensureDB = async (_req: any, _res: any, next: any) => {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
    } catch (err) {
      console.error("DB connection failed:", err);
    }
  }
  next();
};

const handler = async (req: any, res: any) => {
  try {
    if (!dbConnected) {
      console.log("Connecting to DB...");
      console.log("MONGO_URI present:", !!process.env.MONGO_URI);
      console.log("NODE_ENV:", process.env.NODE_ENV);
      await connectDB();
      dbConnected = true;
      console.log("DB connected successfully");
    }
    return app(req, res);
  } catch (err: any) {
    console.error("Handler error:", err.message, err.stack);
    res.status(500).json({ success: false, message: err.message || "Internal server error" });
  }
};

export default handler;
