import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { describe, expect, it } from "vitest";
import app from "../../dist/src/app.js";
import type { UserDocumentShape } from "../../src/types";

const User = mongoose.model<UserDocumentShape>("User");

const createUserToken = async (role: "admin" | "doctor") => {
  const user = await User.create({
    name: `Test ${role}`,
    email: `${role}@test.com`,
    password: "Strong123",
    phone: role === "admin" ? "05555555555" : "05555555556",
    role,
  });

  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: "15m" },
  );
};

describe("booking policy API", () => {
  it("rejects an unauthenticated request", async () => {
    const response = await request(app).get("/api/booking-policy");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: "No token provided",
    });
  });

  it("rejects an invalid access token", async () => {
    const response = await request(app)
      .get("/api/booking-policy")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid token");
  });

  it("returns the backend policy to an authenticated user", async () => {
    const token = await createUserToken("doctor");
    const response = await request(app)
      .get("/api/booking-policy")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      appointmentDurationMinutes: 30,
      bookingWindowDays: 30,
      workingDays: [1, 2, 3, 4, 5],
    });
  });

  it("prevents a non-admin user from changing the policy", async () => {
    const token = await createUserToken("doctor");
    const response = await request(app)
      .patch("/api/booking-policy")
      .set("Authorization", `Bearer ${token}`)
      .send({ bookingWindowDays: 60 });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Not authorized!");
  });
});
