import { Request, Response } from "express";
import { Types } from "mongoose";
import { ZodIssue } from "zod";
import {
  CreateEventInput,
  createEventSchema,
  UpdateEventInput,
  updateEventSchema,
  UpdateEventStatusInput,
  updateEventStatusSchema,
  ToggleFeatureInput,
  toggleFeatureSchema,
} from "./event.schema";
import { Event } from "./event.model";
import { Organizer } from "../organizer/organizer.model";

export const createEvent = async (
  req: Request<{}, {}, CreateEventInput>,
  res: Response
) => {
  try {
    const parsed = createEventSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.issues.map((err: ZodIssue) => err.message),
      });
    }

    const organizer = await Organizer.findById(parsed.data.organizer);
    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: "Organizer not found",
      });
    }

    if (organizer.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Only approved organizers can create events",
      });
    }

    const totalTickets = parsed.data.ticketTypes.reduce(
      (sum, ticket) => sum + ticket.quantity,
      0
    );

    const eventData = {
      ...parsed.data,
      totalTickets,
      availableTickets: totalTickets,
      soldTickets: 0,
    };

    const event = await Event.create(eventData);

    await Organizer.findByIdAndUpdate(parsed.data.organizer, {
      $inc: { totalEvents: 1 },
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};

export const getEventById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event id",
      });
    }

    const event = await Event.findById(id)
      .populate("organizer", "organizationName logo rating")
      .populate("category", "name icon");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    await Event.findByIdAndUpdate(id, { $inc: { views: 1 } });

    return res.status(200).json({
      success: true,
      message: "Event fetched successfully",
      data: event,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const {
      category,
      organizer,
      status,
      eventType,
      city,
      country,
      search,
      minPrice,
      maxPrice,
      startDate,
      endDate,
      isFeatured,
      page = 1,
      limit = 12,
      sortBy = "eventDate",
      sortOrder = "asc",
    } = req.query;

    const query: any = {};

    if (category) query.category = category;
    if (organizer) query.organizer = organizer;
    if (status) query.status = status;
    if (eventType) query.eventType = eventType;
    if (city) query["venue.city"] = new RegExp(city as string, "i");
    if (country) query["venue.country"] = new RegExp(country as string, "i");
    if (isFeatured) query.isFeatured = isFeatured === "true";

    if (search) {
      query.$text = { $search: search as string };
    }

    if (startDate || endDate) {
      query.eventDate = {};
      if (startDate) query.eventDate.$gte = new Date(startDate as string);
      if (endDate) query.eventDate.$lte = new Date(endDate as string);
    }

    if (minPrice || maxPrice) {
      query["ticketTypes.price"] = {};
      if (minPrice) query["ticketTypes.price"].$gte = Number(minPrice);
      if (maxPrice) query["ticketTypes.price"].$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === "desc" ? -1 : 1;

    const events = await Event.find(query)
      .populate("organizer", "organizationName logo rating")
      .populate("category", "name icon")
      .skip(skip)
      .limit(Number(limit))
      .sort(sortOptions);

    const total = await Event.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Events fetched successfully",
      data: {
        events,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};

export const getPublicEvents = async (req: Request, res: Response) => {
  try {
    const {
      category,
      eventType,
      city,
      country,
      search,
      minPrice,
      maxPrice,
      isFeatured,
      page = 1,
      limit = 12,
      sortBy = "eventDate",
    } = req.query;

    const query: any = {
      status: "approved",
      isPublished: true,
      eventDate: { $gte: new Date() },
    };

    if (category) query.category = category;
    if (eventType) query.eventType = eventType;
    if (city) query["venue.city"] = new RegExp(city as string, "i");
    if (country) query["venue.country"] = new RegExp(country as string, "i");
    if (isFeatured) query.isFeatured = isFeatured === "true";

    if (search) {
      query.$text = { $search: search as string };
    }

    if (minPrice || maxPrice) {
      query["ticketTypes.price"] = {};
      if (minPrice) query["ticketTypes.price"].$gte = Number(minPrice);
      if (maxPrice) query["ticketTypes.price"].$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const events = await Event.find(query)
      .populate("organizer", "organizationName logo rating")
      .populate("category", "name icon")
      .skip(skip)
      .limit(Number(limit))
      .sort({ [sortBy as string]: 1 });

    const total = await Event.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Public events fetched successfully",
      data: {
        events,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};

export const getFeaturedEvents = async (req: Request, res: Response) => {
  try {
    const { limit = 6 } = req.query;

    const events = await Event.find({
      status: "approved",
      isPublished: true,
      isFeatured: true,
      eventDate: { $gte: new Date() },
    })
      .populate("organizer", "organizationName logo rating")
      .populate("category", "name icon")
      .limit(Number(limit))
      .sort({ eventDate: 1 });

    return res.status(200).json({
      success: true,
      message: "Featured events fetched successfully",
      data: events,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};

export const getEventsByOrganizer = async (
  req: Request<{ organizerId: string }>,
  res: Response
) => {
  try {
    const { organizerId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    if (!Types.ObjectId.isValid(organizerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organizer id",
      });
    }

    const query: any = { organizer: organizerId };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const events = await Event.find(query)
      .populate("category", "name icon")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Event.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Organizer events fetched successfully",
      data: {
        events,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};

export const updateEvent = async (
  req: Request<{ id: string }, {}, UpdateEventInput>,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event id",
      });
    }

    const parsed = updateEventSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.issues.map((err: ZodIssue) => err.message),
      });
    }

    const updateData: any = { ...parsed.data };

    if (parsed.data.ticketTypes) {
      const totalTickets = parsed.data.ticketTypes.reduce(
        (sum, ticket) => sum + ticket.quantity,
        0
      );
      updateData.totalTickets = totalTickets;
    }

    const updated = await Event.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("organizer", "organizationName logo rating")
      .populate("category", "name icon");

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};

export const updateEventStatus = async (
  req: Request<{ id: string }, {}, UpdateEventStatusInput>,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event id",
      });
    }

    const parsed = updateEventStatusSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.issues.map((err: ZodIssue) => err.message),
      });
    }

    const updateData: any = { status: parsed.data.status };

    if (parsed.data.status === "rejected" && parsed.data.rejectionReason) {
      updateData.rejectionReason = parsed.data.rejectionReason;
    }

    if (parsed.data.status === "approved") {
      updateData.rejectionReason = undefined;
    }

    const updated = await Event.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate("organizer", "organizationName logo rating")
      .populate("category", "name icon");

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Event status updated to ${parsed.data.status}`,
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};

export const toggleFeatured = async (
  req: Request<{ id: string }, {}, ToggleFeatureInput>,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event id",
      });
    }

    const parsed = toggleFeatureSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.issues.map((err: ZodIssue) => err.message),
      });
    }

    const updated = await Event.findByIdAndUpdate(
      id,
      { $set: { isFeatured: parsed.data.isFeatured } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Event ${parsed.data.isFeatured ? "featured" : "unfeatured"} successfully`,
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};

export const deleteEvent = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event id",
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.soldTickets > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete event with sold tickets",
      });
    }

    await Event.findByIdAndDelete(id);

    await Organizer.findByIdAndUpdate(event.organizer, {
      $inc: { totalEvents: -1 },
    });

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};

export const incrementEventLikes = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event id",
      });
    }

    const updated = await Event.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event liked successfully",
      data: { likes: updated.likes },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};

export const incrementEventShares = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event id",
      });
    }

    const updated = await Event.findByIdAndUpdate(
      id,
      { $inc: { sharesCount: 1 } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event share counted successfully",
      data: { sharesCount: updated.sharesCount },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};