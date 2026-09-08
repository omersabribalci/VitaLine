import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../../dist/src/app.js";

describe("health API", () => {
  it("reports that the HTTP process is alive without authentication", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
