const User = require("../models/User.js");

type AdminData = {
  name: string;
  email: string;
  password: string;
  phone: string;
  image: string;
};

const ensureAdminExists = async (adminData: AdminData) => {
  const existingAdmin = await User.findOne({ role: "admin" });

  if (existingAdmin) {
    // Persist the field even for legacy documents where Mongoose exposes the
    // schema default in memory although the field is absent in MongoDB.
    await User.updateOne(
      { _id: existingAdmin._id },
      { $set: { registrationStatus: "active" } },
    );
    existingAdmin.registrationStatus = "active";
    console.info(
      JSON.stringify({
        service: "auth-service",
        message: "Initial admin already exists.",
      }),
    );
    return { created: false, admin: existingAdmin };
  }

  const admin = await User.create({
    ...adminData,
    email: adminData.email.toLowerCase(),
    role: "admin",
    registrationStatus: "active",
  });

  console.info(
    JSON.stringify({
      service: "auth-service",
      message: "Initial admin created.",
    }),
  );

  return { created: true, admin };
};

module.exports = { ensureAdminExists };
