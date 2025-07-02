const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const AssetsModel = require("../models/AssetsModel");

const MONGODB_URI = "mongodb://0.0.0.0:27017/ams";

// Utility to get a random date in 2024
function getRandomDate() {
  const start = moment("2024-01-01").valueOf();
  const end = moment("2024-12-31").valueOf();
  const randomTimestamp = Math.floor(Math.random() * (end - start)) + start;
  return moment(randomTimestamp).toISOString();
}

const categories = {
  "IT Hardware": [
    ["SERVER-001", "Dell PowerEdge", "Enterprise Server R740", 450000],
    ["WORKSTATION-002", "HP Z6", "High Performance Workstation", 180000],
    ["TABLET-003", "iPad Pro", "11-inch Tablet Device", 65000],
    ["SWITCH-004", "Cisco Catalyst", "24-Port Network Switch", 85000],
    ["UPS-005", "APC Smart", "1500VA UPS System", 35000],
  ],
  "Medical Equipment": [
    ["ULTRASOUND-006", "GE Voluson", "Ultrasound Machine", 2500000],
    ["XRAY-007", "Philips DigitalDiagnost", "Digital X-Ray System", 3200000],
    ["MONITOR-008", "Mindray uMEC", "Patient Monitor", 180000],
    ["DEFIBRILLATOR-009", "Zoll R Series", "Automated Defibrillator", 320000],
    ["WHEELCHAIR-010", "Invacare Tracer", "Manual Wheelchair", 15000],
  ],
  "Laboratory Equipment": [
    ["MICROSCOPE-011", "Olympus CX23", "Binocular Microscope", 95000],
    ["CENTRIFUGE-012", "Thermo Scientific", "High-Speed Centrifuge", 125000],
    ["INCUBATOR-013", "Memmert INC", "CO2 Incubator", 220000],
    ["AUTOCLAVE-014", "Tuttnauer 3870", "Steam Sterilizer", 165000],
    ["BALANCE-015", "Sartorius Entris", "Analytical Balance", 85000],
  ],
  "Security Systems": [
    ["CAMERA-016", "Hikvision DS", "IP Security Camera", 12000],
    ["DVR-017", "Dahua XVR", "Digital Video Recorder", 45000],
    ["SCANNER-018", "ZKTeco MT100", "Fingerprint Scanner", 8500],
    ["DETECTOR-019", "First Alert", "Smoke Detector", 3500],
    ["ALARM-020", "Honeywell Vista", "Security Alarm Panel", 25000],
  ],
  "Kitchen Equipment": [
    ["REFRIGERATOR-021", "Samsung RF23", "Commercial Refrigerator", 85000],
    ["OVEN-022", "Rational SelfCooking", "Combi Steam Oven", 450000],
    ["DISHWASHER-023", "Hobart LXER", "Commercial Dishwasher", 320000],
    ["FREEZER-024", "True T-49F", "Reach-in Freezer", 125000],
    ["MIXER-025", "KitchenAid KSM", "Stand Mixer", 35000],
  ],
  "Audio Visual": [
    ["SMARTBOARD-026", "SMART Board", "Interactive Whiteboard", 185000],
    ["SOUNDSYSTEM-027", "Bose Professional", "Conference Room Audio", 95000],
    ["MICROPHONE-028", "Shure SM58", "Dynamic Microphone", 8500],
    ["AMPLIFIER-029", "Yamaha MG12XU", "Mixing Console", 25000],
    ["SCREEN-030", "Elite Screens", "Electric Projection Screen", 45000],
  ],
  "Manufacturing Tools": [
    ["LATHE-031", "Haas TL-1", "CNC Turning Center", 850000],
    ["PRESS-032", "Amada RG", "Hydraulic Press Brake", 1200000],
    ["GRINDER-033", "Makita 9557PB", "Angle Grinder", 4500],
    ["BANDSAW-034", "JET HVBS-710", "Horizontal Band Saw", 185000],
    ["MILL-035", "Bridgeport Series", "Vertical Milling Machine", 650000],
  ],
  "HVAC Systems": [
    ["AIRCON-036", "Daikin VRV", "Variable Refrigerant Volume", 320000],
    ["CHILLER-037", "Carrier 30XA", "Air-Cooled Chiller", 1800000],
    ["FAN-038", "Panasonic WhisperCeiling", "Exhaust Fan", 8500],
    ["HEATER-039", "Rheem RTGH", "Tankless Water Heater", 45000],
    ["THERMOSTAT-040", "Honeywell T6 Pro", "Programmable Thermostat", 6500],
  ],
};

async function createAssets() {
  let codeCounter = 1001; // Starting from 1001 for new numbering
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

      const useFullLifeOptions = [36, 48, 60, 72, 84, 96]; // Different useful life periods
      const randomUseFullLife =
        useFullLifeOptions[
          Math.floor(Math.random() * useFullLifeOptions.length)
        ];

      const asset = {
        propNo,
        propName: name,
        propDescription: desc,
        unitCost,
        acquisitionDate: getRandomDate(),
        inventory,
        useFullLife: randomUseFullLife,
        assetImage: "",
        quantity,
        acquisitionCost: unitCost * quantity,
        reference: `REF-${Math.floor(Math.random() * 9000) + 1000}`, // Random reference number
        category,
        accumulatedAccount: "accumulated_depreciation",
        depreciationAccount: "depreciation_expense",
        attachments: [],
        Status: {
          isDeleted: false,
          isArchived: false,
        },
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
  const outputDir = path.join(__dirname, "data");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  const outputPath = path.join(outputDir, "new_assets_data.json");
  fs.writeFileSync(outputPath, JSON.stringify(assets, null, 2));
  console.log(`Saved new assets JSON to ${outputPath}`);
  console.log(`Total assets created: ${assets.length}`);
  console.log(
    `Total inventory items: ${assets.reduce(
      (sum, asset) => sum + asset.quantity,
      0
    )}`
  );

  // Insert into MongoDB
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing assets if needed (uncomment the line below)
    // await AssetsModel.deleteMany({});

    await AssetsModel.insertMany(assets);
    console.log("New assets successfully inserted into MongoDB");

    // Display summary by category
    console.log("\n=== ASSET SUMMARY BY CATEGORY ===");
    for (const [category, items] of Object.entries(categories)) {
      console.log(`${category}: ${items.length} asset types`);
    }
  } catch (err) {
    console.error("Error inserting assets:", err);
  } finally {
    mongoose.disconnect();
  }
}

createAssets();
