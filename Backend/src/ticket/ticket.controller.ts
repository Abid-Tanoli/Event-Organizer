import { Response } from "express";
import { Types } from "mongoose";
import { ZodIssue } from "zod";
import {
  CreateTicketInput,
  createTicketSchema,
  UpdateTicketInput,
  updateTicketSchema,
  CancelTicketInput,
  cancelTicketSchema,
  CheckInInput,
  checkInSchema,
} from "./ticket.schema";
import { Ticket } from "./ticket.model";
import { Event, ITicketType } from "../event/event.schema";
import { Organizer } from "../organizer/organizer.model";
import { AuthRequest } from "../auth/auth.middleware";

export const createTicket = async (
  req: AuthRequest<{}, {}, CreateTicketInput>,
  res: Response
) => {
  try {
    const parsed = createTicketSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.issues.map((err: ZodIssue) => err.message),
      });
    }

    const event = await Event.findById(parsed.data.event);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.status !== "approved" || !event.isPublished) {
      return res.status(400).json({
        success: false,
        message: "Event is not available for booking",
      });
    }

    const totalRequestedTickets = parsed.data.tickets.reduce(
      (sum, ticket) => sum + ticket.quantity,
      0
    );

    if (totalRequestedTickets > event.availableTickets) {
      return res.status(400).json({
        success: false,
        message: "Not enough tickets available",
      });
    }

    for (const requestedTicket of parsed.data.tickets) {
      const eventTicketType = (event.ticketTypes as ITicketType[]).find(
        (tt: ITicketType) => tt.name === requestedTicket.ticketType
      );

      if (!eventTicketType) {
        return res.status(400).json({
          success: false,
          message: `Ticket type "${requestedTicket.ticketType}" not found`,
        });
      }

      const available = eventTicketType.quantity - (eventTicketType.soldCount || 0);
      if (requestedTicket.quantity > available) {
        return res.status(400).json({
          success: false,
          message: `Only ${available} tickets available for ${requestedTicket.ticketType}`,
        });
      }

      const maxPerOrder = eventTicketType.maxPerOrder || 10;
      if (requestedTicket.quantity > maxPerOrder) {
        return res.status(400).json({
          success: false,
          message: `Maximum ${maxPerOrder} tickets allowed per order for ${requestedTicket.ticketType}`,
        });
      }
    }

    // Generate a unique booking reference
    const bookingReference = `EH-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

    const ticket = await Ticket.create({
      ...parsed.data,
      bookingReference,
    });

    for (const bookedTicket of parsed.data.tickets) {
      const ticketTypeIndex = (event.ticketTypes as ITicketType[]).findIndex(
        (tt: ITicketType) => tt.name === bookedTicket.ticketType
      );
      if (ticketTypeIndex !== -1) {
        event.ticketTypes[ticketTypeIndex].soldCount! += bookedTicket.quantity;
      }
    }

    event.soldTickets += totalRequestedTickets;
    event.availableTickets = event.totalTickets - event.soldTickets;
    event.isSoldOut = event.availableTickets <= 0;

    await event.save();

    return res.status(201).json({
      success: true,
      message: "Ticket booked successfully",
      data: ticket,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};

export const getTicketById = async (req: AuthRequest<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket id",
      });
    }

    const ticket = await Ticket.findById(id)
      .populate("event", "title eventDate eventTime venue coverImage")
      .populate("user", "name email")
      .populate("organizer", "organizationName contactEmail");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Ownership check: users can only view their own tickets (unless admin)
    if (req.user!.role !== "admin" && ticket.user._id.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own tickets",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ticket fetched successfully",
      data: ticket,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};

export const getTicketByReference = async (
  req: AuthRequest<{ reference: string }>,
  res: Response
) => {
  try {
    const { reference } = req.params;

    const ticket = await Ticket.findOne({ bookingReference: reference.toUpperCase() })
      .populate("event", "title eventDate eventTime venue coverImage")
      .populate("user", "name email")
      .populate("organizer", "organizationName contactEmail");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Ownership check: users can only look up their own tickets (unless admin)
    if (req.user!.role !== "admin" && ticket.user._id.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: "You can only look up your own tickets",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ticket fetched successfully",
      data: ticket,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};

export const getTicketsByUser = async (
  req: AuthRequest<{ userId: string }>,
  res: Response
) => {
  try {
    const { userId } = req.params;
    const { bookingStatus, paymentStatus, page = 1, limit = 10 } = req.query;

    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    // Ownership check: users can only view their own tickets (unless admin)
    if (req.user!.role !== "admin" && userId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own tickets",
      });
    }

    const query: any = { user: userId };
    if (bookingStatus) query.bookingStatus = bookingStatus;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const skip = (Number(page) - 1) * Number(limit);

    const tickets = await Ticket.find(query)
      .populate("event", "title eventDate eventTime venue coverImage")
      .populate("organizer", "organizationName")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Ticket.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Tickets fetched successfully",
      data: {
        tickets,
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

export const getTicketsByEvent = async (
  req: AuthRequest<{ eventId: string }>,
  res: Response
) => {
  try {
    const { eventId } = req.params;
    const { bookingStatus, paymentStatus, page = 1, limit = 10 } = req.query;

    if (!Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event id",
      });
    }

    const query: any = { event: eventId };
    if (bookingStatus) query.bookingStatus = bookingStatus;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const skip = (Number(page) - 1) * Number(limit);

    const tickets = await Ticket.find(query)
      .populate("user", "name email")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Ticket.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Event tickets fetched successfully",
      data: {
        tickets,
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

export const getTicketsByOrganizer = async (
  req: AuthRequest<{ organizerId: string }>,
  res: Response
) => {
  try {
    const { organizerId } = req.params;
    const { bookingStatus, paymentStatus, page = 1, limit = 10 } = req.query;

    if (!Types.ObjectId.isValid(organizerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organizer id",
      });
    }

    // Ownership check: organizers can only view tickets for their own organizer profile (unless admin)
    if (req.user!.role !== "admin") {
      const organizer = await Organizer.findById(organizerId);
      if (!organizer || organizer.user.toString() !== req.user!.id) {
        return res.status(403).json({
          success: false,
          message: "You can only view tickets for your own events",
        });
      }
    }

    const query: any = { organizer: organizerId };
    if (bookingStatus) query.bookingStatus = bookingStatus;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const skip = (Number(page) - 1) * Number(limit);

    const tickets = await Ticket.find(query)
      .populate("event", "title eventDate eventTime")
      .populate("user", "name email")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Ticket.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Organizer tickets fetched successfully",
      data: {
        tickets,
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

export const updateTicket = async (
  req: AuthRequest<{ id: string }, {}, UpdateTicketInput>,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket id",
      });
    }

    const parsed = updateTicketSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.issues.map((err: ZodIssue) => err.message),
      });
    }

    const updated = await Ticket.findByIdAndUpdate(
      id,
      { $set: parsed.data },
      { new: true, runValidators: true }
    )
      .populate("event", "title eventDate eventTime venue")
      .populate("user", "name email");

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ticket updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};

export const cancelTicket = async (
  req: AuthRequest<{ id: string }, {}, CancelTicketInput>,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket id",
      });
    }

    const parsed = cancelTicketSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.issues.map((err: ZodIssue) => err.message),
      });
    }

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Ownership check: users can only cancel their own tickets (unless admin)
    if (req.user!.role !== "admin" && ticket.user.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own tickets",
      });
    }

    if (ticket.bookingStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Ticket is already cancelled",
      });
    }

    if (ticket.bookingStatus === "attended") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel attended ticket",
      });
    }

    ticket.bookingStatus = "cancelled";
    ticket.cancellationReason = parsed.data.cancellationReason;
    await ticket.save();

    const event = await Event.findById(ticket.event);
    if (event) {
      const totalCancelledTickets = ticket.tickets.reduce(
        (sum, t) => sum + t.quantity,
        0
      );

      for (const cancelledTicket of ticket.tickets) {
        const ticketTypeIndex = (event.ticketTypes as ITicketType[]).findIndex(
          (tt: ITicketType) => tt.name === cancelledTicket.ticketType
        );
        if (ticketTypeIndex !== -1) {
          event.ticketTypes[ticketTypeIndex].soldCount! -= cancelledTicket.quantity;
        }
      }

      event.soldTickets -= totalCancelledTickets;
      event.availableTickets = event.totalTickets - event.soldTickets;
      event.isSoldOut = event.availableTickets <= 0;

      await event.save();
    }

    return res.status(200).json({
      success: true,
      message: "Ticket cancelled successfully",
      data: ticket,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};

export const checkInTicket = async (
  req: AuthRequest<{}, {}, CheckInInput>,
  res: Response
) => {
  try {
    const parsed = checkInSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.issues.map((err: ZodIssue) => err.message),
      });
    }

    const ticket = await Ticket.findOne({
      bookingReference: parsed.data.bookingReference.toUpperCase(),
    }).populate("event", "title eventDate eventTime");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    if (ticket.bookingStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "This ticket has been cancelled",
      });
    }

    if (ticket.bookingStatus === "attended") {
      return res.status(400).json({
        success: false,
        message: "This ticket has already been checked in",
        data: { checkInTime: ticket.checkInTime },
      });
    }

    if (ticket.paymentStatus !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Payment is not completed for this ticket",
      });
    }

    ticket.bookingStatus = "attended";
    ticket.checkInTime = new Date();
    await ticket.save();

    return res.status(200).json({
      success: true,
      message: "Check-in successful",
      data: ticket,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};

export const getTicketStats = async (
  req: AuthRequest<{ eventId: string }>,
  res: Response
) => {
  try {
    const { eventId } = req.params;

    if (!Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event id",
      });
    }

    const totalBookings = await Ticket.countDocuments({ event: eventId });
    const confirmedBookings = await Ticket.countDocuments({
      event: eventId,
      bookingStatus: "confirmed",
    });
    const cancelledBookings = await Ticket.countDocuments({
      event: eventId,
      bookingStatus: "cancelled",
    });
    const attendedBookings = await Ticket.countDocuments({
      event: eventId,
      bookingStatus: "attended",
    });

    const revenueData = await Ticket.aggregate([
      {
        $match: {
          event: new Types.ObjectId(eventId),
          paymentStatus: "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$finalAmount" },
          totalServiceFees: { $sum: "$serviceFee" },
        },
      },
    ]);

    const revenue = revenueData[0] || {
      totalRevenue: 0,
      totalServiceFees: 0,
    };

    return res.status(200).json({
      success: true,
      message: "Ticket stats fetched successfully",
      data: {
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        attendedBookings,
        totalRevenue: revenue.totalRevenue,
        totalServiceFees: revenue.totalServiceFees,
        netRevenue: revenue.totalRevenue - revenue.totalServiceFees,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};

export const getAllTickets = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const tickets = await Ticket.find()
      .populate("event", "title eventDate eventTime venue")
      .populate("user", "name email")
      .populate("organizer", "organizationName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};