import { TransportOptions } from "nodemailer";

// Mail configuration for Nodemailer
// Note: Install nodemailer: npm install nodemailer @types/nodemailer

export const mailConfig: TransportOptions = {
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.MAIL_PORT) || 587,
  secure: process.env.MAIL_SECURE === "true" || false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER || "", // Your email address
    pass: process.env.MAIL_PASSWORD || "", // Your email password or app password
  },
};

