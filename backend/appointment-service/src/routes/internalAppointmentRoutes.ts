const express = require("express");
const {
  cancelPatientAppointments,
  cancelDoctorAppointments,
} = require("../controllers/internalAppointmentController.js");
const { validateOwnerCancellation } = require("../validators/internalAppointmentValidator.js");

const router = express.Router();

router.post("/cancel-by-patient/:ownerId", validateOwnerCancellation, cancelPatientAppointments);
router.post("/cancel-by-doctor/:ownerId", validateOwnerCancellation, cancelDoctorAppointments);

module.exports = router;
