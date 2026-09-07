import express from "express";
import verifyToken = require("../middleware/auth");
import {
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  getMyPatientProfile,
} from "../controllers/patientController";
import checkRole = require("../middleware/checkRole");
const patientValidator = require("../validators/patientValidator");

const router = express.Router();

router.use(verifyToken);

router.get("/", checkRole("admin", "doctor"), getPatients);

router.get("/me", checkRole("patient"), getMyPatientProfile);

router.get("/:id", checkRole("admin", "doctor", "patient"), getPatientById);

router.patch(
  "/:id",
  checkRole("admin"),
  patientValidator.update,
  updatePatient,
);

router.delete("/:id", checkRole("admin"), deletePatient);

module.exports = router;
