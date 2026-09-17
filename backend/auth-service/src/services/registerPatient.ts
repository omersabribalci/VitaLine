const User = require("../models/User.js");
const patientClient = require("../clients/patientClient.js");
const AppError = require("../utils/AppError.js");

type RegistrationInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
  image: string;
};

const normalizePersonName = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join(" ");

const toSafeUser = (user: any) => ({
  _id: user._id.toString(),
  name: user.name,
  email: user.email,
  phone: user.phone,
  image: user.image || "",
  role: user.role,
});

const registerPatient = async (
  input: RegistrationInput,
  requestId: string,
) => {
  const email = input.email.trim().toLowerCase();

  if (await User.findOne({ email }).lean()) {
    throw new AppError("Email is already registered.", 409);
  }

  let user;

  try {
    user = await User.create({
      ...input,
      name: normalizePersonName(input.name),
      email,
      image: input.image || "",
      role: "patient",
      registrationStatus: "active",
    });
  } catch (error: unknown) {
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

  try {
    const patient = await patientClient.createPatient(
      user._id.toString(),
      requestId,
    );

    return { user: toSafeUser(user), patient };
  } catch (error) {
    // Patient profili oluşmadıysa yarım kalan Auth kullanıcısını geri alırız.
    await User.findByIdAndDelete(user._id);

    if (error instanceof patientClient.PatientServiceError) {
      const serviceError = error as { message: string; statusCode?: number };
      throw new AppError(serviceError.message, serviceError.statusCode || 503);
    }

    throw error;
  }
};

module.exports = { registerPatient };
