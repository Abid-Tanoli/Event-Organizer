import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
    (schema: ZodSchema) =>
        (req: Request, res: Response, next: NextFunction) => {
            try {
                schema.parse(req.body);
                next();
            } catch (err: any) {
                res.status(400).json({
                    success: false,
                    message: "Validation Error",
                    errors: err.issues?.map((i: any) => i.message) || ["Validation failed"],
                });
            }
        };
