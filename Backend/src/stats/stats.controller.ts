import { Response } from "express";
import { Event } from "../event/event.schema";
import { User } from "../user/user.model";
import { Ticket } from "../ticket/ticket.model";
import { Organizer } from "../organizer/organizer.model";
import { AuthRequest } from "../auth/auth.middleware";

export const getStatsSummary = async (
  _req: AuthRequest,
  res: Response
) => {
  try {
    const [totalEvents, totalUsers, totalOrganizers, ticketsAgg] = await Promise.all([
      Event.countDocuments({ status: "approved", isPublished: true }),
      User.countDocuments({ role: "user" }),
      Organizer.countDocuments(),
      Ticket.aggregate([
        { $match: { paymentStatus: "completed" } },
        {
          $group: {
            _id: null,
            totalTicketsSold: { $sum: { $sum: "$tickets.quantity" } },
            totalRevenue: { $sum: "$finalAmount" },
          },
        },
      ]),
    ]);

    const stats = ticketsAgg[0] || { totalTicketsSold: 0, totalRevenue: 0 };

    return res.status(200).json({
      success: true,
      message: "Stats fetched successfully",
      data: {
        totalEvents,
        totalUsers,
        totalOrganizers,
        totalTicketsSold: stats.totalTicketsSold,
        totalRevenue: stats.totalRevenue,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};
