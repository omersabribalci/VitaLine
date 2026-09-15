const express = require("express");
const { getBookingPolicy, updateBookingPolicy } = require("../controllers/bookingPolicyController.js");
const { authenticate } = require("../middleware/authenticate.js");
const { authorizeRoles } = require("../middleware/authorizeRoles.js");
const { validateBookingPolicyUpdate } = require("../validators/bookingPolicyValidator.js");

const router = express.Router();

router.use(authenticate);
router.get("/", getBookingPolicy);
router.patch("/", authorizeRoles("admin"), validateBookingPolicyUpdate, updateBookingPolicy);

module.exports = router;
