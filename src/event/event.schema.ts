import { z } from "zod";
import { Types } from "mongoose";

export const objectIdSchema = z.custom<Types.ObjectId>(
  (val) => Types.ObjectId.isValid(val as any),
  { message: "Invalid ObjectId" }
);

const ticketTypeSchema = z.object({
  name: z.string().trim().min(1, "Ticket type name is required"),
  description: z.string().trim().optional(),
  price: z.number().min(0, "Price cannot be negative"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  soldCount: z.number().int().min(0).default(0).optional(),
  maxPerOrder: z.number().int().min(1).default(10).optional(),
  salesStartDate: z.coerce.date().optional(),
  salesEndDate: z.coerce.date().optional(),
});

const venueSchema = z.object({
  name: z.string().trim().min(1, "Venue name is required"),
  address: z.string().trim().min(1, "Venue address is required"),
  city: z.string().trim().min(1, "City is required"),
  country: z.string().trim().min(1, "Country is required"),
  coordinates: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    })
    .optional(),
});

const faqSchema = z.object({
  question: z.string().trim().min(1, "Question is required"),
  answer: z.string().trim().min(1, "Answer is required"),
});

export const createEventSchema = z.object({
  organizer: objectIdSchema,
  category: objectIdSchema,
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().trim().min(50, "Description must be at least 50 characters").max(5000),
  shortDescription: z.string().trim().min(10, "Short description must be at least 10 characters").max(300),
  coverImage: z.string().url("Invalid cover image URL"),
  images: z.array(z.string().url()).optional().default([]),
  venue: venueSchema,
  eventDate: z.coerce.date().refine((date) => date > new Date(), {
    message: "Event date must be in the future",
  }),
  eventTime: z.string().trim().min(1, "Event time is required"),
  endDate: z.coerce.date().optional(),
  endTime: z.string().trim().optional(),
  ticketTypes: z.array(ticketTypeSchema).min(1, "At least one ticket type is required"),
  tags: z.array(z.string().trim().toLowerCase()).optional().default([]),
  ageRestriction: z.number().int().min(0).max(100).optional(),
  eventType: z.enum(["online", "offline", "hybrid"]).default("offline"),
  meetingLink: z.string().url().optional().or(z.literal("")),
  refundPolicy: z.string().trim().min(10, "Refund policy is required").max(1000),
  termsAndConditions: z.string().trim().min(10, "Terms and conditions are required").max(2000),
  faq: z.array(faqSchema).optional(),
});

export const updateEventSchema = z.object({
  category: objectIdSchema.optional(),
  title: z.string().trim().min(5).max(200).optional(),
  description: z.string().trim().min(50).max(5000).optional(),
  shortDescription: z.string().trim().min(10).max(300).optional(),
  coverImage: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  venue: venueSchema.partial().optional(),
  eventDate: z.coerce.date().optional(),
  eventTime: z.string().trim().optional(),
  endDate: z.coerce.date().optional(),
  endTime: z.string().trim().optional(),
  ticketTypes: z.array(ticketTypeSchema).optional(),
  tags: z.array(z.string().trim().toLowerCase()).optional(),
  ageRestriction: z.number().int().min(0).max(100).optional(),
  eventType: z.enum(["online", "offline", "hybrid"]).optional(),
  meetingLink: z.string().url().optional().or(z.literal("")),
  refundPolicy: z.string().trim().min(10).max(1000).optional(),
  termsAndConditions: z.string().trim().min(10).max(2000).optional(),
  faq: z.array(faqSchema).optional(),
  isPublished: z.boolean().optional(),
});

export const updateEventStatusSchema = z.object({
  status: z.enum(["draft", "pending", "approved", "rejected", "cancelled", "completed"]),
  rejectionReason: z.string().trim().optional(),
});

export const toggleFeatureSchema = z.object({
  isFeatured: z.boolean(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type UpdateEventStatusInput = z.infer<typeof updateEventStatusSchema>;
export type ToggleFeatureInput = z.infer<typeof toggleFeatureSchema>;