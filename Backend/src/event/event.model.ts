import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITicketType {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  soldCount?: number;
}

export interface IVenue {
  name: string;
  address: string;
  city: string;
  country: string;
  coordinates?: { latitude: number; longitude: number };
}

export interface IFaq {
  question: string;
  answer: string;
}

export interface IEvent extends Document {
  organizer: Types.ObjectId;
  category: Types.ObjectId;
  title: string;
  description: string;
  shortDescription: string;
  coverImage: string;
  images: string[];
  venue: IVenue;
  eventDate: Date;
  endDate?: Date;
  eventTime: string;
  endTime?: string;
  ticketTypes: ITicketType[];
  totalTickets: number;
  availableTickets: number;
  soldTickets: number;
  tags: string[];
  ageRestriction?: number;
  eventType: "online" | "offline" | "hybrid";
  meetingLink?: string;
  refundPolicy: string;
  termsAndConditions: string;
  faq?: IFaq[];
  status: "draft" | "pending" | "approved" | "rejected" | "cancelled" | "completed";
  isFeatured: boolean;
  isPublished: boolean;
  views: number;
  likes: number;
  sharesCount: number;
}

const EventSchema = new Schema<IEvent>(
  {
    organizer: { type: Schema.Types.ObjectId, ref: "Organizer", required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    shortDescription: { type: String, required: true },
    coverImage: { type: String, required: true },
    images: [{ type: String }],
    venue: { type: Object, required: true },
    eventDate: { type: Date, required: true },
    endDate: { type: Date },
    eventTime: { type: String, required: true },
    endTime: { type: String },
    ticketTypes: [{ type: Object, required: true }],
    totalTickets: { type: Number, required: true },
    availableTickets: { type: Number, required: true },
    soldTickets: { type: Number, default: 0 },
    tags: [{ type: String }],
    ageRestriction: { type: Number },
    eventType: { type: String, enum: ["online", "offline", "hybrid"], default: "offline" },
    meetingLink: { type: String, default: "" },
    refundPolicy: { type: String, required: true },
    termsAndConditions: { type: String, required: true },
    faq: [{ type: Object }],
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected", "cancelled", "completed"],
      default: "draft",
    },
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Event = mongoose.model<IEvent>("Event", EventSchema);
