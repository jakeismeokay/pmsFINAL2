const mongoose = require("mongoose");

// Define the ParkingLot Schema
// This schema manages the overall state of the parking lot,
// specifically its total capacity and the number of currently available spots.
const parkingLotSchema = new mongoose.Schema(
  {
    // totalCapacity: Number, required
    // This field defines the maximum number of vehicles the parking lot can hold.
    // It is a crucial static property of the parking lot.
    totalCapacity: {
      type: Number,
      required: [true, "Please provide the total capacity of the parking lot"],
      min: [0, "Capacity cannot be negative"], // Ensures capacity is not less than 0
    },
    // availableSpots: Number, required, default to totalCapacity
    // This field tracks the number of currently empty parking spots.
    // When the parking lot document is first created, available spots should
    // typically be equal to the total capacity.
    availableSpots: {
      type: Number,
      required: [true, "Please provide the number of available spots"],
      min: [0, "Available spots cannot be negative"], // Ensures available spots is not less than 0
    },
  },
  {
    // timestamps: true automatically adds 'createdAt' and 'updatedAt' fields
    // These are useful for tracking when the parking lot configuration was set
    // and when its available spots count was last updated.
    timestamps: true,
  }
);

// Pre-save hook to ensure availableSpots does not exceed totalCapacity
// This middleware runs before a document is saved to the database.
// It ensures that the 'availableSpots' value never goes above the 'totalCapacity'.
parkingLotSchema.pre("save", function (next) {
  if (this.availableSpots > this.totalCapacity) {
    this.availableSpots = this.totalCapacity;
  }
  next();
});

// Create the ParkingLot model from the schema
// The model name 'ParkingLot' will correspond to a 'parkinglots' collection in MongoDB.
const ParkingLot = mongoose.model("ParkingLot", parkingLotSchema);

// Export the ParkingLot model so it can be used in other parts of the application
module.exports = ParkingLot;
