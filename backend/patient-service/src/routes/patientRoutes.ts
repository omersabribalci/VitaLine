const express = require("express");
const {
  getPatients,
  getMyPatientProfile,
  getPatientById,
  updatePatient,
  deletePatient,
} = require("../controllers/patientController.js");
const { authenticate } = require("../middleware/authenticate.js");
const { authorizeRoles } = require("../middleware/authorizeRoles.js");
const {
  validatePatientId,
  validatePatientDeletion,
  validatePatientListQuery,
  validatePatientUpdate,
} = require("../validators/patientValidator.js");

const router = express.Router();

router.use(authenticate);
router.get("/", authorizeRoles("admin", "doctor"), validatePatientListQuery, getPatients);
router.get("/me", authorizeRoles("patient"), getMyPatientProfile);
router.get("/:id", authorizeRoles("admin", "doctor"), validatePatientId, getPatientById);
router.patch("/:id", authorizeRoles("admin"), validatePatientId, validatePatientUpdate, updatePatient);
router.delete("/:id", authorizeRoles("admin"), validatePatientDeletion, deletePatient);

module.exports = router;
