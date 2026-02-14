import { Request, Response } from "express";
import { Types } from "mongoose";
import { Event } from "./event.model";
import { Organizer } from "../organizer/organizer.model";

export const createEvent = async (req: Request, res: Response) => {
  try {
    const { organizer: organizerId, ticketTypes, ...rest } = req.body;

    if (!organizerId || !ticketTypes?.length) {
      return res.status(400).json({ success: false, message: "Organizer and tickets required" });
    }

    if (!Types.ObjectId.isValid(organizerId)) {
      return res.status(400).json({ success: false, message: "Invalid organizer ID" });
    }

    const organizer = await Organizer.findById(organizerId);
    if (!organizer || organizer.status !== "approved") {
      return res.status(403).json({ success: false, message: "Organizer not approved" });
    }

    const totalTickets = ticketTypes.reduce((sum: number, t: any) => sum + t.quantity, 0);

    const event = await Event.create({
      organizer: organizerId,
      ticketTypes,
      totalTickets,
      availableTickets: totalTickets,
      soldTickets: 0,
      ...rest,
    });

    await Organizer.findByIdAndUpdate(organizerId, { $inc: { totalEvents: 1 } });

    return res.status(201).json({ success: true, message: "Event created", data: event });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error: " + error });
  }
};

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const { search, category, eventType, status, page = "1", limit = "6" } = req.query;

    const filter: any = {};

    if (search) {
      filter.title = { $regex: search as string, $options: "i" };
    }
    if (category) {
      filter.category = category;
    }
    if (eventType) {
      filter.eventType = eventType;
    }
    if (status) {
      filter.status = status;
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit as string, 10) || 6);
    const skip = (pageNum - 1) * limitNum;

    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate("organizer", "organizationName")
        .populate("category", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Event.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return res.json({
      success: true,
      data: events,
      total,
      page: pageNum,
      totalPages,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getEventById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const event = await Event.findById(id)
      .populate("organizer", "organizationName")
      .populate("category", "name");

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    await Event.findByIdAndUpdate(id, { $inc: { views: 1 } });

    return res.json({ success: true, data: event });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateEvent = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const updated = await Event.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    return res.json({ success: true, message: "Event updated", data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateEventStatus = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const allowedStatuses = ["draft", "pending", "approved", "rejected", "cancelled", "completed"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const updated = await Event.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    return res.json({ success: true, message: `Status updated to ${status}`, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const toggleFeatured = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const updated = await Event.findByIdAndUpdate(id, { isFeatured }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    return res.json({ success: true, message: `Event ${isFeatured ? "featured" : "unfeatured"}`, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteEvent = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    if (event.soldTickets > 0) {
      return res.status(400).json({ success: false, message: "Cannot delete event with sold tickets" });
    }

    await Event.findByIdAndDelete(id);
    await Organizer.findByIdAndUpdate(event.organizer, { $inc: { totalEvents: -1 } });

    return res.json({ success: true, message: "Event deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getFeaturedEvents = async (_req: Request, res: Response) => {
  try {
    const events = await Event.find({ isFeatured: true, status: "approved" })
      .populate("organizer", "organizationName")
      .populate("category", "name");

    return res.json({ success: true, data: events });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const likeEvent = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid ID" });

    const event = await Event.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true });
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    return res.json({ success: true, data: event });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const shareEvent = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid ID" });

    const event = await Event.findByIdAndUpdate(id, { $inc: { shares: 1 } }, { new: true });
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    return res.json({ success: true, data: event });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
