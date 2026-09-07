import express from "express";
import {
  getAppointments,
  getAdminStatistics,
  getAppointmentById,
  getAvailability,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointmentController";
import verifyToken = require("../middleware/auth");
import checkRole = require("../middleware/checkRole");
const appointmentValidator = require("../validators/appointmentValidator");

const router = express.Router();

router.use(verifyToken);

router.get("/", checkRole("admin", "doctor", "patient"), getAppointments);
router.get("/statistics", checkRole("admin"), getAdminStatistics);

router.get(
  "/availability",
  checkRole("admin", "doctor", "patient"),
  appointmentValidator.availability,
  getAvailability,
);
router.post(
  "/",
  checkRole("admin", "patient"),
  appointmentValidator.create,
  createAppointment,
);

router.get("/:id", checkRole("admin", "doctor", "patient"), getAppointmentById);
router.patch(
  "/:id",
  checkRole("admin", "doctor", "patient"),
  appointmentValidator.update,
  updateAppointment,
);
router.delete("/:id", checkRole("admin"), deleteAppointment);

module.exports = router;
