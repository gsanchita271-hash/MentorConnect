import dotenv from "dotenv";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { Auth } from "./model/auth.models.js";
import { DB_NAME } from "./constants.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );

    const email = "sanchitag271@gmail.com";
    const password = "sanchita9967";

    const existingAdmin = await Auth.findOne({ email });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Auth.create({
      name: "Admin",
      email,
      password: hashedPassword,
      role: "Admin",
      isApproved: true,
    });

    console.log("Admin created successfully");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createAdmin();