import mongoose from "mongoose";

export const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log("DB connected successfully");
    } catch (error) {
        console.log("DB connection failed", error);
    }
};
