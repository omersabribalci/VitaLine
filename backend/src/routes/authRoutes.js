const express = require("express");
const registerPatient = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerPatient);
//router.route("/login", loginUser);

module.exports = router;
