const express = require("express");
const {
  getAppointments,
  getAppointmentById,
  getAvailability,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} = require("../controllers/appointmentController");
const verifyToken = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");
const appointmentValidator = require("../validators/appointmentValidator");

const router = express.Router();

router.use(verifyToken);

router.get("/", checkRole("admin", "doctor", "patient"), getAppointments);
// /availability must come before /:id to avoid route shadowing
router.get("/availability", checkRole("admin", "doctor", "patient"), getAvailability);
router.post(
  "/",
  checkRole("admin", "patient"),
  appointmentValidator.create,
  createAppointment,
);

router.get("/:id", checkRole("admin", "doctor", "patient"), getAppointmentById);
router.patch(
  "/:id",
  checkRole("admin", "patient"),
  appointmentValidator.update,
  updateAppointment,
);
router.delete("/:id", checkRole("admin"), deleteAppointment);

module.exports = router;
