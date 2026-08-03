const express = require("express");
const {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
} = require("../controllers/appointmentController");

const router = express.Router();

router.route("/").get(getAppointments).post(createAppointment);
router.route("/:id").get(getAppointmentById).patch(updateAppointment);

module.exports = router;
