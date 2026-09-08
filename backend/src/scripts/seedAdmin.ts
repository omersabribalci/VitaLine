import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase = require("../config/database");
const logger = require("../middleware/logger");
import User = require("../models/User");
import getErrorMessage = require("../utils/getErrorMessage");
import { getRequiredEnv } from "../config/env";
import type { UserDocumentShape } from "../types";

export type AdminSeedData = Pick<
  UserDocumentShape,
  "name" | "email" | "password" | "phone" | "image"
>;

export const seedAdminUser = async (adminData: AdminSeedData) => {
  const { name, email, password, phone, image } = adminData;

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    if (existingUser.role !== "admin") {
      throw new Error(
        `The email ${normalizedEmail} already belongs to a non-admin user.`,
      );
    }

    logger.info(`Admin user already exists: ${existingUser.email}`);
    return { created: false, admin: existingUser };
  }

  const admin = await User.create({
    name,
    email: normalizedEmail,
    password,
    role: "admin" as const,
    phone,
    image,
  });

  logger.info(`Admin user created: ${admin.email}`);
  return { created: true, admin };
};

const getAdminDataFromEnv = (): AdminSeedData => ({
  name: getRequiredEnv("ADMIN_NAME"),
  email: getRequiredEnv("ADMIN_EMAIL"),
  password: getRequiredEnv("ADMIN_PASSWORD"),
  phone: getRequiredEnv("ADMIN_PHONE"),
  image: process.env.ADMIN_IMAGE ?? "",
});

export const ensureAdminExists = async () => {
  const existingAdmin = await User.findOne({ role: "admin" });

  if (existingAdmin) {
    logger.info(`Initial admin already exists: ${existingAdmin.email}`);
    return { created: false, admin: existingAdmin };
  }

  return seedAdminUser(getAdminDataFromEnv());
};

export const runAdminSeed = async () => {
  try {
    await connectDatabase();
    await ensureAdminExists();
  } catch (error) {
    logger.error(`Failed to create Admin User: ${getErrorMessage(error)}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

if (require.main === module) {
  void runAdminSeed();
}
