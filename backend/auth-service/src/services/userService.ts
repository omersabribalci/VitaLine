const mongoose = require("mongoose");
const RefreshToken = require("../models/RefreshToken.js");
const User = require("../models/User.js");
const AppError = require("../utils/AppError.js");

const toSafeUser = (user: any) => ({
  _id: user._id.toString(),
  name: user.name,
  email: user.email,
  phone: user.phone,
  image: user.image || "",
  role: user.role,
});

const createDoctorUser = async (input: {
  name: string;
  email: string;
  phone: string;
  password: string;
  image?: string;
}) => {
  const email = input.email.trim().toLowerCase();
  if (await User.findOne({ email }).lean()) {
    throw new AppError("Email is already registered.", 409);
  }

  try {
    const user = await User.create({
      name: input.name.trim(),
      email,
      phone: input.phone.trim(),
      password: input.password,
      image: input.image?.trim() || "",
      role: "doctor",
      registrationStatus: "active",
    });
    return toSafeUser(user);
  } catch (error) {
    const duplicateEmail =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11_000;
    if (duplicateEmail) {
      throw new AppError("Email is already registered.", 409);
    }
    throw error;
  }
};

const resolveUsers = async (userIds: string[]) => {
  const users = await User.find({
    _id: { $in: userIds },
    registrationStatus: "active",
  })
    .select("name email phone image role")
    .lean();

  return userIds.flatMap((userId) => {
    const user = users.find((item: any) => item._id.toString() === userId);
    return user ? [toSafeUser(user)] : [];
  });
};

const updateUserProfile = async (
  userId: string,
  input: { name?: string; email?: string; phone?: string; image?: string },
) => {
  const changes = {
    ...(input.name !== undefined ? { name: input.name.trim() } : {}),
    ...(input.email !== undefined
      ? { email: input.email.trim().toLowerCase() }
      : {}),
    ...(input.phone !== undefined ? { phone: input.phone.trim() } : {}),
    ...(input.image !== undefined ? { image: input.image.trim() } : {}),
  };

  if (changes.email) {
    const duplicate = await User.findOne({
      _id: { $ne: userId },
      email: changes.email,
    }).lean();
    if (duplicate) throw new AppError("Email is already registered.", 409);
  }

  try {
    const user = await User.findOneAndUpdate(
      { _id: userId, role: "doctor", registrationStatus: "active" },
      changes,
      { new: true, runValidators: true },
    ).lean();
    if (!user) throw new AppError("Active doctor user not found.", 404);
    return toSafeUser(user);
  } catch (error) {
    const duplicateEmail =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11_000;
    if (duplicateEmail) {
      throw new AppError("Email is already registered.", 409);
    }
    throw error;
  }
};

const deactivateUser = async (userId: string) => {
  const objectId = new mongoose.Types.ObjectId(userId);
  const session = await mongoose.startSession();
  let alreadyDeactivated = false;

  try {
    await session.withTransaction(async () => {
      // User ve refresh token aynı veritabanında olduğu için transaction kullanılır.
      const user = await User.collection.findOne(
        { _id: objectId },
        { session, projection: { isDeleted: 1 } },
      );
      if (!user) throw new AppError("User not found.", 404);

      alreadyDeactivated = user.isDeleted === true;
      const now = new Date();

      await User.collection.updateOne(
        { _id: objectId },
        { $set: { isDeleted: true, updatedAt: now } },
        { session },
      );
      await RefreshToken.updateMany(
        { user: objectId, revokedAt: null },
        { $set: { revokedAt: now } },
        { session },
      );
    });

    return { replayed: alreadyDeactivated };
  } finally {
    await session.endSession();
  }
};

module.exports = {
  createDoctorUser,
  resolveUsers,
  updateUserProfile,
  deactivateUser,
};
