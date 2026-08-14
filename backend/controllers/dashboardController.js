const asyncHandler = require("express-async-handler");
const Room = require("../models/Room");
const Booking = require("../models/Booking");
const Guest = require("../models/Guest");

// @route GET /api/dashboard/stats
const getStats = asyncHandler(async (req, res) => {
  const [totalRooms, availableRooms, occupiedRooms, maintenanceRooms, cleaningRooms] =
    await Promise.all([
      Room.countDocuments(),
      Room.countDocuments({ status: "available" }),
      Room.countDocuments({ status: "occupied" }),
      Room.countDocuments({ status: "maintenance" }),
      Room.countDocuments({ status: "cleaning" }),
    ]);

  const totalGuests = await Guest.countDocuments();

  const [activeBookings, todaysCheckIns, todaysCheckOuts] = await Promise.all([
    Booking.countDocuments({ status: { $in: ["reserved", "checked-in"] } }),
    Booking.countDocuments({
      status: "reserved",
      checkInDate: { $gte: startOfToday(), $lt: endOfToday() },
    }),
    Booking.countDocuments({
      status: "checked-in",
      checkOutDate: { $gte: startOfToday(), $lt: endOfToday() },
    }),
  ]);

  const revenueAgg = await Booking.aggregate([
    { $match: { status: { $in: ["checked-in", "checked-out"] } } },
    { $group: { _id: null, total: { $sum: "$amountPaid" } } },
  ]);
  const totalRevenue = revenueAgg.length ? revenueAgg[0].total : 0;

  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  res.json({
    totalRooms,
    availableRooms,
    occupiedRooms,
    maintenanceRooms,
    cleaningRooms,
    occupancyRate,
    totalGuests,
    activeBookings,
    todaysCheckIns,
    todaysCheckOuts,
    totalRevenue,
  });
});

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

module.exports = { getStats };
