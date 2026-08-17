const express = require("express");
const verifyToken = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");
const {
  getDoctors,
  getDoctorById,
  createDoctor,
} = require("../controllers/doctorController");

const router = express.Router();

router.use(verifyToken);

router.get(
  "/",
  checkRole("admin", "doctor", "patient"),
  getDoctors,
  getDoctorById,
);

router.post("/", checkRole("admin"), createDoctor);

module.exports = router;
