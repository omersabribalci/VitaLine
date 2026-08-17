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

router.get("/", checkRole("admin", "doctor", "patient"), getAppointments);
router.post("/", checkRole("admin", "patient"), createAppointment);

router.get("/:id", checkRole("admin", "doctor", "patient"), getAppointmentById);
router.patch("/:id", checkRole("admin", "patient"), updateAppointment);
router.delete("/:id", checkRole("admin"), deleteAppointment);

module.exports = router;
