import { Response, NextFunction } from "express";

export const allowRoles =
  (...roles: string[]) =>
  (req: any, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({ success: false, message: "Forbidden" });

    return next();
  };
