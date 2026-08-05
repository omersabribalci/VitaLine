const express = require("express");
const {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} = require("../controllers/appointmentController");

const router = express.Router();

router.route("/").get(getAppointments).post(createAppointment);
router
  .route("/:id")
  .get(getAppointmentById)
  .patch(updateAppointment)
  .delete(deleteAppointment);

module.exports = router;
