const express = require("express");
const {
  getAppointmentStatistics,
  getAppointments,
  getAvailability,
  createAppointment,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} = require("../controllers/appointmentController.js");
const { authenticate } = require("../middleware/authenticate.js");
const { authorizeRoles } = require("../middleware/authorizeRoles.js");
const {
  validateAppointmentIdParam,
  validateAppointmentListQuery,
  validateAvailabilityQuery,
  validateCreateAppointment,
  validateUpdateAppointment,
} = require("../validators/appointmentValidator.js");

const router = express.Router();

router.use(authenticate);
router.get("/statistics", authorizeRoles("admin"), getAppointmentStatistics);
router.get("/", authorizeRoles("admin", "doctor", "patient"), validateAppointmentListQuery, getAppointments);
router.get("/availability", authorizeRoles("admin", "doctor", "patient"), validateAvailabilityQuery, getAvailability);
router.post("/", authorizeRoles("admin", "patient"), validateCreateAppointment, createAppointment);
router.get("/:id", authorizeRoles("admin", "doctor", "patient"), validateAppointmentIdParam, getAppointmentById);
router.patch("/:id", authorizeRoles("admin", "doctor", "patient"), validateAppointmentIdParam, validateUpdateAppointment, updateAppointment);
router.delete("/:id", authorizeRoles("admin"), validateAppointmentIdParam, deleteAppointment);

module.exports = router;
