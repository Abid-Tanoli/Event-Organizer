import { Response } from "express";
import { Types } from "mongoose";
import { Event } from "./event.schema";
import { Organizer } from "../organizer/organizer.model";
import { AuthRequest } from "../auth/auth.middleware";
import { EVENTS_PER_PAGE } from "../config/constants";

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { organizer: organizerId, ticketTypes: _rawTicketTypes, ...rest } = req.body;

    // Parse JSON string fields that come via FormData
    let ticketTypes = req.body.ticketTypes;
    let parsedVenue = rest.venue;
    let parsedTags = rest.tags;
    try {
      if (typeof ticketTypes === "string") ticketTypes = JSON.parse(ticketTypes);
      if (typeof rest.venue === "string") parsedVenue = JSON.parse(rest.venue);
      if (typeof rest.tags === "string") parsedTags = JSON.parse(rest.tags);
    } catch { /* use as-is */ }

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

    // Ownership check: if requester is organizer (not admin), the organizer profile must belong to them
    if (req.user!.role === "organizer" && organizer.user.toString() !== req.user!.id) {
      return res.status(403).json({ success: false, message: "You can only create events for your own organizer profile" });
    }

    const totalTickets = ticketTypes.reduce((sum: number, t: any) => sum + t.quantity, 0);

    // Handle file upload from multer
    const coverImage = req.file ? `/uploads/${req.file.filename}` : (rest.coverImage || "");

    const event = await Event.create({
      organizer: organizerId,
      ticketTypes,
      totalTickets,
      availableTickets: totalTickets,
      soldTickets: 0,
      coverImage,
      ...rest,
      venue: parsedVenue,
      tags: parsedTags,
    });

    await Organizer.findByIdAndUpdate(organizerId, { $inc: { totalEvents: 1 } });

    return res.status(201).json({ success: true, message: "Event created", data: event });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error: " + error });
  }
};

export const getAllEvents = async (req: AuthRequest, res: Response) => {
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
    const limitNum = Math.max(1, parseInt(limit as string, 10) || EVENTS_PER_PAGE);
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
      message: "Events fetched successfully",
      data: {
        events,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getEventById = async (req: AuthRequest<{ id: string }>, res: Response) => {
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

    return res.json({ success: true, message: "Event fetched successfully", data: event });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateEvent = async (req: AuthRequest<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Ownership check: if requester is organizer (not admin), the event must belong to their organizer profile
    if (req.user!.role === "organizer") {
      const organizer = await Organizer.findById(event.organizer);
      if (!organizer || organizer.user.toString() !== req.user!.id) {
        return res.status(403).json({ success: false, message: "You can only update your own events" });
      }
    }

    const updateData: any = { ...req.body };
    // Handle file upload from multer
    if (req.file) {
      updateData.coverImage = `/uploads/${req.file.filename}`;
    }
    // Parse JSON string fields that come via FormData
    try {
      if (typeof updateData.ticketTypes === "string") updateData.ticketTypes = JSON.parse(updateData.ticketTypes);
      if (typeof updateData.venue === "string") updateData.venue = JSON.parse(updateData.venue);
      if (typeof updateData.tags === "string") updateData.tags = JSON.parse(updateData.tags);
    } catch { /* use as-is */ }

    const updated = await Event.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    return res.json({ success: true, message: "Event updated", data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateEventStatus = async (req: AuthRequest<{ id: string }>, res: Response) => {
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

    const updateFields: any = { status };
    if (status === "approved") {
      updateFields.isPublished = true;
    } else if (status === "rejected" || status === "cancelled") {
      updateFields.isPublished = false;
    }

    const updated = await Event.findByIdAndUpdate(id, updateFields, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    return res.json({ success: true, message: `Status updated to ${status}`, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const toggleFeatured = async (req: AuthRequest<{ id: string }>, res: Response) => {
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

export const deleteEvent = async (req: AuthRequest<{ id: string }>, res: Response) => {
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

export const getFeaturedEvents = async (_req: AuthRequest, res: Response) => {
  try {
    const events = await Event.find({ isFeatured: true, status: "approved" })
      .populate("organizer", "organizationName")
      .populate("category", "name");

    return res.json({ success: true, message: "Featured events fetched successfully", data: events });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const likeEvent = async (req: AuthRequest<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid ID" });

    const event = await Event.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true });
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    return res.json({ success: true, message: "Event liked successfully", data: event });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const shareEvent = async (req: AuthRequest<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid ID" });

    const event = await Event.findByIdAndUpdate(id, { $inc: { sharesCount: 1 } }, { new: true });
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    return res.json({ success: true, message: "Event shared successfully", data: event });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
