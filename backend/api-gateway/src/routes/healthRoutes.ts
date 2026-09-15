const express = require("express");
const { health } = require("../controllers/healthController.js");

const router = express.Router();

router.get("/health", health);

module.exports = router;
