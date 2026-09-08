import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { afterEach, describe, expect, it } from "vitest";
import {
  ensureAdminExists,
  seedAdminUser,
} from "../../dist/src/scripts/seedAdmin.js";
import type { UserDocumentShape } from "../../src/types";

const User = mongoose.model<UserDocumentShape>("User");

const adminData = {
  name: "Seed Admin",
  email: "ADMIN@VITALINE.TEST",
  password: "Strong123",
  phone: "05555555555",
  image: "",
};

const originalAdminEnv = {
  ADMIN_NAME: process.env.ADMIN_NAME,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_PHONE: process.env.ADMIN_PHONE,
  ADMIN_IMAGE: process.env.ADMIN_IMAGE,
};

afterEach(() => {
  for (const [key, value] of Object.entries(originalAdminEnv)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

describe("admin seed", () => {
  it("creates the initial admin once and leaves it unchanged on later starts", async () => {
    process.env.ADMIN_NAME = adminData.name;
    process.env.ADMIN_EMAIL = adminData.email;
    process.env.ADMIN_PASSWORD = adminData.password;
    process.env.ADMIN_PHONE = adminData.phone;
    process.env.ADMIN_IMAGE = adminData.image;

    const firstResult = await ensureAdminExists();
    const firstAdmin = await User.findOne({ email: "admin@vitaline.test" })
      .select("+password")
      .lean();

    process.env.ADMIN_EMAIL = "another-admin@vitaline.test";
    process.env.ADMIN_PASSWORD = "Changed123";

    const secondResult = await ensureAdminExists();
    const secondAdmin = await User.findOne({ email: "admin@vitaline.test" })
      .select("+password")
      .lean();

    expect(firstResult.created).toBe(true);
    expect(secondResult.created).toBe(false);
    expect(await User.countDocuments()).toBe(1);
    expect(firstAdmin?.role).toBe("admin");
    expect(await bcrypt.compare(adminData.password, firstAdmin!.password)).toBe(
      true,
    );
    expect(secondAdmin?.password).toBe(firstAdmin?.password);
  });

  it("rejects an email that already belongs to a non-admin user", async () => {
    await User.create({
      ...adminData,
      email: "admin@vitaline.test",
      role: "patient",
    });

    await expect(seedAdminUser(adminData)).rejects.toThrow(
      "already belongs to a non-admin user",
    );
    expect(await User.countDocuments()).toBe(1);
  });
});
