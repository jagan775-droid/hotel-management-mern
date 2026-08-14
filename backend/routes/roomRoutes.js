const express = require("express");
const router = express.Router();
const {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getAvailableRooms,
} = require("../controllers/roomController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/roleCheck");

router.get("/available", protect, getAvailableRooms);
router.route("/")
  .get(protect, getRooms)
  .post(protect, authorize("admin", "manager"), createRoom);
router.route("/:id")
  .get(protect, getRoomById)
  .put(protect, authorize("admin", "manager"), updateRoom)
  .delete(protect, authorize("admin"), deleteRoom);

module.exports = router;
