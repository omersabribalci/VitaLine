const connectDatabase = require("../config/database");
const logger = require("../middleware/logger");
const User = require("../models/User");

require("dotenv").config();

const createAdminUser = async (name, email, password, phone, image) => {
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

createAdminUser(
  "Ömer S. Balci",
  "omer@vitaline.com",
  "Testadmin123",
  "12345678910",
  "https://randomuser.me/api/portraits/lego/5.jpg",
);
