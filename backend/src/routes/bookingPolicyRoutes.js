const express = require("express");
const { getPolicy, updatePolicy } = require("../controllers/bookingPolicyController");
const verifyToken = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");

const router = express.Router();

// GET /api/booking-policy — token gerektiriyor, tüm roller okuyabilir
router.get("/", verifyToken, getPolicy);

// PATCH /api/booking-policy — sadece admin değiştirebilir
router.patch("/", verifyToken, checkRole("admin"), updatePolicy);

module.exports = router;
