const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    guest: { type: mongoose.Schema.Types.ObjectId, ref: "Guest", required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    actualCheckIn: { type: Date, default: null },
    actualCheckOut: { type: Date, default: null },
    numberOfGuests: { type: Number, default: 1, min: 1 },
    status: {
      type: String,
      enum: ["reserved", "checked-in", "checked-out", "cancelled"],
      default: "reserved",
    },
    totalAmount: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
    },
    specialRequests: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
