import mongoose from "mongoose";

const bookedTicketSchema = new mongoose.Schema({
  ticketType: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  subtotal: { type: Number, required: true },
}, { _id: false });

const attendeeInfoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
}, { _id: false });

const ticketSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: "Organizer", required: true },
  bookingReference: { type: String, required: true, unique: true },
  tickets: [bookedTicketSchema],
  totalAmount: { type: Number, required: true },
  serviceFee: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  },
  paymentMethod: { type: String, default: "card" },
  paymentIntentId: { type: String },
  transactionId: { type: String },
  bookingStatus: {
    type: String,
    enum: ["confirmed", "cancelled", "attended", "no-show"],
    default: "confirmed",
  },
  attendeeInfo: attendeeInfoSchema,
  qrCode: { type: String },
  checkInTime: { type: Date },
  cancellationReason: { type: String },
  refundAmount: { type: Number },
  refundDate: { type: Date },
  notes: { type: String },
}, { timestamps: true });

export const Ticket = mongoose.model("Ticket", ticketSchema);