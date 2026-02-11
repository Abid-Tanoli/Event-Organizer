import { Request, Response } from "express";
import { Types } from "mongoose";
import { ZodIssue } from "zod";
import {
  CreateOrganizerInput,
  createOrganizerSchema,
  UpdateOrganizerInput,
  updateOrganizerSchema,
  UpdateOrganizerStatusInput,
  updateOrganizerStatusSchema,
} from "./organizer.schema";
import { Organizer } from "./organizer.model";

export const createOrganizer = async (
  req: Request<{}, {}, CreateOrganizerInput>,
  res: Response
) => {
  try {
    const parsed = createOrganizerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.issues.map((err: ZodIssue) => err.message),
      });
    }

    // Check if organizer already exists for this user
    const existingOrganizer = await Organizer.findOne({ user: parsed.data.user });
    if (existingOrganizer) {
      return res.status(400).json({
        success: false,
        message: "Organizer profile already exists for this user",
      });
    }

    const organizer = await Organizer.create(parsed.data);

    return res.status(201).json({
      success: true,
      message: "Organizer created successfully. Pending admin approval.",
      data: organizer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};

export const getOrganizerById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organizer id",
      });
    }

    const organizer = await Organizer.findById(id).populate("user", "name email");

    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: "Organizer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Organizer fetched successfully",
      data: organizer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};

export const getOrganizerByUserId = async (
  req: Request<{ userId: string }>,
  res: Response
) => {
  try {
    const { userId } = req.params;

    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const organizer = await Organizer.findOne({ user: userId }).populate("user", "name email");

    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: "Organizer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Organizer fetched successfully",
      data: organizer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};

export const getAllOrganizers = async (
  req: Request,
  res: Response
) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const organizers = await Organizer.find(query)
      .populate("user", "name email")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Organizer.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Organizers fetched successfully",
      data: {
        organizers,
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

export const getApprovedOrganizers = async (
  req: Request,
  res: Response
) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    const query: any = { status: "approved" };

    if (search) {
      query.$text = { $search: search as string };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const organizers = await Organizer.find(query)
      .populate("user", "name email")
      .skip(skip)
      .limit(Number(limit))
      .sort({ rating: -1, createdAt: -1 });

    const total = await Organizer.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Approved organizers fetched successfully",
      data: {
        organizers,
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

export const updateOrganizer = async (
  req: Request<{ id: string }, {}, UpdateOrganizerInput>,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organizer id",
      });
    }

    const parsed = updateOrganizerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.issues.map((err: ZodIssue) => err.message),
      });
    }

    const updated = await Organizer.findByIdAndUpdate(
      id,
      { $set: parsed.data },
      { new: true, runValidators: true }
    ).populate("user", "name email");

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Organizer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Organizer updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};

export const updateOrganizerStatus = async (
  req: Request<{ id: string }, {}, UpdateOrganizerStatusInput>,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organizer id",
      });
    }

    const parsed = updateOrganizerStatusSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.issues.map((err: ZodIssue) => err.message),
      });
    }

    const updateData: any = { status: parsed.data.status };

    if (parsed.data.status === "approved") {
      updateData.isVerified = true;
      updateData.rejectionReason = undefined;
    }

    if (parsed.data.status === "rejected" && parsed.data.rejectionReason) {
      updateData.rejectionReason = parsed.data.rejectionReason;
    }

    const updated = await Organizer.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("user", "name email");

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Organizer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Organizer status updated to ${parsed.data.status}`,
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};

export const deleteOrganizer = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organizer id",
      });
    }

    const deleted = await Organizer.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Organizer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Organizer deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};

export const getOrganizerStats = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organizer id",
      });
    }

    const organizer = await Organizer.findById(id);

    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: "Organizer not found",
      });
    }

    const stats = {
      totalEvents: organizer.totalEvents,
      rating: organizer.rating,
      status: organizer.status,
      isVerified: organizer.isVerified,
    };

    return res.status(200).json({
      success: true,
      message: "Organizer stats fetched successfully",
      data: stats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error,
    });
  }
};