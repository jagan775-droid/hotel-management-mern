const asyncHandler = require("express-async-handler");
const Guest = require("../models/Guest");

// @route GET /api/guests?search=
const getGuests = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { idNumber: { $regex: search, $options: "i" } },
        ],
      }
    : {};
  const guests = await Guest.find(filter).sort({ createdAt: -1 });
  res.json(guests);
});

// @route GET /api/guests/:id
const getGuestById = asyncHandler(async (req, res) => {
  const guest = await Guest.findById(req.params.id);
  if (!guest) {
    res.status(404);
    throw new Error("Guest not found");
  }
  res.json(guest);
});

// @route POST /api/guests
const createGuest = asyncHandler(async (req, res) => {
  const guest = await Guest.create(req.body);
  res.status(201).json(guest);
});

// @route PUT /api/guests/:id
const updateGuest = asyncHandler(async (req, res) => {
  const guest = await Guest.findById(req.params.id);
  if (!guest) {
    res.status(404);
    throw new Error("Guest not found");
  }
  Object.assign(guest, req.body);
  const updated = await guest.save();
  res.json(updated);
});

// @route DELETE /api/guests/:id
const deleteGuest = asyncHandler(async (req, res) => {
  const guest = await Guest.findById(req.params.id);
  if (!guest) {
    res.status(404);
    throw new Error("Guest not found");
  }
  await guest.deleteOne();
  res.json({ message: "Guest deleted" });
});

module.exports = { getGuests, getGuestById, createGuest, updateGuest, deleteGuest };
