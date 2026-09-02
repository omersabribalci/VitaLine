const express = require("express");
const {
  getPolicy,
  updatePolicy,
} = require("../controllers/bookingPolicyController");
const verifyToken = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");

const router = express.Router();

router.use(verifyToken);

router.get("/", getPolicy);

router.patch("/", checkRole("admin"), updatePolicy);

module.exports = router;
