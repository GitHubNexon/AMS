const EntriesModel = require("../models/EntriesModel");
const {EntriesTemp} = require("../models/EntriesModel");

const generatePaymentAutoNumber = async (month, year) => {
  const prefix = `101-${year.toString().slice(-2)}-${month}`;
  let count = 1;

  // const entries = await EntriesModel.find({
  //   DVNo: { $regex: `^${prefix}` },
  // }).sort({ DVNo: 1 });


  const entries = await EntriesModel.aggregate([
    {
      $unionWith: {
        coll: "entriescancelleds"
      }
    },
    {
      $unionWith: {
        coll: 'entriestemps'
      }
    },
    {
      $match: {
        DVNo: { $regex: `^${prefix}` }
      }
    }
  ]);
  
  // Extract existing sequence numbers
  const existingNumbers = entries.map((entry) => {
    const numPart = entry.DVNo.split("-")[3];
    return parseInt(numPart, 10);
  });

  // Find the first missing number in the sequence
  for (let i = 1; i <= existingNumbers.length + 1; i++) {
    if (!existingNumbers.includes(i)) {
      count = i;
      break;
    }
  }

  // Format count as two digits
  const paddedCount = String(count).padStart(2, "0");

  return `${prefix}-${paddedCount}`;
};

// GET method to create a new payment auto-number
const createPaymentAutoNumber = async (req, res) => {
  try {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();

    // Generate unique auto-number for Payment
    const autoNumber = await generatePaymentAutoNumber(month, year);

    // Check if the number already exists for DVNo
    const existingDocs = await EntriesModel.find({ DVNo: autoNumber });

    if (existingDocs.length > 0) {
      return res.status(409).json({
        message:
          "Auto-number conflict. Generated auto-number already exists for Payment.",
        autoNumber,
      });
    }

    return res.status(200).json({
      message: "Payment auto-number generated successfully",
      autoNumber,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const generateAutoNumber = async (numberField, month, year) => {
  const prefix = `${month}-`;
  let count = 1;

  // Fetch all documents for the month and year to check for gaps
  // const entries = await EntriesModel.find({
  //   [numberField]: { $regex: `^${prefix}` },
  // }).sort({ [numberField]: 1 });

  const entries = await EntriesModel.aggregate([
    {
      $unionWith: {
        coll: "entriescancelleds"
      }
    },
    {
      $unionWith: {
        coll: 'entriestemps'
      }
    },
    {
      $match: {
        [numberField]: { $regex: `^${prefix}` }
      }
    }
  ]);

  // Convert the entries into an array of existing numbers
  const existingNumbers = entries.map((entry) => {
    const numPart = entry[numberField].substring(3, 5); // Extract the numeric part (e.g., '02' from '11-02-2024')
    return parseInt(numPart, 10);
  });

  // Find the first missing number in the sequence
  for (let i = 1; i <= existingNumbers.length + 1; i++) {
    if (!existingNumbers.includes(i)) {
      count = i;
      break;
    }
  }

  // Format count as two digits
  const paddedCount =
    count <= 99
      ? String(count).padStart(2, "0")
      : String(count).padStart(3, "0");

  const shortYear = year.toString().slice(-2);

  // return `${month}-${paddedCount}-${year}`;
  return `${month}-${paddedCount}-${shortYear}`;
};

// Get method to create a new entry with autoNumber
const createAutoNumber = async (req, res) => {
  try {
    const { EntryType } = req.query;
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();

    if (!EntryType) {
      return res.status(400).json({
        message: "EntryType is required as a query parameter",
      });
    }

    // Map EntryType to the corresponding number field in the database
    const entryTypeMap = {
      Receipt: "CRNo",
      Payment: "DVNo",
      Journal: "JVNo",
    };

    const numberField = entryTypeMap[EntryType];

    if (!numberField) {
      return res.status(400).json({
        message:
          "Invalid EntryType. Allowed values are 'Receipt', 'Payment', or 'Journal'.",
      });
    }

    // Generate unique auto-number without looping indefinitely
    const autoNumber = await generateAutoNumber(numberField, month, year);

    // Check if the number already exists for the specific field
    const existingDocs = await EntriesModel.find({ [numberField]: autoNumber });

    if (existingDocs.length > 0) {
      return res.status(409).json({
        message:
          "Auto-number conflict. Generated auto-number already exists for this type.",
        autoNumber,
      });
    }

    return res.status(200).json({
      message: "Auto-number generated successfully",
      autoNumber,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  generatePaymentAutoNumber,
  createPaymentAutoNumber,
  createAutoNumber,
};
