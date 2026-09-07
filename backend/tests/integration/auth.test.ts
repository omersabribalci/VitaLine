import request from "supertest";
import mongoose from "mongoose";
import { beforeAll, describe, expect, it } from "vitest";
import app from "../../dist/src/app.js";
import type {
  PatientDocumentShape,
  RefreshTokenDocumentShape,
  UserDocumentShape,
} from "../../src/types";

const User = mongoose.model<UserDocumentShape>("User");
const Patient = mongoose.model<PatientDocumentShape>("Patient");
const RefreshToken =
  mongoose.model<RefreshTokenDocumentShape>("RefreshToken");

const validRegistration = {
  name: "Test Patient",
  email: "patient@test.com",
  phone: "05555555555",
  password: "Strong123",
  confirmPassword: "Strong123",
};

const createPatientUser = () =>
  User.create({
    name: validRegistration.name,
    email: validRegistration.email,
    phone: validRegistration.phone,
    password: validRegistration.password,
    role: "patient",
  });

describe("auth API", () => {
  beforeAll(async () => {
    await User.init();
  });

  it("creates the user and patient profile in one registration request", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send(validRegistration);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      success: true,
      message: "Patient registered successfully.",
      data: {
        user: {
          email: "patient@test.com",
          role: "patient",
        },
        patient: {
          accountStatus: "enabled",
        },
      },
    });
    expect(response.body.data.user).not.toHaveProperty("password");
    expect(await User.countDocuments()).toBe(1);
    expect(await Patient.countDocuments()).toBe(1);
  });

  it("returns validation details without writing partial data", async () => {
    const response = await request(app).post("/api/auth/register").send({
      ...validRegistration,
      email: "not-an-email",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "email" }),
      ]),
    );
    expect(await User.countDocuments()).toBe(0);
    expect(await Patient.countDocuments()).toBe(0);
  });

  it("returns conflict when an active email is registered twice", async () => {
    const firstResponse = await request(app)
      .post("/api/auth/register")
      .send(validRegistration);
    const duplicateResponse = await request(app)
      .post("/api/auth/register")
      .send(validRegistration);

    expect(firstResponse.status).toBe(201);
    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResponse.body.message).toBe(
      "A record with the provided values already exists.",
    );
    expect(await User.countDocuments()).toBe(1);
    expect(await Patient.countDocuments()).toBe(1);
  });

  it("rejects a login attempt with the wrong password", async () => {
    await createPatientUser();

    const response = await request(app).post("/api/auth/login").send({
      email: validRegistration.email,
      password: "Wrong123",
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      message: "Invalid credentials",
    });
    expect(await RefreshToken.countDocuments()).toBe(0);
  });

  it("rejects login for a disabled patient", async () => {
    const user = await createPatientUser();
    await Patient.create({ userId: user._id, accountStatus: "disabled" });

    const response = await request(app).post("/api/auth/login").send({
      email: validRegistration.email,
      password: validRegistration.password,
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Account is disabled");
    expect(await RefreshToken.countDocuments()).toBe(0);
  });

  it("rejects an invalid refresh token", async () => {
    const response = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", "refresh_token=not-a-valid-token");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid or expired refresh token");
  });

  it("rotates the refresh token and revokes it on logout", async () => {
    const user = await createPatientUser();
    await Patient.create({ userId: user._id });
    const agent = request.agent(app);

    const loginResponse = await agent.post("/api/auth/login").send({
      email: validRegistration.email,
      password: validRegistration.password,
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.data.token).toEqual(expect.any(String));
    expect(loginResponse.headers["set-cookie"]?.[0]).toContain(
      "refresh_token=",
    );

    const firstStoredToken = await RefreshToken.findOne();
    expect(firstStoredToken).not.toBeNull();
    expect(firstStoredToken?.revokedAt).toBeNull();

    const refreshResponse = await agent.post("/api/auth/refresh");

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.data.token).toEqual(expect.any(String));
    expect(await RefreshToken.countDocuments()).toBe(2);

    const rotatedOldToken = await RefreshToken.findById(firstStoredToken?._id);
    expect(rotatedOldToken?.revokedAt).toBeInstanceOf(Date);
    expect(rotatedOldToken?.replacedBy).toEqual(expect.any(String));

    const logoutResponse = await agent.post("/api/auth/logout");

    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.headers["set-cookie"]?.[0]).toContain(
      "refresh_token=;",
    );
    expect(await RefreshToken.countDocuments({ revokedAt: null })).toBe(0);
  });

  it("revokes all active sessions when an old refresh token is reused", async () => {
    const user = await createPatientUser();
    await Patient.create({ userId: user._id });
    const agent = request.agent(app);
    const loginResponse = await agent.post("/api/auth/login").send({
      email: validRegistration.email,
      password: validRegistration.password,
    });
    const oldCookie = loginResponse.headers["set-cookie"]?.[0]?.split(";")[0];
    expect(oldCookie).toEqual(expect.stringContaining("refresh_token="));

    const refreshResponse = await agent.post("/api/auth/refresh");
    expect(refreshResponse.status).toBe(200);

    const oldStoredToken = await RefreshToken.findOne({ revokedAt: { $ne: null } });
    expect(oldStoredToken).not.toBeNull();
    oldStoredToken!.revokedAt = new Date(Date.now() - 11_000);
    await oldStoredToken!.save();

    const reuseResponse = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", oldCookie!);

    expect(reuseResponse.status).toBe(401);
    expect(reuseResponse.body.message).toContain("Token reuse detected");
    expect(await RefreshToken.countDocuments({ revokedAt: null })).toBe(0);
  });
});
