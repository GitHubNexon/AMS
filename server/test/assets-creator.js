const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const AssetsModel = require("../models/AssetsModel");

const MONGODB_URI = "mongodb://0.0.0.0:27017/ams";

// Load categories from external JSON file
const categoriesPath = path.join(__dirname, "../json/assetCategories.json");
const categories = JSON.parse(fs.readFileSync(categoriesPath, "utf8"));

// Utility to get a random date in 2024
function getRandomDate() {
  const start = moment("2024-01-01").valueOf();
  const end = moment("2024-12-31").valueOf();
  const randomTimestamp = Math.floor(Math.random() * (end - start)) + start;
  return moment(randomTimestamp).toISOString();
}

// Utility to get random expiration date for consumables/perishables
function getRandomExpirationDate() {
  const start = moment().add(1, "months").valueOf();
  const end = moment().add(24, "months").valueOf();
  const randomTimestamp = Math.floor(Math.random() * (end - start)) + start;
  return moment(randomTimestamp).toISOString();
}

// Utility to get random warranty date
function getRandomWarrantyDate() {
  const start = moment().add(6, "months").valueOf();
  const end = moment().add(60, "months").valueOf();
  const randomTimestamp = Math.floor(Math.random() * (end - start)) + start;
  return moment(randomTimestamp).toISOString();
}

// Utility to get random location
function getRandomLocation() {
  const locations = [
    "Building A - Floor 1",
    "Building A - Floor 2",
    "Building A - Floor 3",
    "Building B - Floor 1",
    "Building B - Floor 2",
    "Building C - Ground Floor",
    "Building C - Basement",
    "Main Office",
    "Conference Room A",
    "Conference Room B",
    "Laboratory",
    "Kitchen",
    "Storage Room",
    "IT Department",
    "HR Department",
    "Finance Department",
    "Operations Center",
    "Maintenance Shop",
    "Parking Area",
    "Reception Area",
    "Cafeteria",
    "Medical Bay",
    "Security Office",
    "Warehouse",
  ];
  return locations[Math.floor(Math.random() * locations.length)];
}

async function createAssets() {
  const assets = [];

  for (const [category, items] of Object.entries(categories)) {
    for (const [
      propNo,
      name,
      desc,
      unitCost,
      manufacturer,
      model,
      hasWarranty,
    ] of items) {
      // Dynamic quantity based on asset type
      let quantity;
      if (category === "Consumables" || category === "Perishables") {
        quantity = Math.floor(Math.random() * 100) + 50; // 50-150 for consumables
      } else if (unitCost < 10000) {
        quantity = Math.floor(Math.random() * 10) + 5; // 5-15 for small items
      } else if (unitCost < 100000) {
        quantity = Math.floor(Math.random() * 5) + 2; // 2-7 for medium items
      } else {
        quantity = Math.floor(Math.random() * 3) + 1; // 1-3 for expensive items
      }

      const inventory = [];

      for (let j = 0; j < quantity; j++) {
        const inventoryItem = {
          invNo: `${propNo}-${String.fromCharCode(65 + j)}`,
          invName: name,
          description: desc,
          status: "New-Available",
          location: getRandomLocation(),
        };

        // Add expiration date for consumables and perishables
        if (category === "Consumables" || category === "Perishables") {
          inventoryItem.expirationDate = getRandomExpirationDate();
        }

        inventory.push(inventoryItem);
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
        reference: `REF-${Math.floor(Math.random() * 9000) + 1000}`,
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

      // Add manufacturer, model, and warranty date for applicable assets
      if (manufacturer) {
        asset.manufacturer = manufacturer;
      }

      if (model) {
        asset.model = model;
      }

      if (hasWarranty) {
        asset.warrantyDate = getRandomWarrantyDate();
      }

      assets.push(asset);
    }
  }

  // Save to JSON file
  const outputDir = path.join(__dirname, "../json");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, "assetsDefault.json");
  fs.writeFileSync(outputPath, JSON.stringify(assets, null, 2));
  console.log(`✅ Saved assets data to ${outputPath}`);
  console.log(`📊 Total assets created: ${assets.length}`);
  console.log(
    `📦 Total inventory items: ${assets.reduce(
      (sum, asset) => sum + asset.quantity,
      0
    )}`
  );

  // Display summary by category
  console.log("\n=== ASSET SUMMARY BY CATEGORY ===");
  for (const [category, items] of Object.entries(categories)) {
    const categoryAssets = assets.filter(
      (asset) => asset.category === category
    );
    const totalQuantity = categoryAssets.reduce(
      (sum, asset) => sum + asset.quantity,
      0
    );
    const totalValue = categoryAssets.reduce(
      (sum, asset) => sum + asset.acquisitionCost,
      0
    );

    console.log(`${category}:`);
    console.log(`  - Asset types: ${items.length}`);
    console.log(`  - Total quantity: ${totalQuantity}`);
    console.log(`  - Total value: ₱${totalValue.toLocaleString()}`);
    console.log("");
  }

  // Insert into MongoDB
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("🔗 Connected to MongoDB");

    // Clear existing assets if needed (uncomment the line below)
    // await AssetsModel.deleteMany({});

    await AssetsModel.insertMany(assets);
    console.log("✅ Assets successfully inserted into MongoDB");

    // Generate statistics
    const stats = {
      totalAssets: assets.length,
      totalInventoryItems: assets.reduce(
        (sum, asset) => sum + asset.quantity,
        0
      ),
      totalValue: assets.reduce((sum, asset) => sum + asset.acquisitionCost, 0),
      categoryCounts: {},
      locationCounts: {},
      statusCounts: {},
      withExpiration: 0,
      withWarranty: 0,
    };

    assets.forEach((asset) => {
      // Category counts
      stats.categoryCounts[asset.category] =
        (stats.categoryCounts[asset.category] || 0) + 1;

      // Warranty count
      if (asset.warrantyDate) {
        stats.withWarranty++;
      }

      // Location and expiration counts from inventory
      asset.inventory.forEach((item) => {
        stats.locationCounts[item.location] =
          (stats.locationCounts[item.location] || 0) + 1;
        stats.statusCounts[item.status] =
          (stats.statusCounts[item.status] || 0) + 1;

        if (item.expirationDate) {
          stats.withExpiration++;
        }
      });
    });

    console.log("\n=== DETAILED STATISTICS ===");
    console.log(`📊 Total Assets: ${stats.totalAssets}`);
    console.log(`📦 Total Inventory Items: ${stats.totalInventoryItems}`);
    console.log(`💰 Total Value: ₱${stats.totalValue.toLocaleString()}`);
    console.log(`📅 Items with Expiration: ${stats.withExpiration}`);
    console.log(`🛡️ Assets with Warranty: ${stats.withWarranty}`);

    console.log("\n=== TOP LOCATIONS ===");
    const topLocations = Object.entries(stats.locationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    topLocations.forEach(([location, count]) => {
      console.log(`${location}: ${count} items`);
    });
  } catch (err) {
    console.error("❌ Error inserting assets:", err);
  } finally {
    mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the script
createAssets().catch(console.error);
