const mongoose = require("mongoose");

const guestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    idType: {
      type: String,
      enum: ["Passport", "Driver's License", "National ID", "Other"],
      default: "Passport",
    },
    idNumber: { type: String, required: true, trim: true },
    address: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Guest", guestSchema);
