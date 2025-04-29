// const fs = require("fs");
// const path = require("path");

// const jsonPath = path.join(__dirname, "../json/entries.json");

// function calculateTotals() {
//   try {
//     // Read the JSON file
//     const data = fs.readFileSync(jsonPath, "utf8");
//     const documents = JSON.parse(data);

//     let totalDr = 0;
//     let totalCr = 0;

//     documents.forEach((doc) => {
//       if (doc.ledgers && Array.isArray(doc.ledgers)) {
//         doc.ledgers.forEach((ledger) => {
//           totalDr += ledger.dr || 0;
//           totalCr += ledger.cr || 0;
//         });
//       }
//     });

//     console.log("Total DR:", totalDr);
//     console.log("Total CR:", totalCr);
//   } catch (error) {
//     console.error("Error reading or processing the JSON file:", error);
//   }
// }

// calculateTotals();


// // const outputPath = path.join(__dirname, "../json/12-2024Entries.json");

// // Read the JSON file
// fs.readFile(jsonPath, "utf8", (err, data) => {
//     if (err) {
//       console.error("Error reading the JSON file:", err);
//       return;
//     }
  
//     try {
//       // Parse the JSON data
//       const entries = JSON.parse(data);
  
//       // Filter entries for November 2024
//       const november2024Entries = entries.filter((entry) => {
//         const createdAt = new Date(entry.createdAt);
//         return createdAt.getMonth() === 11 && createdAt.getFullYear() === 2024; 
//       });
  
//       // Write the filtered entries to a new JSON file
//       fs.writeFile(outputPath, JSON.stringify(november2024Entries, null, 2), (writeErr) => {
//         if (writeErr) {
//           console.error("Error writing to the JSON file:", writeErr);
//           return;
//         }
//         console.log("Filtered entries saved successfully!");
//       });
//     } catch (parseErr) {
//       console.error("Error parsing the JSON file:", parseErr);
//     }
//   });

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const outputJsonPath = path.join(__dirname, "../json/mismatch.json");
const toDeleteJsonPath = path.join(__dirname, "../json/toDelete.json");

async function connectToDB() {
  try {
    const dbURI = "mongodb://0.0.0.0:27017/ndc_ams";
    await mongoose.connect(dbURI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

async function processEntries() {
  let mismatches = [];
  let toDelete = [];  // Array to store _id for toDelete.json
  let dateMismatchCount = 0;

  const collectionName = "entries";
  const collection = mongoose.connection.db.collection(collectionName);
  const documents = await collection.find().toArray();

  documents.forEach(doc => {
    const { JVDate, CRDate, DVDate, createdAt } = doc;

    // Check for date mismatches
    let isMismatch = false;

    if (JVDate && JVDate.getDate() !== createdAt.getDate()) {
      isMismatch = true;
    }
    if (CRDate && CRDate.getDate() !== createdAt.getDate()) {
      isMismatch = true;
    }
    if (DVDate && DVDate.getDate() !== createdAt.getDate()) {
      isMismatch = true;
    }

    if (isMismatch) {
      mismatches.push(doc);
      toDelete.push({ _id: doc._id });
      dateMismatchCount++;
    }
  });

  return { mismatches, toDelete, dateMismatchCount };
}

async function saveToJson(mismatches, toDelete) {
  if (mismatches.length > 0) {
    fs.writeFileSync(outputJsonPath, JSON.stringify(mismatches, null, 2));
    console.log(`Mismatched entries saved to ${outputJsonPath}`);
  } else {
    console.log("No mismatched entries found.");
  }

  if (toDelete.length > 0) {
    fs.writeFileSync(toDeleteJsonPath, JSON.stringify(toDelete, null, 2));
    console.log(`Entries to delete saved to ${toDeleteJsonPath}`);
  } else {
    console.log("No entries to delete.");
  }
}

async function main() {
  await connectToDB();
  const { mismatches, toDelete, dateMismatchCount } = await processEntries();

  console.log(`Number of date mismatches: ${dateMismatchCount}`);

  await saveToJson(mismatches, toDelete);
  mongoose.connection.close();
}

main();
