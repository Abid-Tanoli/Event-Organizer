import { z } from "zod";
import { Types } from "mongoose";

export const objectIdSchema = z.custom<Types.ObjectId>(
  (val) => Types.ObjectId.isValid(val as any),
  { message: "Invalid ObjectId" }
);

const socialMediaSchema = z.object({
  facebook: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
}).optional();

const addressSchema = z.object({
  country: z.string().trim().min(1, "Country is required"),
  city: z.string().trim().min(1, "City is required"),
  postalCode: z.string().trim(),
  addressLine: z.string().trim(),
});

const bankDetailsSchema = z.object({
  accountHolderName: z.string().trim().min(1, "Account holder name is required"),
  accountNumber: z.string().trim().min(1, "Account number is required"),
  bankName: z.string().trim().min(1, "Bank name is required"),
  ifscCode: z.string().trim().min(1, "IFSC code is required"),
}).optional();

export const createOrganizerSchema = z.object({
  user: objectIdSchema,
  organizationName: z.string().trim(),
  description: z.string().trim(),
  contactEmail: z.string().email("Invalid email address").trim().toLowerCase(),
  contactPhone: z.string().trim().min(10, "Phone number must be at least 10 digits"),
  website: z.string().url().optional().or(z.literal("")),
  logo: z.string().url().optional().or(z.literal("")),
  socialMedia: socialMediaSchema,
  address: addressSchema,
  verificationDocuments: z.array(z.string().url()).optional().default([]),
  bankDetails: bankDetailsSchema,
});

export const updateOrganizerSchema = z.object({
  organizationName: z.string().trim().min(3).max(100).optional(),
  description: z.string().trim().min(50).max(2000).optional(),
  contactEmail: z.string().email().trim().toLowerCase().optional(),
  contactPhone: z.string().trim().min(10).optional(),
  website: z.string().url().optional().or(z.literal("")),
  logo: z.string().url().optional().or(z.literal("")),
  socialMedia: socialMediaSchema,
  address: addressSchema.partial().optional(),
  verificationDocuments: z.array(z.string().url()).optional(),
  bankDetails: bankDetailsSchema,
  rating: z.number().min(0).max(5).optional(),
});

export const updateOrganizerStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "suspended"]),
  rejectionReason: z.string().trim().optional(),
});

export type CreateOrganizerInput = z.infer<typeof createOrganizerSchema>;
export type UpdateOrganizerInput = z.infer<typeof updateOrganizerSchema>;
export type UpdateOrganizerStatusInput = z.infer<typeof updateOrganizerStatusSchema>;