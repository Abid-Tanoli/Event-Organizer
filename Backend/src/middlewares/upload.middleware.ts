import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Memory storage for Cloudinary (used when CLOUDINARY_* env vars are set)
const memoryStorage = multer.memoryStorage();

// Disk storage fallback for local dev without Cloudinary
const diskStorage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (err: Error | null, dest: string) => void) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (err: Error | null, filename: string) => void) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: (err: Error | null, acceptFile?: boolean) => void) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) cb(null, true);
  else cb(new Error("Only images are allowed"));
};

const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

export const upload = multer({
  storage: isCloudinaryConfigured ? memoryStorage : diskStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
