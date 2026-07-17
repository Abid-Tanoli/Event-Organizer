import { Admin, IAdmin } from "./admin.schema";
import bcrypt from "bcryptjs";
import { BCRYPT_SALT_ROUNDS } from "../config/constants";

export const createAdmin = async (name: string, email: string, password: string): Promise<IAdmin> => {
  const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  return Admin.create({ name, email, password: hashedPassword, role: "admin", isVerified: true });
};

export const findAdminByEmail = (email: string) => Admin.findOne({ email });
export const getAllAdmins = () => Admin.find();
export const deleteAdminById = (id: string) => Admin.findByIdAndDelete(id);
