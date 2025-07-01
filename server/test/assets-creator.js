const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const AssetsModel = require("../models/AssetsModel");

const MONGODB_URI = "mongodb://0.0.0.0:27017/ams";

// Utility to get a random date in the past 5 years
function getRandomDate() {
  const start = moment().subtract(5, "years").startOf("year").valueOf();
  const end = moment().valueOf();
  const randomTimestamp = Math.floor(Math.random() * (end - start)) + start;
  return moment(randomTimestamp).toISOString();
}

const categories = {
  "Office Equipment": [
    ["Laptop-001", "ACER", "ACER LAPTOP", 25000],
    ["Printer-002", "HP LaserJet", "HP Laser Printer", 15000],
    ["Scanner-003", "CanonScan", "Document Scanner", 10000],
    ["Shredder-004", "Fellowes", "Paper Shredder", 8000],
    ["Phone-005", "Cisco", "VoIP Phone", 7000],
  ],
  Furniture: [
    ["Chair-006", "ErgoChair", "Ergonomic Office Chair", 5000],
    ["Desk-007", "IKEA Desk", "Office Desk", 10000],
    ["Cabinet-008", "SteelCab", "Filing Cabinet", 8000],
    ["Table-009", "ConfTable", "Conference Table", 15000],
    ["Shelf-010", "Bookshelf", "Office Bookshelf", 6000],
  ],
  Vehicle: [
    ["Vehicle-011", "Toyota", "Company Car", 800000],
    ["Vehicle-012", "Honda", "Delivery Van", 600000],
    ["Vehicle-013", "Suzuki", "Service Motorcycle", 150000],
    ["Vehicle-014", "Mitsubishi", "Pickup Truck", 700000],
    ["Vehicle-015", "Isuzu", "Cargo Truck", 900000],
  ],
  "Electronic Equipment": [
    ["Projector-016", "Epson", "Multimedia Projector", 30000],
    ["Monitor-017", "Dell", "LED Monitor", 12000],
    ["Camera-018", "Logitech", "Web Camera", 5000],
    ["Router-019", "TP-Link", "WiFi Router", 4000],
    ["Speaker-020", "JBL", "Conference Speaker", 10000],
  ],
  "Machinery & Tools": [
    ["Drill-021", "Bosch", "Electric Drill", 10000],
    ["Cutter-022", "Makita", "Metal Cutter", 15000],
    ["Welder-023", "Lincoln", "Welding Machine", 25000],
    ["Compressor-024", "Hitachi", "Air Compressor", 30000],
    ["Saw-025", "DeWalt", "Circular Saw", 18000],
  ],
};

async function createAssets() {
  let codeCounter = 1;
  const assets = [];

  for (const [category, items] of Object.entries(categories)) {
    for (const [propNo, name, desc, unitCost] of items) {
      const quantity = 5;
      const inventory = [];

      for (let j = 0; j < quantity; j++) {
        inventory.push({
          invNo: `${propNo}-${String.fromCharCode(65 + j)}`,
          invName: name,
          description: desc,
          code: codeCounter.toString().padStart(4, "0"),
          status: "New-Available",
        });
        codeCounter++;
      }

      const asset = {
        propNo,
        propName: name,
        propDescription: desc,
        unitCost,
        acquisitionDate: getRandomDate(),
        inventory,
        useFullLife: 60,
        assetImage: "",
        quantity,
        acquisitionCost: unitCost * quantity,
        reference: "test",
        category,
        accumulatedAccount: "accumulated",
        depreciationAccount: "depreciation",
        attachments: [],
        Status: { isDeleted: false, isArchived: false },
        CreatedBy: {
          name: "Administrator",
          position: "Administrator",
          _id: "66fc98f526728f8c6c24a1aa",
        },
      };

      assets.push(asset);
    }
  }

  // Save to local JSON
  const outputDir = path.join(__dirname, "test");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  const outputPath = path.join(outputDir, "dummy_assets.json");
  fs.writeFileSync(outputPath, JSON.stringify(assets, null, 2));
  console.log(`Saved local JSON to ${outputPath}`);

  // Insert into MongoDB
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    await AssetsModel.insertMany(assets);
    console.log("Assets successfully inserted into MongoDB");
  } catch (err) {
    console.error("Error inserting assets:", err);
  } finally {
    mongoose.disconnect();
  }
}

createAssets();
