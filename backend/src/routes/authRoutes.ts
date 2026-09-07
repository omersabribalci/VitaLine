import express from "express";
import {
  registerPatient,
  login,
  refresh,
  logout,
} from "../controllers/authController";
const authValidator = require("../validators/authValidator");
const { authLimiter } = require("../middleware/ratelimiter");

const router = express.Router();

router.use(authLimiter);

router.post("/register", authValidator.register, registerPatient);
router.post("/login", authValidator.login, login);
router.post("/refresh", refresh);
router.post("/logout", logout);

module.exports = router;
