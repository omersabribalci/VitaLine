import express from "express";
import {
  getPolicy,
  updatePolicy,
} from "../controllers/bookingPolicyController";
import verifyToken = require("../middleware/auth");
import checkRole = require("../middleware/checkRole");

const router = express.Router();

router.use(verifyToken);

router.get("/", getPolicy);

router.patch("/", checkRole("admin"), updatePolicy);

module.exports = router;
