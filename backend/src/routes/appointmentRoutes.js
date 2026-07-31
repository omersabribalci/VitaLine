const express = require("express");
const {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
} = require("../controllers/appointmentController");

const router = express.Router();

router.get("/", getAllAppointments);
router.get("/:id", getAppointmentById);
router.post("/", createAppointment);
module.exports = router;
