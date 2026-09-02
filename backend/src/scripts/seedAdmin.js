const connectDatabase = require("../config/database");
const logger = require("../middleware/logger");
const User = require("../models/User");

require("dotenv").config();

const createAdminUser = async (adminData) => {
  const { name, email, password, phone, image } = adminData;
  try {
    await connectDatabase();

    const adminUser = {
      name: name,
      email: email,
      password: password,
      role: "admin",
      phone: phone,
      image: image,
    };

    const admin = await User.create(adminUser);
    logger.info(`Admin user created: ${admin.email}`);
    process.exit(0);
  } catch (error) {
    logger.error(`Failed to create Admin User: ${error.message}`);
    process.exit(1);
  }
};

const adminData = {
  name: process.env.ADMIN_NAME,
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
  phone: process.env.ADMIN_PHONE,
  image: process.env.ADMIN_IMAGE,
};

createAdminUser(adminData);
