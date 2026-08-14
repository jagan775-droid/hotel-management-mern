const asyncHandler = require("express-async-handler");
const Room = require("../models/Room");
const Booking = require("../models/Booking");

// @route GET /api/rooms  (supports ?status=&type=&search=)
const getRooms = asyncHandler(async (req, res) => {
  const { status, type, search } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (search) filter.roomNumber = { $regex: search, $options: "i" };

  const rooms = await Room.find(filter).sort({ roomNumber: 1 });
  res.json(rooms);
});

// @route GET /api/rooms/:id
const getRoomById = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) {
    res.status(404);
    throw new Error("Room not found");
  }
  res.json(room);
});

// @route POST /api/rooms
const createRoom = asyncHandler(async (req, res) => {
  const { roomNumber, type, floor, pricePerNight, capacity, amenities, description } = req.body;

  const exists = await Room.findOne({ roomNumber });
  if (exists) {
    res.status(400);
    throw new Error(`Room ${roomNumber} already exists`);
  }

  const room = await Room.create({
    roomNumber,
    type,
    floor,
    pricePerNight,
    capacity,
    amenities,
    description,
  });
  res.status(201).json(room);
});

// @route PUT /api/rooms/:id
const updateRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) {
    res.status(404);
    throw new Error("Room not found");
  }
  Object.assign(room, req.body);
  const updated = await room.save();
  res.json(updated);
});

// @route DELETE /api/rooms/:id
const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) {
    res.status(404);
    throw new Error("Room not found");
  }
  const activeBooking = await Booking.findOne({
    room: room._id,
    status: { $in: ["reserved", "checked-in"] },
  });
  if (activeBooking) {
    res.status(400);
    throw new Error("Cannot delete a room with active bookings");
  }
  await room.deleteOne();
  res.json({ message: "Room deleted" });
});

// @route GET /api/rooms/available?checkIn=&checkOut=
const getAvailableRooms = asyncHandler(async (req, res) => {
  const { checkIn, checkOut } = req.query;
  if (!checkIn || !checkOut) {
    res.status(400);
    throw new Error("checkIn and checkOut dates are required");
  }

  const overlappingBookings = await Booking.find({
    status: { $in: ["reserved", "checked-in"] },
    checkInDate: { $lt: new Date(checkOut) },
    checkOutDate: { $gt: new Date(checkIn) },
  }).select("room");

  const bookedRoomIds = overlappingBookings.map((b) => b.room.toString());

  const availableRooms = await Room.find({
    _id: { $nin: bookedRoomIds },
    status: { $ne: "maintenance" },
  }).sort({ roomNumber: 1 });

  res.json(availableRooms);
});

module.exports = {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getAvailableRooms,
};
