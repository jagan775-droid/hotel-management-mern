const asyncHandler = require("express-async-handler");
const Booking = require("../models/Booking");
const Room = require("../models/Room");

// @route GET /api/bookings?status=&search=
const getBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const bookings = await Booking.find(filter)
    .populate("guest", "name phone email")
    .populate("room", "roomNumber type pricePerNight")
    .sort({ createdAt: -1 });
  res.json(bookings);
});

// @route GET /api/bookings/:id
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("guest")
    .populate("room");
  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }
  res.json(booking);
});

const nightsBetween = (checkIn, checkOut) => {
  const ms = new Date(checkOut) - new Date(checkIn);
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

// @route POST /api/bookings
const createBooking = asyncHandler(async (req, res) => {
  const { guest, room, checkInDate, checkOutDate, numberOfGuests, specialRequests } = req.body;

  if (!guest || !room || !checkInDate || !checkOutDate) {
    res.status(400);
    throw new Error("guest, room, checkInDate and checkOutDate are required");
  }

  if (new Date(checkOutDate) <= new Date(checkInDate)) {
    res.status(400);
    throw new Error("Check-out date must be after check-in date");
  }

  const roomDoc = await Room.findById(room);
  if (!roomDoc) {
    res.status(404);
    throw new Error("Room not found");
  }

  // Prevent double-booking: look for overlapping active bookings on this room.
  const conflict = await Booking.findOne({
    room,
    status: { $in: ["reserved", "checked-in"] },
    checkInDate: { $lt: new Date(checkOutDate) },
    checkOutDate: { $gt: new Date(checkInDate) },
  });
  if (conflict) {
    res.status(400);
    throw new Error("Room is already booked for the selected dates");
  }

  const nights = nightsBetween(checkInDate, checkOutDate);
  const totalAmount = nights * roomDoc.pricePerNight;

  const booking = await Booking.create({
    guest,
    room,
    checkInDate,
    checkOutDate,
    numberOfGuests,
    specialRequests,
    totalAmount,
    createdBy: req.user ? req.user._id : undefined,
  });

  const populated = await booking.populate([
    { path: "guest", select: "name phone email" },
    { path: "room", select: "roomNumber type pricePerNight" },
  ]);

  res.status(201).json(populated);
});

// @route PUT /api/bookings/:id
const updateBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }
  Object.assign(booking, req.body);
  const updated = await booking.save();
  res.json(updated);
});

// @route PUT /api/bookings/:id/checkin
const checkInBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }
  if (booking.status !== "reserved") {
    res.status(400);
    throw new Error(`Cannot check in a booking with status '${booking.status}'`);
  }
  booking.status = "checked-in";
  booking.actualCheckIn = new Date();
  await booking.save();

  await Room.findByIdAndUpdate(booking.room, { status: "occupied" });

  res.json(booking);
});

// @route PUT /api/bookings/:id/checkout
const checkOutBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }
  if (booking.status !== "checked-in") {
    res.status(400);
    throw new Error(`Cannot check out a booking with status '${booking.status}'`);
  }
  booking.status = "checked-out";
  booking.actualCheckOut = new Date();
  await booking.save();

  // Room goes to cleaning after guest leaves, rather than straight back to available.
  await Room.findByIdAndUpdate(booking.room, { status: "cleaning" });

  res.json(booking);
});

// @route PUT /api/bookings/:id/cancel
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }
  if (["checked-out", "cancelled"].includes(booking.status)) {
    res.status(400);
    throw new Error(`Booking is already '${booking.status}'`);
  }
  const wasOccupying = booking.status === "checked-in";
  booking.status = "cancelled";
  await booking.save();

  if (wasOccupying) {
    await Room.findByIdAndUpdate(booking.room, { status: "cleaning" });
  }

  res.json(booking);
});

// @route PUT /api/bookings/:id/payment
const recordPayment = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }
  booking.amountPaid += Number(amount);
  if (booking.amountPaid >= booking.totalAmount) {
    booking.paymentStatus = "paid";
  } else if (booking.amountPaid > 0) {
    booking.paymentStatus = "partial";
  }
  await booking.save();
  res.json(booking);
});

module.exports = {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  checkInBooking,
  checkOutBooking,
  cancelBooking,
  recordPayment,
};
