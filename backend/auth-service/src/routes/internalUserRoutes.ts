const express = require("express");
const {
  createDoctorUser,
  resolveUsers,
  updateUserProfile,
  updateUserPassword,
  deactivateUser,
} = require("../controllers/internalUserController.js");
const {
  validateInternalDoctorUserCreation,
  validateInternalUserDeactivation,
  validateInternalUserProfileUpdate,
  validateInternalUserPasswordUpdate,
  validateUserResolution,
} = require("../validators/internalUserValidator.js");

const router = express.Router();

router.post("/resolve", validateUserResolution, resolveUsers);
router.post("/doctors", validateInternalDoctorUserCreation, createDoctorUser);
router.patch("/:id/profile", validateInternalUserProfileUpdate, updateUserProfile);
router.patch(
  "/:id/password",
  validateInternalUserPasswordUpdate,
  updateUserPassword,
);
router.post("/:id/deactivate", validateInternalUserDeactivation, deactivateUser);

module.exports = router;
