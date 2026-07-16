import dotenv from "dotenv";
dotenv.config();

import app from "../src/index";
import { connectDB } from "../src/config/database";
import mongoose from "mongoose";

let dbConnected = false;

app.use(async (_req: any, res: any, next: any) => {
  if (!dbConnected) {
    try {
      if (mongoose.connection.readyState !== 1) {
        await connectDB();
      }
      dbConnected = true;
    } catch (err) {
      console.error("DB connection failed in middleware:", err);
    }
  }
  next();
});

export default app;
