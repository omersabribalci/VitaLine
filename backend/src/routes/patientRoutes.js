const express = require("express");
const verifyToken = require("../middleware/auth");
const {
  getPatients,
  getPatientById,
  updatePatient,
} = require("../controllers/patientController");
const checkRole = require("../middleware/checkRole");

const router = express.Router();

router.use(verifyToken);

router.get("/", checkRole("admin", "doctor"), getPatients);

router.get("/:id", checkRole("admin", "patient"), getPatientById);

router.patch("/:id", checkRole("admin"), updatePatient);
module.exports = router;
