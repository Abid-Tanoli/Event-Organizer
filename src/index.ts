import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./config/db";


// Routes
import authRoutes from "./auth/auth.routes";
import userRoutes from "./user/user.routes";
import categoryRoutes from "./category/category.route";

dotenv.config();

const app = express();

// Body parser
app.use(express.json());

// Connect Database
connectDb();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/category", categoryRoutes);

// Health check route
app.get("/", (_req, res) => {
  res.send("Server is running ✅");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server connected on port ${PORT}`);
});
