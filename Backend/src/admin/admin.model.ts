import { Admin, IAdmin } from "./admin.schema";
import bcrypt from "bcryptjs";

export const createAdmin = async (name: string, email: string, password: string): Promise<IAdmin> => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return Admin.create({ name, email, password: hashedPassword, role: "admin", isVerified: true });
};

export const findAdminByEmail = (email: string) => Admin.findOne({ email });
export const getAllAdmins = () => Admin.find();
export const deleteAdminById = (id: string) => Admin.findByIdAndDelete(id);
