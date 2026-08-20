const express = require("express");
const verifyToken = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");
const {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getMyDoctorProfile,
} = require("../controllers/doctorController");

const router = express.Router();

router.use(verifyToken);

router.get("/", checkRole("admin", "doctor", "patient"), getDoctors);
router.post("/", checkRole("admin"), createDoctor);

router.get("/me", checkRole("doctor"), getMyDoctorProfile);

router.get("/:id", checkRole("admin", "doctor", "patient"), getDoctorById);
router.patch("/:id", checkRole("admin", "doctor"), updateDoctor);

router.delete("/:id", checkRole("admin"), deleteDoctor);

module.exports = router;
