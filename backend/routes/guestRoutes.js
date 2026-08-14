const express = require("express");
const router = express.Router();
const {
  getGuests,
  getGuestById,
  createGuest,
  updateGuest,
  deleteGuest,
} = require("../controllers/guestController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/roleCheck");

router.route("/")
  .get(protect, getGuests)
  .post(protect, createGuest);
router.route("/:id")
  .get(protect, getGuestById)
  .put(protect, updateGuest)
  .delete(protect, authorize("admin", "manager"), deleteGuest);

module.exports = router;
