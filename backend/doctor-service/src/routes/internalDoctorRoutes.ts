const express = require("express");
const {
  countDoctors,
  resolveDoctors,
  findDoctorByUserId,
  findDoctorForAppointment,
} = require("../controllers/internalDoctorController.js");
const {
  validateDoctorIdParam,
  validateDoctorUserIdParam,
  validateDoctorResolution,
} = require("../validators/doctorValidator.js");

const router = express.Router();

router.get("/count", countDoctors);
router.post("/resolve", validateDoctorResolution, resolveDoctors);
router.get("/by-user/:userId", validateDoctorUserIdParam, findDoctorByUserId);
router.get("/:doctorId", validateDoctorIdParam, findDoctorForAppointment);

module.exports = router;
