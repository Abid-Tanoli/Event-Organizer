import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../user/user.model";
import { Admin } from "../admin/admin.schema";
import { JWT_EXPIRES_IN, BCRYPT_SALT_ROUNDS } from "../config/constants";

const createAuthPayload = (entity: any, role = entity.role) => ({
  token: jwt.sign(
    { id: entity._id, role },
    process.env.JWT_SECRET!,
    { expiresIn: JWT_EXPIRES_IN as any }
  ),
  user: {
    _id: entity._id,
    name: entity.name,
    email: entity.email,
    role,
  },
});

const ensureJwtSecret = (res: Response) => {
  if (process.env.JWT_SECRET) return true;

  res.status(500).json({
    success: false,
    message: "JWT_SECRET not configured",
  });
  return false;
};

export const register = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    if (!ensureJwtSecret(res)) return;

    return res.status(201).json({
      success: true,
      message: "Registered successfully",
      data: createAuthPayload(user),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Register failed",
      error: error.message,
    });
  }
};

export const login = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!ensureJwtSecret(res)) return;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: createAuthPayload(user),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

export const adminLogin = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!ensureJwtSecret(res)) return;

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: createAuthPayload(admin, "admin"),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Admin login failed",
      error: error.message,
    });
  }
};