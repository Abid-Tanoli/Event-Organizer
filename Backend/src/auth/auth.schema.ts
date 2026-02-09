import z from "zod";

export const registerSchema = z.object({
    name: z.string()
        .min(3, 'Name must be at least 3 characters')
        .max(50, 'Name cannot exceed 50 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string()
        .min(6, 'Password must be at least 6 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    role: z.enum(["user", "organizer"]).optional(),
});


export const loginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password is required')
});