const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const mongoose = require("mongoose");

const inputCsvPath = path.join(
  __dirname,
  "../json/TRANSACTION LIST - NOVEMBER 2024 TRANSACTIONS.csv"
);
const outputJsonPath = path.join(__dirname, "../json/entries.json");

async function connectToDB() {
  try {
    const dbURI = "mongodb://0.0.0.0:27017/ndc_ams";
    await mongoose.connect(dbURI, {
      //   useNewUrlParser: true,
      //   useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

async function getAccountName(acctCode) {
  console.log("Querying account with ACCTCODE:", acctCode);

  if (!acctCode) {
    console.log("No ACCTCODE found, returning null");
    return null;
  }

  try {
    const account = await mongoose.connection.db
      .collection("accounts")
      .findOne({ code: acctCode });

    return account ? account.name : null; // If account exists, return its name, else return null
  } catch (err) {
    console.error("Error querying account:", err);
    return null;
  }
}

async function getSubledgerName(slCode) {
  console.log("Querying subledger with slCode:", slCode);

  if (!slCode) {
    console.log("No slCode found, returning null");
    return null;
  }

  try {
    const result = await mongoose.connection.db
      .collection("subledgerreferences")
      .findOne({ slCode });

    return result ? result.name : null;
  } catch (err) {
    console.error("Error querying subledger:", err);
    return null;
  }
}

async function processCsv() {
  const rows = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(inputCsvPath)
      .pipe(csv())
      .on("data", (row) => {
        console.log("Processing row:", row);
        rows.push(row);
      })
      .on("end", () => resolve(rows))
      .on("error", (error) => reject(error));
  });
}

async function transformRowsToEntries(rows) {
  const groupedEntries = {};

  for (const row of rows) {
    const entryType = row["SLDOCCODE"];
    const entryNoKey = row["SLDOCNO"];
    const entryDateField =
      entryType === "Journal"
        ? "JVDate"
        : entryType === "Receipt"
        ? "CRDate"
        : "DVDate";

    const rawDate = row["SLDATE"];
    const [month, day, year] = rawDate.split("/");
    const formattedDate = new Date(`${year}-${month}-${day}`);

    if (isNaN(formattedDate.getTime())) {
      console.error(
        `Invalid date found for SLDOCNO: ${entryNoKey}, SLDATE: ${rawDate}`
      );
      continue;
    }

    const formattedDateString = formattedDate.toISOString().split("T")[0];

    if (!groupedEntries[entryNoKey]) {
      groupedEntries[entryNoKey] = {
        EntryType: entryType,
        DVNo: entryType === "Payment" ? entryNoKey : undefined,
        JVNo: entryType === "Journal" ? entryNoKey : undefined,
        CRNo: entryType === "Receipt" ? entryNoKey : undefined,
        CheckNo: entryType === "Payment" ? row["Check No."] : undefined,
        PaymentEntity:
          entryType === "Payment" ? "250 - REYES, MARITA R." : undefined,
        paymentMethods: entryType === "Receipt" ? "Cash" : undefined,
        ReceiptEntryType: entryType === "Receipt" ? "Cash Receipt" : undefined,
        [entryDateField]: formattedDateString,
        Particulars: row["SLDESC"],
        PreparedBy: { name: "Administrator", position: "Administrator" },
        CertifiedBy: { name: "Administrator", position: "Administrator" },
        ReviewedBy: { name: "Administrator", position: "Administrator" },
        ApprovedBy1: { name: "Administrator", position: "Administrator" },
        CreatedBy: { name: "Administrator", position: "Administrator" },
        ledgers: [],
        __v: 0,
        createdAt: formattedDateString,
        updatedAt: formattedDateString,
      };
    }

    let type = ["CR", "DR"];

    const slDebitValue = parseFloat(row["SLDEBIT"]) || 0;
    const slCreditValue = parseFloat(row["SLCREDIT"]) || 0;

    if (slDebitValue > 0 && slCreditValue === 0) {
      type = "DR";
    } else if (slCreditValue > 0 && slDebitValue === 0) {
      type = "CR";
    }

    const subledgerName = await getSubledgerName(row["SLCODE"]);
    const accountName = await getAccountName(row["ACCTCODE"]);

    groupedEntries[entryNoKey].ledgers.push({
      type: type,
      ledger: {
        code: row["ACCTCODE"],
        // name: row["ACCOUNT NAME"],
        name: accountName || row["ACCOUNT NAME"],
      },
      subledger: {
        slCode: row["SLCODE"],
        name: subledgerName,
      },
      dr: slDebitValue,
      cr: slCreditValue,
      description: row["SLDESC"],
    });
  }

  return Object.values(groupedEntries);
}

async function saveJson(data) {
  fs.writeFileSync(outputJsonPath, JSON.stringify(data, null, 2));
  console.log(`Data saved to ${outputJsonPath}`);
}

(async () => {
  try {
    await connectToDB();

    const rows = await processCsv();
    const groupedEntries = await transformRowsToEntries(rows);
    await saveJson(groupedEntries);
  } catch (error) {
    console.error("Error processing CSV:", error);
  } finally {
    mongoose.disconnect();
  }
})();
