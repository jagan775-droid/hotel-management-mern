// Seeds an initial admin user and a handful of rooms.
// Run with: npm run seed  (after setting MONGO_URI in .env)
const dotenv = require("dotenv");
const connectDB = require("../config/db");
const User = require("../models/User");
const Room = require("../models/Room");

dotenv.config();

const run = async () => {
  await connectDB();

  const adminEmail = "admin@hotel.com";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: "Hotel Admin",
      email: adminEmail,
      password: "admin123",
      role: "admin",
    });
    console.log(`Created admin user: ${adminEmail} / admin123`);
  } else {
    console.log("Admin user already exists, skipping.");
  }

  const roomCount = await Room.countDocuments();
  if (roomCount === 0) {
    const sampleRooms = [
      { roomNumber: "101", type: "Single", floor: 1, pricePerNight: 60, capacity: 1, amenities: ["WiFi", "TV"] },
      { roomNumber: "102", type: "Double", floor: 1, pricePerNight: 90, capacity: 2, amenities: ["WiFi", "TV", "Mini Fridge"] },
      { roomNumber: "201", type: "Deluxe", floor: 2, pricePerNight: 140, capacity: 2, amenities: ["WiFi", "TV", "Balcony"] },
      { roomNumber: "202", type: "Suite", floor: 2, pricePerNight: 220, capacity: 4, amenities: ["WiFi", "TV", "Kitchenette", "Balcony"] },
      { roomNumber: "301", type: "Family", floor: 3, pricePerNight: 180, capacity: 5, amenities: ["WiFi", "TV", "Extra Beds"] },
    ];
    await Room.insertMany(sampleRooms);
    console.log(`Seeded ${sampleRooms.length} rooms.`);
  } else {
    console.log("Rooms already exist, skipping.");
  }

  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
