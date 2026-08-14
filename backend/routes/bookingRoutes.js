const express = require("express");
const router = express.Router();
const {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  checkInBooking,
  checkOutBooking,
  cancelBooking,
  recordPayment,
} = require("../controllers/bookingController");
const { protect } = require("../middleware/auth");

router.route("/")
  .get(protect, getBookings)
  .post(protect, createBooking);
router.route("/:id")
  .get(protect, getBookingById)
  .put(protect, updateBooking);
router.put("/:id/checkin", protect, checkInBooking);
router.put("/:id/checkout", protect, checkOutBooking);
router.put("/:id/cancel", protect, cancelBooking);
router.put("/:id/payment", protect, recordPayment);

module.exports = router;
