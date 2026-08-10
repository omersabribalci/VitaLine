const express = require("express");
const {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} = require("../controllers/appointmentController");
const verifyToken = require("../middleware/auth");

const router = express.Router();

router.use(verifyToken);

router.route("/").get(getAppointments).post(createAppointment);
router
  .route("/:id")
  .get(getAppointmentById)
  .patch(updateAppointment)
  .delete(deleteAppointment);

module.exports = router;
