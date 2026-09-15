const express = require("express");
const {
  countPatients,
  registerPatient,
  resolvePatients,
  findPatientByUserId,
  findPatientForAppointment,
} = require("../controllers/internalPatientController.js");
const {
  validatePatientIdParam,
  validatePatientRegistration,
  validatePatientResolution,
  validateUserIdParam,
} = require("../validators/patientValidator.js");

const router = express.Router();

router.get("/count", countPatients);
router.post("/", validatePatientRegistration, registerPatient);
router.post("/resolve", validatePatientResolution, resolvePatients);
router.get("/by-user/:userId", validateUserIdParam, findPatientByUserId);
router.get("/:patientId", validatePatientIdParam, findPatientForAppointment);

module.exports = router;
