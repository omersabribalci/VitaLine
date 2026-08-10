const express = require("express");
const verifyToken = require("../middleware/auth");

const router = express.Router();

router.use(verifyToken);

module.exports = router;
