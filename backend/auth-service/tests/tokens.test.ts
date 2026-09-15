const assert = require("node:assert/strict");
const test = require("node:test");
const { Types } = require("mongoose");
const {
  createJti,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = require("../src/utils/tokens.js");

const accessSecret = "test-access-secret-with-enough-entropy";
const refreshSecret = "test-refresh-secret-with-enough-entropy";
const user = {
  _id: new Types.ObjectId(),
  email: "admin@example.com",
  role: "admin" as const,
};

test("access token preserves the authentication contract", () => {
  const token = signAccessToken(user, accessSecret);
  const payload = verifyAccessToken(token, accessSecret);

  assert.equal(payload.id, user._id.toString());
  assert.equal(payload.email, user.email);
  assert.equal(payload.role, user.role);
  assert.throws(() => verifyAccessToken(token, "wrong-secret"));
});

test("refresh token contains a unique jti and can be hashed safely", () => {
  const jti = createJti();
  const token = signRefreshToken(user, jti, refreshSecret);
  const payload = verifyRefreshToken(token, refreshSecret);

  assert.equal(payload.id, user._id.toString());
  assert.equal(payload.jti, jti);
  assert.equal(hashToken(token), hashToken(token));
  assert.notEqual(hashToken(token), token);
});
