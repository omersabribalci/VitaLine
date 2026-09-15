const express = require("express");
const {
  login,
  refreshToken,
  logout,
  registerPatient,
} = require("../controllers/authController.js");
const { validateLogin, validateRegistration } = require("../validators/authValidator.js");

const router = express.Router();

router.post("/login", validateLogin, login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.post("/register", validateRegistration, registerPatient);

module.exports = router;
