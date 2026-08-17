const express = require("express");
const {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} = require("../controllers/appointmentController");
const verifyToken = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");

const router = express.Router();

router.use(verifyToken);

router
  .route("/")
  .get(checkRole("admin", "doctor", "patient"), getAppointments)
  .post(checkRole("admin", "patient"), createAppointment);
router
  .route("/:id")
  .get(checkRole("admin", "doctor", "patient"), getAppointmentById)
  .patch(checkRole("admin", "patient"), updateAppointment)
  .delete(checkRole("admin"), deleteAppointment);

module.exports = router;
