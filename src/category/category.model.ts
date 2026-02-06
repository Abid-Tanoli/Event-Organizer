import { Schema, model, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;  // added
}

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true }  // make sure 'name' exists
}, { timestamps: true });

export const Category = model<ICategory>("Category", categorySchema);
