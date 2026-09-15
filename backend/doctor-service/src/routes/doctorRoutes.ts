const express = require("express");
const {
  createDoctor,
  getDoctors,
  getDoctorById,
  getMyDoctorProfile,
  updateDoctor,
  deleteDoctor,
} = require("../controllers/doctorController.js");
const { authenticate } = require("../middleware/authenticate.js");
const { authorizeRoles } = require("../middleware/authorizeRoles.js");
const {
  validateDoctorCreation,
  validateDoctorId,
  validateDoctorListQuery,
  validateDoctorProfileUpdate,
  validateDoctorDeletion,
} = require("../validators/doctorValidator.js");

const router = express.Router();

router.use(authenticate);
router.post(
  "/",
  authorizeRoles("admin"),
  validateDoctorCreation,
  createDoctor,
);
router.get("/", authorizeRoles("admin", "doctor", "patient"), validateDoctorListQuery, getDoctors);
router.get("/me", authorizeRoles("doctor"), getMyDoctorProfile);
router.get("/:id", authorizeRoles("admin", "doctor", "patient"), validateDoctorId, getDoctorById);
router.patch(
  "/:id",
  authorizeRoles("admin", "doctor"),
  validateDoctorId,
  validateDoctorProfileUpdate,
  updateDoctor,
);
router.delete("/:id", authorizeRoles("admin"), validateDoctorDeletion, deleteDoctor);

module.exports = router;
