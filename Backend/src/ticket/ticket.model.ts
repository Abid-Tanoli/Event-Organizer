import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  seats: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  bookingReference: { type: String, required: true, unique: true },
  status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" },
}, { timestamps: true });

export const Ticket = mongoose.model("Ticket", ticketSchema);