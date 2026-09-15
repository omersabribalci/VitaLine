const express = require("express");
const { liveness, readiness } = require("../controllers/healthController.js");

const router = express.Router();

router.get("/health", liveness);
router.get("/ready", readiness);

module.exports = router;
