import { z } from "zod";
import { Types } from "mongoose";

export const objectIdSchema = z.custom<Types.ObjectId>(
  (val) => Types.ObjectId.isValid(val as any),
  { message: "Invalid ObjectId" }
);

const ticketItemSchema = z.object({
  ticketType: z.string().trim().min(1, "Ticket type is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price cannot be negative"),
  subtotal: z.number().min(0, "Subtotal cannot be negative"),
});

export const createTicketSchema = z.object({
  event: objectIdSchema,
  user: objectIdSchema,
  organizer: objectIdSchema,
  tickets: z.array(ticketItemSchema).min(1, "At least one ticket is required"),
  totalAmount: z.number().min(0, "Total amount cannot be negative"),
  serviceFee: z.number().min(0).default(0).optional(),
  finalAmount: z.number().min(0, "Final amount cannot be negative"),
  paymentMethod: z.string().trim().min(1, "Payment method is required"),
  paymentIntentId: z.string().trim().optional(),
  attendeeInfo: z.object({
    name: z.string().trim().min(1, "Attendee name is required"),
    email: z.string().email("Invalid email address").trim().toLowerCase(),
    phone: z.string().trim().min(10, "Phone number must be at least 10 digits"),
  }),
  notes: z.string().trim().max(500).optional(),
});

export const updateTicketSchema = z.object({
  paymentStatus: z.enum(["pending", "completed", "failed", "refunded"]).optional(),
  bookingStatus: z.enum(["confirmed", "cancelled", "attended", "no-show"]).optional(),
  transactionId: z.string().trim().optional(),
  qrCode: z.string().trim().optional(),
  checkInTime: z.coerce.date().optional(),
  cancellationReason: z.string().trim().optional(),
  refundAmount: z.number().min(0).optional(),
  refundDate: z.coerce.date().optional(),
  notes: z.string().trim().max(500).optional(),
});

export const cancelTicketSchema = z.object({
  cancellationReason: z.string().trim().min(1, "Cancellation reason is required"),
});

export const checkInSchema = z.object({
  bookingReference: z.string().trim().min(1, "Booking reference is required"),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type CancelTicketInput = z.infer<typeof cancelTicketSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;