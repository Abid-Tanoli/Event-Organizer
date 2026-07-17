export const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "7d";

export const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

export const SERVICE_FEE_PERCENT = parseFloat(process.env.SERVICE_FEE_PERCENT || "0.05");

export const CURRENCY = process.env.CURRENCY || "usd";

export const DEFAULT_PAYMENT_METHOD = "card";

export const EVENTS_PER_PAGE = parseInt(process.env.EVENTS_PER_PAGE || "6", 10);
