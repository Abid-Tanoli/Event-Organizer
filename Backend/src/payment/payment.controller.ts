import { Response } from "express";
import { Types } from "mongoose";
import { Ticket } from "../ticket/ticket.model";
import { Organizer } from "../organizer/organizer.model";
import { AuthRequest } from "../auth/auth.middleware";
import { CURRENCY } from "../config/constants";

export const createPaymentIntent = async (req: AuthRequest, res: Response) => {
  try {
    const { ticketId, amount } = req.body;

    if (!Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket id",
      });
    }

    const ticket = await Ticket.findById(ticketId).populate("event", "title");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    if (ticket.paymentStatus === "completed") {
      return res.status(400).json({
        success: false,
        message: "Payment already completed",
      });
    }

    const mockPaymentIntent = {
      id: `pi_mock_${Date.now()}`,
      client_secret: `pi_mock_secret_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency: CURRENCY,
    };

    // Ownership check: users can only create payment for their own tickets
    if (req.user!.role !== "admin" && ticket.user.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: "You can only pay for your own tickets",
      });
    }

    ticket.paymentIntentId = mockPaymentIntent.id;
    await ticket.save();

    return res.status(200).json({
      success: true,
      message: "Payment intent created successfully",
      data: {
        clientSecret: mockPaymentIntent.client_secret,
        paymentIntentId: mockPaymentIntent.id,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { ticketId, paymentIntentId } = req.body;

    if (!Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket id",
      });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Ownership check: users can only verify payment for their own tickets
    if (req.user!.role !== "admin" && ticket.user.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: "You can only verify payment for your own tickets",
      });
    }

    ticket.paymentStatus = "completed";
    ticket.transactionId = paymentIntentId;
    await ticket.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: ticket,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};

export const handleWebhook = async (_req: AuthRequest, res: Response) => {
  try {
    return res.status(200).json({ success: true, message: "Webhook received", data: { received: true } });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Webhook error: " + error,
    });
  }
};

export const processRefund = async (req: AuthRequest, res: Response) => {
  try {
    const { ticketId } = req.params;

    if (!Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket id",
      });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    if (ticket.paymentStatus !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot refund uncompleted payment",
      });
    }

    if (ticket.bookingStatus !== "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Ticket must be cancelled before refund",
      });
    }

    ticket.paymentStatus = "refunded";
    ticket.refundAmount = ticket.finalAmount;
    ticket.refundDate = new Date();
    await ticket.save();

    return res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      data: ticket,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};

export const getPaymentHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    // Ownership check: users can only view their own payment history
    if (req.user!.role !== "admin" && userId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own payment history",
      });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const payments = await Ticket.find({
      user: userId,
      paymentStatus: { $in: ["completed", "refunded"] },
    })
      .populate("event", "title eventDate coverImage")
      .select("bookingReference finalAmount paymentStatus paymentMethod transactionId createdAt")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Ticket.countDocuments({
      user: userId,
      paymentStatus: { $in: ["completed", "refunded"] },
    });

    return res.status(200).json({
      success: true,
      message: "Payment history fetched successfully",
      data: {
        payments,
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

export const getOrganizerEarnings = async (req: AuthRequest, res: Response) => {
  try {
    const { organizerId } = req.params;
    const { startDate, endDate } = req.query;

    if (!Types.ObjectId.isValid(organizerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organizer id",
      });
    }

    // Ownership check: organizers can only view their own earnings
    if (req.user!.role !== "admin") {
      const organizer = await Organizer.findById(organizerId);
      if (!organizer || organizer.user.toString() !== req.user!.id) {
        return res.status(403).json({
          success: false,
          message: "You can only view your own earnings",
        });
      }
    }

    const query: any = {
      organizer: organizerId,
      paymentStatus: "completed",
    };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    const earnings = await Ticket.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$finalAmount" },
          totalServiceFees: { $sum: "$serviceFee" },
          totalBookings: { $sum: 1 },
        },
      },
    ]);

    const result = earnings[0] || {
      totalEarnings: 0,
      totalServiceFees: 0,
      totalBookings: 0,
    };

    return res.status(200).json({
      success: true,
      message: "Organizer earnings fetched successfully",
      data: {
        totalEarnings: result.totalEarnings,
        totalServiceFees: result.totalServiceFees,
        netEarnings: result.totalEarnings - result.totalServiceFees,
        totalBookings: result.totalBookings,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};