const chai = require("chai");
const sinon = require("sinon");
const mongoose = require("mongoose");

// Import your new models
const Vehicle = require("../models/Vehicle");
const ParkingLot = require("../models/ParkingLot");

// Import your new parking controller functions
const {
  logVehicleEntry,
  getAvailableSlots,
} = require("../controllers/parkingController");
const { expect } = chai;

// --- Test Suite for logVehicleEntry Function ---
describe("logVehicleEntry Function Test", () => {
  let findOneParkingLotStub;
  let createVehicleStub;
  let saveParkingLotStub;
  let findOneVehicleStub;

  beforeEach(() => {
    findOneParkingLotStub = sinon.stub(ParkingLot, "findOne").resolves({
      totalCapacity: 10,
      availableSpots: 10,
      save: sinon.stub().resolvesThis(),
    });
    createVehicleStub = sinon.stub(Vehicle, "create");
    saveParkingLotStub = findOneParkingLotStub().save;
    findOneVehicleStub = sinon.stub(Vehicle, "findOne");
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should log a new vehicle entry successfully and decrement available spots", async () => {
    const req = {
      body: { licensePlate: "ABC-123", parkingSpot: "A1" },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    const createdVehicle = {
      _id: new mongoose.Types.ObjectId(),
      licensePlate: "ABC-123",
      parkingSpot: "A1",
      entryTime: new Date(),
    };
    createVehicleStub.resolves(createdVehicle);
    findOneVehicleStub.resolves(null);

    await logVehicleEntry(req, res);

    expect(findOneParkingLotStub.calledOnce).to.be.true;
    expect(
      findOneVehicleStub.calledOnceWith({
        licensePlate: req.body.licensePlate,
        status: "parked",
      })
    ).to.be.true;
    expect(
      createVehicleStub.calledOnceWith({
        licensePlate: req.body.licensePlate,
        parkingSpot: req.body.parkingSpot,
        entryTime: sinon.match.date,
      })
    ).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    // **Updated Line:** Use .calledWithMatch() for a robust check
    expect(res.json.calledWithMatch(createdVehicle)).to.be.true;

    const parkingLotInstance = await findOneParkingLotStub();
    expect(parkingLotInstance.availableSpots).to.equal(9);
    expect(parkingLotInstance.save.calledOnce).to.be.true;
  });

  it("should return 400 if parking lot is full", async () => {
    findOneParkingLotStub.resolves({
      totalCapacity: 10,
      availableSpots: 0,
      save: sinon.stub().resolvesThis(),
    });

    const req = {
      body: { licensePlate: "XYZ-789", parkingSpot: "B5" },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await logVehicleEntry(req, res);

    expect(findOneParkingLotStub.calledOnce).to.be.true;
    expect(res.status.calledWith(400)).to.be.true;
    // **Updated Line:** Use .calledWithMatch() for a robust check
    expect(res.json.calledWithMatch({ message: "Parking lot is full" })).to.be
      .true;
    expect(createVehicleStub.notCalled).to.be.true;
  });

  it("should return 400 if vehicle with same license plate is already parked", async () => {
    findOneVehicleStub.resolves({
      _id: new mongoose.Types.ObjectId(),
      licensePlate: "ABC-123",
      parkingSpot: "A1",
      status: "parked",
    });

    const req = {
      body: { licensePlate: "ABC-123", parkingSpot: "A2" },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await logVehicleEntry(req, res);

    expect(findOneVehicleStub.calledOnce).to.be.true;
    expect(res.status.calledWith(400)).to.be.true;
    expect(
      res.json.calledWithMatch({
        message: "A vehicle with this license plate is already parked",
      })
    ).to.be.true;
    expect(createVehicleStub.notCalled).to.be.true;
  });

  it("should return 500 if a server error occurs during vehicle entry", async () => {
    createVehicleStub.throws(new Error("Database connection failed"));

    const req = {
      body: { licensePlate: "ERR-001", parkingSpot: "C1" },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await logVehicleEntry(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: "Server error" })).to.be.true;
  });
});

// --- Test Suite for getAvailableSlots Function ---
describe("getAvailableSlots Function Test", () => {
  let findOneParkingLotStub;

  beforeEach(() => {
    findOneParkingLotStub = sinon.stub(ParkingLot, "findOne");
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should return the correct number of available slots", async () => {
    findOneParkingLotStub.resolves({
      totalCapacity: 100,
      availableSpots: 75,
    });

    const req = {};
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await getAvailableSlots(req, res);

    expect(findOneParkingLotStub.calledOnce).to.be.true;
    expect(res.status.calledWith(200)).to.be.true;
    expect(
      res.json.calledWith({
        totalCapacity: 100,
        availableSpots: 75,
      })
    ).to.be.true;
  });

  it("should return 404 if parking lot configuration is not found", async () => {
    findOneParkingLotStub.resolves(null);

    const req = {};
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await getAvailableSlots(req, res);

    expect(findOneParkingLotStub.calledOnce).to.be.true;
    expect(res.status.calledWith(404)).to.be.true;
    expect(
      res.json.calledWith({ message: "Parking lot configuration not found" })
    ).to.be.true;
  });

  it("should return 500 if a server error occurs during fetching available slots", async () => {
    findOneParkingLotStub.throws(new Error("Network error"));

    const req = {};
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await getAvailableSlots(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: "Server error" })).to.be.true;
  });
});
