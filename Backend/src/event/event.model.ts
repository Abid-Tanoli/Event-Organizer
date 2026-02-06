import mongoose, { Types } from "mongoose";

export interface EventModel {
  organizer: Types.ObjectId;
  category: Types.ObjectId;
  title: string;
  description: string;
  shortDescription: string;
  coverImage: string;
  images: string[];
  venue: {
    name: string;
    address: string;
    city: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  eventDate: Date;
  eventTime: string;
  endDate?: Date;
  endTime?: string;
  ticketTypes: Array<{
    name: string;
    description: string;
    price: number;
    quantity: number;
    soldCount: number;
    maxPerOrder: number;
    salesStartDate?: Date;
    salesEndDate?: Date;
  }>;
  totalTickets: number;
  soldTickets: number;
  availableTickets: number;
  tags: string[];
  ageRestriction?: number;
  eventType: "online" | "offline" | "hybrid";
  meetingLink?: string;
  status: "draft" | "pending" | "approved" | "rejected" | "cancelled" | "completed";
  rejectionReason?: string;
  isFeatured: boolean;
  isSoldOut: boolean;
  isPublished: boolean;
  views: number;
  likes: number;
  sharesCount: number;
  refundPolicy: string;
  termsAndConditions: string;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
}

const eventSchema = new mongoose.Schema<EventModel>(
  {
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organizer",
      required: true,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    coverImage: {
      type: String,
      required: true,
      trim: true,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    venue: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },
      country: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },
      coordinates: {
        latitude: { type: Number },
        longitude: { type: Number },
      },
    },
    eventDate: {
      type: Date,
      required: true,
      index: true,
    },
    eventTime: {
      type: String,
      required: true,
      trim: true,
    },
    endDate: {
      type: Date,
    },
    endTime: {
      type: String,
      trim: true,
    },
    ticketTypes: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        soldCount: {
          type: Number,
          default: 0,
          min: 0,
        },
        maxPerOrder: {
          type: Number,
          default: 10,
          min: 1,
        },
        salesStartDate: {
          type: Date,
        },
        salesEndDate: {
          type: Date,
        },
      },
    ],
    totalTickets: {
      type: Number,
      required: true,
      min: 1,
    },
    soldTickets: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableTickets: {
      type: Number,
      required: true,
      min: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    ageRestriction: {
      type: Number,
      min: 0,
      max: 100,
    },
    eventType: {
      type: String,
      enum: ["online", "offline", "hybrid"],
      required: true,
      default: "offline",
    },
    meetingLink: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected", "cancelled", "completed"],
      default: "draft",
      index: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isSoldOut: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    sharesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    refundPolicy: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    termsAndConditions: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    faq: [
      {
        question: {
          type: String,
          required: true,
          trim: true,
        },
        answer: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
  },
  { timestamps: true }
);

// Text index for search functionality
eventSchema.index({ title: "text", description: "text", tags: "text" });

// Compound indexes for common queries
eventSchema.index({ status: 1, eventDate: 1 });
eventSchema.index({ category: 1, eventDate: 1 });
eventSchema.index({ organizer: 1, status: 1 });

// Pre-save middleware to update available tickets
eventSchema.pre("save", function (next) {
  if (this.isModified("soldTickets") || this.isModified("totalTickets")) {
    this.availableTickets = this.totalTickets - this.soldTickets;
    this.isSoldOut = this.availableTickets <= 0;
  }
  next();
});

export const Event = mongoose.model<EventModel>("Event", eventSchema);