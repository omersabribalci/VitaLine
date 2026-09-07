import "dotenv/config";
import connectDatabase = require("../config/database");
const logger = require("../middleware/logger");
import User = require("../models/User");
import getErrorMessage = require("../utils/getErrorMessage");
import { getRequiredEnv } from "../config/env";
import type { UserDocumentShape } from "../types";

type AdminSeedData = Pick<
  UserDocumentShape,
  "name" | "email" | "password" | "phone" | "image"
>;

const createAdminUser = async (adminData: AdminSeedData) => {
  const { name, email, password, phone, image } = adminData;
  try {
    await connectDatabase();

    const adminUser = {
      name: name,
      email: email,
      password: password,
      role: "admin" as const,
      phone: phone,
      image: image,
    };

    const admin = await User.create(adminUser);
    logger.info(`Admin user created: ${admin.email}`);
    process.exit(0);
  } catch (error) {
    logger.error(`Failed to create Admin User: ${getErrorMessage(error)}`);
    process.exit(1);
  }
};

const adminData = {
  name: getRequiredEnv("ADMIN_NAME"),
  email: getRequiredEnv("ADMIN_EMAIL"),
  password: getRequiredEnv("ADMIN_PASSWORD"),
  phone: getRequiredEnv("ADMIN_PHONE"),
  image: process.env.ADMIN_IMAGE ?? "",
};

createAdminUser(adminData);
