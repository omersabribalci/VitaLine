import express from "express";
import verifyToken = require("../middleware/auth");
import checkRole = require("../middleware/checkRole");
const doctorValidator = require("../validators/doctorValidator");
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getMyDoctorProfile,
} from "../controllers/doctorController";

const router = express.Router();

router.use(verifyToken);

router.get("/", checkRole("admin", "doctor", "patient"), getDoctors);
router.post("/", checkRole("admin"), doctorValidator.create, createDoctor);

router.get("/me", checkRole("doctor"), getMyDoctorProfile);

router.get("/:id", checkRole("admin", "doctor", "patient"), getDoctorById);
router.patch(
  "/:id",
  checkRole("admin", "doctor"),
  doctorValidator.update,
  updateDoctor,
);

router.delete("/:id", checkRole("admin"), deleteDoctor);

module.exports = router;
