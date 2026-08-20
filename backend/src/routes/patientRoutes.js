const express = require("express");
const verifyToken = require("../middleware/auth");
const {
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  getMyPatientProfile,
} = require("../controllers/patientController");
const checkRole = require("../middleware/checkRole");

const router = express.Router();

router.use(verifyToken);

router.get("/", checkRole("admin", "doctor"), getPatients);

router.get("/me", checkRole("patient"), getMyPatientProfile);

router.get("/:id", checkRole("admin", "doctor", "patient"), getPatientById);

router.patch("/:id", checkRole("admin"), updatePatient);

router.delete("/:id", checkRole("admin"), deletePatient);

module.exports = router;
