/**
 * @file Basic JavaScript functions for a simple parking lot system.
 */

// --- Parking Lot Configuration ---
const TOTAL_SLOTS = 10; // Total parking slots available
let availableSlots = TOTAL_SLOTS; // Current number of available slots

// An object to keep track of parked vehicles.
// Key: vehicleId, Value: { entryTime: Date, slot: number }
const parkedVehicles = {};

// Simple counter for assigning unique slot numbers
let nextSlotNumber = 1;

/**
 * --- 1. Track Available Slots ---
 * Tracks and logs the current number of available parking slots.
 * @returns {number} The current count of available slots.
 */
function trackAvailableSlots() {
  console.log(`Available Parking Slots: ${availableSlots}`);
  return availableSlots;
}

/**
 * --- 2. Log Vehicle Entry ---
 * Logs a vehicle's entry, assigns a slot, and updates available slots.
 * @param {string} vehicleId - A unique identifier for the vehicle (e.g., license plate).
 * @returns {object|null} An object containing vehicle details if successful, otherwise null.
 */
function logVehicleEntry(vehicleId) {
  if (availableSlots > 0) {
    // Check if vehicle is already parked
    if (parkedVehicles[vehicleId]) {
      console.warn(`Vehicle ${vehicleId} is already parked.`);
      return null;
    }

    availableSlots--; // Decrement available slots
    const assignedSlot = nextSlotNumber++; // Assign next available slot number
    const entryTime = new Date(); // Record entry time

    parkedVehicles[vehicleId] = {
      slot: assignedSlot,
      entryTime: entryTime,
    };

    console.log(
      `Vehicle ${vehicleId} entered. Assigned slot: ${assignedSlot}. Entry time: ${entryTime.toLocaleString()}.`
    );
    trackAvailableSlots(); // Log updated available slots
    return { vehicleId, slot: assignedSlot, entryTime };
  } else {
    console.warn(
      `No available slots for vehicle ${vehicleId}. Parking lot is full.`
    );
    return null;
  }
}

/**
 * --- 3. Process Payment and Log Vehicle Exit ---
 * Calculates parking duration, processes payment, and logs vehicle exit.
 * @param {string} vehicleId - The unique identifier for the vehicle.
 * @param {number} ratePerHour - The parking rate per hour.
 * @returns {object|null} An object with payment details if successful, otherwise null.
 */
function processPayment(vehicleId, ratePerHour) {
  const vehicleData = parkedVehicles[vehicleId];

  if (!vehicleData) {
    console.error(`Vehicle ${vehicleId} not found in parking lot.`);
    return null;
  }

  const exitTime = new Date();
  const entryTime = vehicleData.entryTime;

  // Calculate duration in hours
  const durationMs = exitTime.getTime() - entryTime.getTime();
  const durationHours = Math.ceil(durationMs / (1000 * 60 * 60)); // Round up to nearest hour

  const totalAmount = durationHours * ratePerHour;

  console.log(`\nProcessing payment for Vehicle ${vehicleId}:`);
  console.log(`  Entry Time: ${entryTime.toLocaleString()}`);
  console.log(`  Exit Time: ${exitTime.toLocaleString()}`);
  console.log(`  Duration: ${durationHours} hour(s)`);
  console.log(`  Rate: $${ratePerHour}/hour`);
  console.log(`  Total Amount Due: $${totalAmount.toFixed(2)}`);

  // Simulate payment processing (e.g., via an external API call)
  console.log(
    `  Payment of $${totalAmount.toFixed(2)} received for Vehicle ${vehicleId}.`
  );

  // Remove vehicle from parkedVehicles and update available slots
  delete parkedVehicles[vehicleId];
  availableSlots++;
  console.log(`Vehicle ${vehicleId} exited.`);
  trackAvailableSlots(); // Log updated available slots

  return {
    vehicleId,
    entryTime,
    exitTime,
    durationHours,
    totalAmount,
    slot: vehicleData.slot,
  };
}

// --- Example Usage ---

console.log("--- Initial State ---");
trackAvailableSlots();

console.log("\n--- Vehicle Entries ---");
logVehicleEntry("ABC-123");
logVehicleEntry("XYZ-789");
logVehicleEntry("DEF-456");
logVehicleEntry("GHI-010"); // Should fill up a slot

// Attempt to park when full (or near full)
logVehicleEntry("JKL-111"); // This might fail if only 4 slots are available

console.log("\n--- Current Parked Vehicles ---");
console.log(parkedVehicles);

// Simulate some time passing before payment
setTimeout(() => {
  console.log("\n--- Processing Payments ---");
  processPayment("XYZ-789", 5); // Vehicle XYZ-789 pays $5/hour
  processPayment("ABC-123", 5); // Vehicle ABC-123 pays $5/hour
  processPayment("UNKNOWN-VEHICLE", 5); // Attempt to process payment for a non-existent vehicle

  console.log("\n--- Final State ---");
  trackAvailableSlots();
  console.log("Remaining Parked Vehicles:", parkedVehicles);
}, 2000); // Simulate 2 seconds (or more) for duration calculation
