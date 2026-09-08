import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { describe, expect, it } from "vitest";
import { seedAdminUser } from "../../dist/src/scripts/seedAdmin.js";
import type { UserDocumentShape } from "../../src/types";

const User = mongoose.model<UserDocumentShape>("User");

const adminData = {
  name: "Seed Admin",
  email: "ADMIN@VITALINE.TEST",
  password: "Strong123",
  phone: "05555555555",
  image: "",
};

describe("admin seed", () => {
  it("creates the admin once and leaves the existing password unchanged", async () => {
    const firstResult = await seedAdminUser(adminData);
    const firstAdmin = await User.findOne({ email: "admin@vitaline.test" })
      .select("+password")
      .lean();

    const secondResult = await seedAdminUser(adminData);
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
