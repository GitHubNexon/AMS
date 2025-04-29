// const mongoose = require("mongoose");
// const fs = require("fs");
// const path = require("path");
// const SubledgerReference = require("../models/subledgerReferenceModel");

// const outputJsonPath = path.join(__dirname, "../json/paymentEntries.json");

// async function connectToDB() {
//   try {
//     const dbURI = "mongodb://0.0.0.0:27017/ndc_ams";
//     await mongoose.connect(dbURI);
//     console.log("MongoDB connected successfully");
//   } catch (err) {
//     console.error("MongoDB connection error:", err);
//     process.exit(1);
//   }
// }

// connectToDB();

// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "MongoDB connection error:"));
// db.once("open", async () => {
//   console.log("Connected to MongoDB");

//   try {
//     const Entry = mongoose.model(
//       "Entry",
//       new mongoose.Schema({}, { collection: "entries", strict: false })
//     );

//     const startDate = new Date("2025-01-01T00:00:00Z");
//     let payments = await Entry.find({
//       EntryType: "Payment",
//       createdAt: { $gte: startDate },
//     }).lean();

//     for (let payment of payments) {
//       if (typeof payment.PaymentEntity === "string") {
//         const match = payment.PaymentEntity.match(/^(\d+)\s*-\s*(.*)$/);
//         if (match) {
//           const slCode = match[1];
//           const name = match[2];

//           // Fetch details from SubledgerReference
//           const subledgerData = await SubledgerReference.findOne({ slCode }).lean();

//           payment.PaymentEntity = {
//             slCode: slCode,
//             name: name,
//             tin: subledgerData?.tin || "",
//             address: subledgerData?.address || "",
//           };
//         }
//       }
//     }

//     fs.writeFileSync(outputJsonPath, JSON.stringify(payments, null, 2));
//     console.log(`Payment entries saved to ${outputJsonPath}`);
//   } catch (error) {
//     console.error("Error fetching payment entries:", error);
//   } finally {
//     mongoose.connection.close();
//   }
// });

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const dbURI = "mongodb://0.0.0.0:27017/ndc_ams";
const collectionName = "entries";
const outputJsonPath = path.join(__dirname, "../json/paymentEntries.json");

async function main() {
  try {
    await mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("MongoDB connected successfully");

    const db = mongoose.connection.db;
    const collection = db.collection(collectionName);

    // Read and validate JSON file
    if (!fs.existsSync(outputJsonPath)) {
      console.error("JSON file not found:", outputJsonPath);
      process.exit(1);
    }

    let jsonData = JSON.parse(fs.readFileSync(outputJsonPath, "utf-8"));

    // If jsonData is an array, loop through each document
    if (Array.isArray(jsonData)) {
      for (const document of jsonData) {
        console.log("Processing document:", document);

        // Remove _id if it exists, so MongoDB can generate a new one
        delete document._id;

        // Ensure the document contains a valid DVNo
        if (!document.DVNo) {
          console.error("Missing DVNo in document:", document);
          continue;  // Skip to the next document
        }

        const dvNo = document.DVNo;

        // Check if the document with the same DVNo exists
        const existingEntry = await collection.findOne({ DVNo: dvNo });

        if (existingEntry) {
          console.log(`Document with DVNo: ${dvNo} found. Deleting...`);
          await collection.deleteOne({ DVNo: dvNo });
          console.log("Existing document deleted.");
        } else {
          console.log(`No existing document found with DVNo: ${dvNo}. Inserting new document.`);
        }

        // Insert the document with the same DVNo
        await collection.insertOne(document);
        console.log("Document inserted successfully.");
      }
    } else {
      console.error("The JSON data is not an array.");
      process.exit(1);
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    mongoose.connection.close(() => console.log("Database connection closed."));
  }
}

main();


// const mongoose = require("mongoose");
// const fs = require("fs");
// const path = require("path");

// const outputJsonPath = path.join(__dirname, "../json/test.json");

// // Read the JSON file
// fs.readFile(outputJsonPath, "utf8", (err, data) => {
//     if (err) {
//         console.error("Error reading JSON file:", err);
//         return;
//     }

//     try {
//         const jsonData = JSON.parse(data);

//         // Filter only the required fields
//         const filteredData = jsonData.map(item => ({
//             corporation: item.corporation,
//             individual: item.individual
//         }));

//         // Write the modified data back to the file
//         fs.writeFile(outputJsonPath, JSON.stringify(filteredData, null, 2), "utf8", (err) => {
//             if (err) {
//                 console.error("Error writing JSON file:", err);
//                 return;
//             }
//             console.log("JSON file updated successfully!");
//         });

//     } catch (parseError) {
//         console.error("Error parsing JSON:", parseError);
//     }
// });
