const express = require("express");
const router = express.Router();
const {
  getEntriesByUser,
  getOrderOfPayments,
} = require("../controller/NotificationController");

// Route to get entries signed by a specific user
router.get("/user/entries", getEntriesByUser);

router.get("/order-of-payments", getOrderOfPayments);

module.exports = router;
