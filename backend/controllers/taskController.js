// New Parking Controller

const Vehicle = require("../models/Vehicle");
const ParkingLot = require("../models/ParkingLot");

/**
 * @desc    Logs a new vehicle entry and updates available spots
 * @route   POST /api/parking/entry
 * @access  Private (e.g., for parking staff)
 */
const logVehicleEntry = async (req, res) => {
  const { licensePlate, parkingSpot } = req.body;
  try {
    // 1. Check if the parking lot has available spots
    const parkingLot = await ParkingLot.findOne();
    if (!parkingLot || parkingLot.availableSpots <= 0) {
      return res.status(400).json({ message: "Parking lot is full" });
    }

    // 2. Check if a vehicle with the same license plate is already parked
    const vehicleAlreadyParked = await Vehicle.findOne({
      licensePlate,
      status: "parked",
    });
    if (vehicleAlreadyParked) {
      return res
        .status(400)
        .json({
          message: "A vehicle with this license plate is already parked",
        });
    }

    // 3. Create a new vehicle entry record
    const newVehicle = await Vehicle.create({
      licensePlate,
      parkingSpot,
      entryTime: new Date(),
    });

    // 4. Update the available spots in the parking lot
    parkingLot.availableSpots -= 1;
    await parkingLot.save();

    res.status(201).json(newVehicle);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get the current number of available parking slots
 * @route   GET /api/parking/slots
 * @access  Public
 */
const getAvailableSlots = async (req, res) => {
  try {
    const parkingLot = await ParkingLot.findOne();
    if (!parkingLot) {
      return res
        .status(404)
        .json({ message: "Parking lot configuration not found" });
    }

    res.status(200).json({
      totalCapacity: parkingLot.totalCapacity,
      availableSpots: parkingLot.availableSpots,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  logVehicleEntry,
  getAvailableSlots,
};
