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
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
  return app(req, res);
};

export default handler;
