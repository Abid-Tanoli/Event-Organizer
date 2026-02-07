import mongoose, { Types } from "mongoose";

export interface TicketModel {
  event: Types.ObjectId;
  user: Types.ObjectId;
  organizer: Types.ObjectId;
  bookingReference: string;
  tickets: Array<{
    ticketType: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  totalAmount: number;
  serviceFee: number;
  finalAmount: number;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: string;
  paymentIntentId?: string;
  transactionId?: string;
  bookingStatus: "confirmed" | "cancelled" | "attended" | "no-show";
  attendeeInfo: {
    name: string;
    email: string;
    phone: string;
  };
  qrCode?: string;
  checkInTime?: Date;
  cancellationReason?: string;
  refundAmount?: number;
  refundDate?: Date;
  notes?: string;
}

const ticketSchema = new mongoose.Schema<TicketModel>(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organizer",
      required: true,
      index: true,
    },
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
    },
    tickets: [
      {
        ticketType: {
          type: String,
          required: true,
          trim: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        subtotal: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    serviceFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      trim: true,
    },
    paymentIntentId: {
      type: String,
      trim: true,
    },
    transactionId: {
      type: String,
      trim: true,
      index: true,
    },
    bookingStatus: {
      type: String,
      enum: ["confirmed", "cancelled", "attended", "no-show"],
      default: "confirmed",
      index: true,
    },
    attendeeInfo: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
    },
    qrCode: {
      type: String,
      trim: true,
    },
    checkInTime: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    refundAmount: {
      type: Number,
      min: 0,
    },
    refundDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

ticketSchema.index({ user: 1, bookingStatus: 1 });
ticketSchema.index({ event: 1, bookingStatus: 1 });
ticketSchema.index({ organizer: 1, paymentStatus: 1 });

ticketSchema.pre("save", function (next) {
  if (!this.bookingReference) {
    this.bookingReference = `BK${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  }
  next();
});

export const Ticket = mongoose.model<TicketModel>("Ticket", ticketSchema);