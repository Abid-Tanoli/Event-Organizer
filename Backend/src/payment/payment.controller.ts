import { Request, Response } from "express";
import { Types } from "mongoose";
import { Ticket } from "../ticket/ticket.model";

interface CreatePaymentIntentInput {
  ticketId: Types.ObjectId;
  amount: number;
}

interface VerifyPaymentInput {
  ticketId: Types.ObjectId;
  paymentIntentId: string;
}

export const createPaymentIntent = async (req: any, res: any) => {
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
      currency: "usd",
    };

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

export const verifyPayment = async (req: any, res: any) => {
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

export const handleWebhook = async (req: any, res: any) => {
  try {
    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Webhook error: " + error,
    });
  }
};

export const processRefund = async (req: any, res: any) => {
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

export const getPaymentHistory = async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
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

export const getOrganizerEarnings = async (req: any, res: any) => {
  try {
    const { organizerId } = req.params;
    const { startDate, endDate } = req.query;

    if (!Types.ObjectId.isValid(organizerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organizer id",
      });
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