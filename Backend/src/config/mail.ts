import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const smtpConfig: SMTPTransport.Options = {
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.MAIL_PORT) || 587,
  secure: process.env.MAIL_SECURE === "true" || false,
  auth: {
    user: process.env.MAIL_USER || "",
    pass: process.env.MAIL_PASSWORD || "",
  },
};

export const mailConfig = smtpConfig;