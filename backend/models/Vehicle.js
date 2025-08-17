const mongoose = require("mongoose");

// Define the Vehicle Schema
// This schema outlines the structure and validation rules for each vehicle record
const vehicleSchema = new mongoose.Schema(
  {
    // licensePlate: String, required, unique, trimmed
    // This field stores the vehicle's license plate number.
    // It's set as required because every vehicle needs a license plate.
    // 'unique: true' ensures no two vehicle entries have the same license plate,
    // which is crucial for tracking individual vehicles.
    // 'trim: true' removes whitespace from the beginning and end of the string.
    licensePlate: {
      type: String,
      required: [true, "Please provide a license plate"],
      unique: true,
      trim: true,
    },
    // parkingSpot: String, required
    // This field indicates the specific parking spot the vehicle is occupying.
    // It's required to know where the vehicle is located within the lot.
    parkingSpot: {
      type: String,
      required: [true, "Please provide a parking spot"],
    },
    // entryTime: Date, default to current time
    // This field records the exact time the vehicle entered the parking lot.
    // 'default: Date.now' automatically sets the current timestamp when a new
    // vehicle entry is created.
    entryTime: {
      type: Date,
      default: Date.now,
    },
    // exitTime: Date, optional
    // This field will be updated when the vehicle exits the parking lot.
    // It's optional at creation time because a vehicle is initially entering.
    exitTime: {
      type: Date,
      required: false, // Not required initially
    },
    // status: String, default 'parked'
    // This field tracks the current status of the vehicle entry (e.g., 'parked', 'exited').
    status: {
      type: String,
      enum: ["parked", "exited"], // Only allows these two values
      default: "parked",
    },
  },
  {
    // timestamps: true automatically adds 'createdAt' and 'updatedAt' fields
    // 'createdAt' will be the timestamp of when the document was first created.
    // 'updatedAt' will be the timestamp of the last time the document was updated.
    timestamps: true,
  }
);

// Create the Vehicle model from the schema
// The model name 'Vehicle' will correspond to a 'vehicles' collection in MongoDB.
const Vehicle = mongoose.model("Vehicle", vehicleSchema);

// Export the Vehicle model so it can be used in other parts of the application
module.exports = Vehicle;
