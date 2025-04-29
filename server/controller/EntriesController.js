const EntriesModel = require("../models/EntriesModel");
const { EntriesDeleted, EntriesCancelled, EntriesTemp } = require("../models/EntriesModel");
const EntriesLogModel = require("../models/EntriesLog"); // to be deleted on next refactor
const userModel = require("../models/userModel");
const XlsxPopulate = require("xlsx-populate");
const fs = require("fs");
const path = require("path");

const getLog = async (req, res) => {
  try {
    const { id } = req.params;
    const logs = await EntriesLogModel.find({ entryId: id })
      .sort({ updatedDate: -1 })
      .limit(300);
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// // Helper function to generate the auto-number, filling missing numbers
// const generateAutoNumber = async (numberField, month, year) => {
//   const prefix = `${month}-`;
//   let count = 1;

//   // Fetch all documents for the month and year to check for gaps
//   const entries = await EntriesModel.find({
//     [numberField]: { $regex: `^${prefix}` },
//   }).sort({ [numberField]: 1 });

//   // Convert the entries into an array of existing numbers
//   const existingNumbers = entries.map((entry) => {
//     const numPart = entry[numberField].substring(3, 5); // Extract the numeric part (e.g., '02' from '11-02-2024')
//     return parseInt(numPart, 10);
//   });

//   // Find the first missing number in the sequence
//   for (let i = 1; i <= existingNumbers.length + 1; i++) {
//     if (!existingNumbers.includes(i)) {
//       count = i;
//       break;
//     }
//   }

//   // Format count as two digits
//   const paddedCount =
//     count <= 99
//       ? String(count).padStart(2, "0")
//       : String(count).padStart(3, "0");

//   const shortYear = year.toString().slice(-2);

//   // return `${month}-${paddedCount}-${year}`;
//   return `${month}-${paddedCount}-${shortYear}`;
// };

// // Get method to create a new entry with autoNumber
// const createAutoNumber = async (req, res) => {
//   try {
//     const { EntryType } = req.query;
//     const now = new Date();
//     const month = String(now.getMonth() + 1).padStart(2, "0");
//     const year = now.getFullYear();

//     if (!EntryType) {
//       return res.status(400).json({
//         message: "EntryType is required as a query parameter",
//       });
//     }

//     // Map EntryType to the corresponding number field in the database
//     const entryTypeMap = {
//       Receipt: "CRNo",
//       Payment: "DVNo",
//       Journal: "JVNo",
//     };

//     const numberField = entryTypeMap[EntryType];

//     if (!numberField) {
//       return res.status(400).json({
//         message:
//           "Invalid EntryType. Allowed values are 'Receipt', 'Payment', or 'Journal'.",
//       });
//     }

//     // Generate unique auto-number without looping indefinitely
//     const autoNumber = await generateAutoNumber(numberField, month, year);

//     // Check if the number already exists for the specific field
//     const existingDocs = await EntriesModel.find({ [numberField]: autoNumber });

//     if (existingDocs.length > 0) {
//       return res.status(409).json({
//         message:
//           "Auto-number conflict. Generated auto-number already exists for this type.",
//         autoNumber,
//       });
//     }

//     return res.status(200).json({
//       message: "Auto-number generated successfully",
//       autoNumber,
//     });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ message: "Server error", error: error.message });
//   }
// };

// POST method to create a new entry
const createEntry = async (req, res) => {
  try {
    const body = req.body;
    delete body._id;
    body.CreatedBy.name = `${req.user.firstName} ${req.user.middleName} ${req.user.lastName}`;
    body.CreatedBy.position = req.user.userType;
    body.CreatedBy._id = req.user._id;

    if (body.EntryType === "Receipt") {
      if (!body.ReceiptEntryType) {
        return res.status(400).json({
          message: "ReceiptEntryType is required when EntryType is 'Receipt'",
        });
      }

      if (body.ReceiptEntryType !== "Cash Receipt") {
        delete body.paymentMethods;
      }

      if (body.ReceiptEntryType === "Cash Receipt") {
        if (
          !body.paymentMethods ||
          !["Cash", "Cheque", "Others"].includes(body.paymentMethods)
        ) {
          return res.status(400).json({
            message:
              "paymentMethods must be 'Cash', 'Cheque', or 'Others' for Cash Receipt",
          });
        }
      } else if (body.ReceiptEntryType === "Deposit Slip") {
        if (body.paymentMethods) {
          return res.status(400).json({
            message: "paymentMethods should not be provided for Deposit Slip",
          });
        }
      } else {
        return res.status(400).json({
          message:
            "Invalid ReceiptEntryType. It should be 'Cash Receipt' or 'Deposit Slip'.",
        });
      }
    }

    const { DVNo, CRNo, JVNo } = body;
    let query = {};

    if (DVNo) query.DVNo = DVNo;
    if (CRNo) query.CRNo = CRNo;
    if (JVNo) query.JVNo = JVNo;

    const existingDocs = await EntriesModel.find(query);

    if (existingDocs.length > 0) {
      return res.status(400).json({
        message: "Document already exists",
        documents: existingDocs,
      });
    }

    const newEntry = new EntriesModel(body);
    // if(!body.CertifiedBy.position){
    //   delete newEntry.CertifiedBy;
    // }
    const savedEntry = await newEntry.save();
    return res.status(201).json({
      message: "Entry successfully created",
      entry: savedEntry,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

// this creates an temporary entry and is not input restricted
const createTempEntry = async (req, res) => {
  try {
    const body = req.body;

    body.CreatedBy.name = `${req.user.firstName} ${req.user.middleName} ${req.user.lastName}`;
    body.CreatedBy.position = req.user.userType;
    body.CreatedBy._id = req.user._id;

    const { DVNo, CRNo, JVNo } = body;
    let query = {};

    if (DVNo) query.DVNo = DVNo;
    if (CRNo) query.CRNo = CRNo;
    if (JVNo) query.JVNo = JVNo;

    const existingDocs = await EntriesTemp.find(query);

    if (existingDocs.length > 0) {
      return res.status(400).json({
        message: "Document already exists",
        documents: existingDocs,
      });
    }

    // ** Remove fields safely if they contain empty strings **
    if (body.ReviewedBy && body.ReviewedBy.name === '') {
      delete body.ReviewedBy;
    }
    if (body.ApprovedBy1 && body.ApprovedBy1.name === '') {
      delete body.ApprovedBy1;
    }
    if (body.ApprovedBy2 && body.ApprovedBy2.name === '') {
      delete body.ApprovedBy2;
    }

    const newEntry = new EntriesTemp(body);
    const savedEntry = await newEntry.save();

    return res.status(201).json({
      message: "Entry successfully created",
      entry: savedEntry,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};


const patchEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const entry = await EntriesModel.findById(id);

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    // log
    const logs = updatedWhat(entry, updates);

    // Check if any of the fields are being updated and if they already exist in another entry
    const checkFields = ["CRNo", "DVNo", "JVNo"];
    for (let field of checkFields) {
      if (updates[field] && updates[field] !== entry[field]) {
        const existingEntry = await EntriesModel.findOne({
          [field]: updates[field],
        });
        if (existingEntry) {
          return res.status(400).json({
            message: `${field} already exists. Please choose another one.`,
          });
        }
      }
    }

    Object.keys(updates).forEach((key) => {
      entry[key] = updates[key];
    });

    const updatedEntry = await entry.save();

    await EntriesLogModel.insertMany(
      logs.map((m) => ({
        updated: m,
        entryId: id,
        updatedDate: new Date(),
        updatedBy: req.user.name,
      }))
    );

    return res.status(200).json({
      message: "Entry successfully updated",
      entry: updatedEntry,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

const patchTempEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const entry = await EntriesTemp.findById(id);

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    // log
    // const logs = updatedWhat(entry, updates);

    // Check if any of the fields are being updated and if they already exist in another entry
    const checkFields = ["CRNo", "DVNo", "JVNo"];
    for (let field of checkFields) {
      if (updates[field] && updates[field] !== entry[field]) {
        const existingEntry = await EntriesTemp.findOne({
          [field]: updates[field],
        });
        if (existingEntry) {
          return res.status(400).json({
            message: `${field} already exists. Please choose another one.`,
          });
        }
      }
    }

    Object.keys(updates).forEach((key) => {
      entry[key] = updates[key];
    });

    const updatedEntry = await entry.save();

    // await EntriesLogModel.insertMany(
    //   logs.map((m) => ({
    //     updated: m,
    //     entryId: id,
    //     updatedDate: new Date(),
    //     updatedBy: req.user.name,
    //   }))
    // );

    return res.status(200).json({
      message: "Entry successfully updated",
      entry: updatedEntry,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

function updatedWhat(entry1, entry2) {
  const updated = [];
  if (entry1.ReceiptEntryType != entry2.ReceiptEntryType)
    updated.push({
      field: "Receipt entry type",
      oldValue: entry1.ReceiptEntryType,
      newValue: entry2.ReceiptEntryType,
    });
  if (entry1.paymentMethods != entry2.paymentMethods)
    updated.push({
      field: "Payment method",
      oldValue: entry1.paymentMethods,
      newValue: entry2.paymentMethods,
    });
  if (entry1.CRNo != entry2.CRNo)
    updated.push({
      field: "CR No",
      oldValue: entry1.CRNo,
      newValue: entry2.CRNo,
    });
  if (entry1.JVNo != entry2.JVNo)
    updated.push({
      field: "JV No",
      oldValue: entry1.JVNo,
      newValue: entry2.JVNo,
    });
  if (entry1.DVNo != entry2.DVNo)
    updated.push({
      field: "DV No",
      oldValue: entry1.DVNo,
      newValue: entry2.DVNo,
    });

  if (
    entry1.PaymentEntity &&
    entry1.PaymentEntity.name != entry2.PaymentEntity.name
  )
    updated.push({
      field: "Payment Entity",
      oldValue: entry1.PaymentEntity.name,
      newValue: entry2.PaymentEntity.name,
    });

  if (
    new Date(entry1.CRDate).toLocaleDateString("en-CA") !=
    new Date(entry2.CRDate).toLocaleDateString("en-CA")
  )
    updated.push({
      field: "CR Date",
      oldValue: new Date(entry1.CRDate).toLocaleDateString("en-CA"),
      newValue: entry2.CRDate,
    });
  if (
    new Date(entry1.JVDate).toLocaleDateString("en-CA") !=
    new Date(entry2.JVDate).toLocaleDateString("en-CA")
  )
    updated.push({
      field: "JV Date",
      oldValue: new Date(entry1.JVDate).toLocaleDateString("en-CA"),
      newValue: entry2.JVDate,
    });
  if (
    new Date(entry1.DVDate).toLocaleDateString("en-CA") !=
    new Date(entry2.DVDate).toLocaleDateString("en-CA")
  )
    updated.push({
      field: "DV Date",
      oldValue: new Date(entry1.DVDate).toLocaleDateString("en-CA"),
      newValue: entry2.DVDate,
    });

  if (entry1.CheckNo != entry2.CheckNo)
    updated.push({
      field: "Check No",
      oldValue: entry1.CheckNo,
      newValue: entry2.CheckNo,
    });

  if (entry2.Particulars && entry1.Particulars != entry2.Particulars)
    updated.push({
      field: "Particulars",
      oldValue: entry1.Particulars,
      newValue: entry2.Particulars,
    });
  if (entry2.CreatedBy && entry1.CreatedBy.name != entry2.CreatedBy.name)
    updated.push({
      field: "Created By",
      oldValue: entry1.CreatedBy.name,
      newValue: entry2.CreatedBy.name,
    });
  if (entry2.PreparedBy && entry1.PreparedBy.name != entry2.PreparedBy.name)
    updated.push({
      field: "Prepared By",
      oldValue: entry1.PreparedBy.name,
      newValue: entry2.PreparedBy.name,
    });
  if (entry2.CertifiedBy && entry1.CertifiedBy.name != entry2.CertifiedBy.name)
    updated.push({
      field: "Certified By",
      oldValue: entry1.CertifiedBy.name,
      newValue: entry2.CertifiedBy.name,
    });
  if (entry2.ReviewedBy && entry1.ReviewedBy.name != entry2.ReviewedBy.name)
    updated.push({
      field: "Reviewed By",
      oldValue: entry1.ReviewedBy.name,
      newValue: entry2.ReviewedBy.name,
    });
  if (entry2.ApprovedBy1 && (entry1?.ApprovedBy1?.name || '') != entry2.ApprovedBy1.name)
    updated.push({
      field: "Approved By",
      oldValue: (entry1?.ApprovedBy1?.name || ''),
      newValue: entry2.ApprovedBy1.name,
  });
  if (entry2.ApprovedBy2 && (entry1?.ApprovedBy2?.name || '') != entry2.ApprovedBy2.name)
    updated.push({
      field: "Approved By",
      oldValue: (entry1?.ApprovedBy2?.name || ''),
      newValue: entry2.ApprovedBy2.name,
  });

  const ent1c = entry1.ledgers.map((m) => ({
    type: m.type,
    glCode: m.ledger.code,
    glName: m.ledger.name,
    slCode: m.subledger.slCode,
    slName: m.subledger.name,
    dr: m.dr,
    cr: m.cr,
    description: m.description,
  }));
  const ent2c = entry2.ledgers.map((m) => ({
    type: m.type,
    glCode: m.ledger.code,
    glName: m.ledger.name,
    slCode: m.subledger.slCode,
    slName: m.subledger.name,
    dr: m.dr,
    cr: m.cr,
    description: m.description,
  }));
  const glChanges = compareArrays(ent1c, ent2c);
  if (glChanges.added.length > 0 || glChanges.removed.length > 0) {
    updated.push({
      field: "Ledgers",
      oldValue: ent1c,
      newValue: ent2c,
    });
  }
  return updated;
}

function compareArrays(oldArray, newArray) {
  const oldSet = new Set(oldArray.map((obj) => JSON.stringify(obj)));
  const newSet = new Set(newArray.map((obj) => JSON.stringify(obj)));
  const removed = oldArray.filter((obj) => !newSet.has(JSON.stringify(obj)));
  const added = newArray.filter((obj) => !oldSet.has(JSON.stringify(obj)));
  return { added, removed };
}

const deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const userInfo = req.user;
    const ent = await EntriesModel.findById(id);
    // entry may be cancelled and no longer in this collection
    if (ent) {
      ent.deletedBy = userInfo.name;
      await ent.save();
      const entry = await EntriesModel.findByIdAndDelete(id);
      // logs
      await new EntriesLogModel({
        entryId: id,
        updated: {
          field: "Deleted",
          oldValue: "",
          newValue: "",
        },
        updatedDate: new Date(),
        updatedBy: req.user.name,
      }).save();
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
    } else {
      const entry = await EntriesCancelled.findById(id);
      // move to deleted entries
      entry.deletedBy = userInfo.name;
      entry.deletedDate = new Date();
      await EntriesDeleted.create(entry.toObject());
      // delete from canceleld
      await EntriesCancelled.deleteOne({ _id: id });
    }
    return res.status(200).json({ message: "Entry successfully deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

// GET method to fetch entries with EntryType === "Receipt"
const getAllReceipts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const keyword = req.query.keyword || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? -1 : 1;
    const date = req.query.date;

    const query = {
      EntryType: "Receipt",
      ...(keyword && {
        $or: [
          { CRNo: { $regex: "^" + keyword, $options: "i" } },
          { ReceiptEntryType: { $regex: keyword, $options: "i" } },
          { paymentMethods: { $regex: keyword, $options: "i" } },
          { Particulars: { $regex: keyword, $options: "i" } },
          { "CreatedBy.name": { $regex: keyword, $options: "i" } },
          { "PreparedBy.name": { $regex: keyword, $options: "i" } },
          { "CertifiedBy.name": { $regex: keyword, $options: "i" } },
          { "ReviewedBy.name": { $regex: keyword, $options: "i" } },
          { "ApprovedBy1.name": { $regex: keyword, $options: "i" } },
          { "ApprovedBy2.name": { $regex: keyword, $options: "i" } },
          { tag: { $regex: keyword, $options: "i" } },
        ],
      }),
      ...(date && {
        createdAt: {
          $gte: new Date(`${date}T00:00:00.000Z`),
          $lt: new Date(`${date}T23:59:59.999Z`),
        },
      }),
    };

    const sortCriteria = sortBy ? { [sortBy]: sortOrder, CRNo: sortOrder } : {};
    const totalItems = await EntriesModel.countDocuments(query);
    const receipts = await EntriesModel.aggregate([
      { $unionWith: "entriescancelleds" },
      { $match: query },
    ])
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      entries: receipts,
    });
  } catch (error) {
    console.error("Error fetching receipts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET method to fetch entries with EntryType === "Payment"
const getAllPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const keyword = req.query.keyword || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? -1 : 1;
    const date = req.query.date;

    const query = {
      EntryType: "Payment",
      ...(keyword && {
        $or: [
          { DVNo: { $regex: "^" + keyword, $options: "i" } },
          { CheckNo: { $regex: keyword, $options: "i" } },
          { PaymentEntity: { $regex: keyword, $options: "i" } },
          { Particulars: { $regex: keyword, $options: "i" } },
          { "CreatedBy.name": { $regex: keyword, $options: "i" } },
          { "PreparedBy.name": { $regex: keyword, $options: "i" } },
          { "CertifiedBy.name": { $regex: keyword, $options: "i" } },
          { "ReviewedBy.name": { $regex: keyword, $options: "i" } },
          { "ApprovedBy1.name": { $regex: keyword, $options: "i" } },
          { "ApprovedBy2.name": { $regex: keyword, $options: "i" } },
          { tag: { $regex: keyword, $options: "i" } },
        ],
      }),
      ...(date && {
        createdAt: {
          $gte: new Date(`${date}T00:00:00.000Z`),
          $lt: new Date(`${date}T23:59:59.999Z`),
        },
      }),
    };
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! BUG SORTING ORDER NOT WORKING IN DV Number
    const sortCriteria = sortBy ? { [sortBy]: sortOrder, DVNo: sortOrder } : {};
    const totalItems = await EntriesModel.countDocuments(query);
    const payments = await EntriesModel.aggregate([
      { $unionWith: "entriescancelleds" },
      { $match: query },
    ])
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      entries: payments,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET method to fetch entries with EntryType === "Journal"
const getAllJournals = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const keyword = req.query.keyword || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? -1 : 1;
    const date = req.query.date;

    const query = {
      EntryType: "Journal",
      ...(keyword && {
        $or: [
          { JVNo: { $regex: "^" + keyword, $options: "i" } },
          { Particulars: { $regex: keyword, $options: "i" } },
          { "CreatedBy.name": { $regex: keyword, $options: "i" } },
          { "PreparedBy.name": { $regex: keyword, $options: "i" } },
          { "CertifiedBy.name": { $regex: keyword, $options: "i" } },
          { "ReviewedBy.name": { $regex: keyword, $options: "i" } },
          { "ApprovedBy1.name": { $regex: keyword, $options: "i" } },
          { "ApprovedBy2.name": { $regex: keyword, $options: "i" } },
          { tag: { $regex: keyword, $options: "i" } },
        ],
      }),
      ...(date && {
        createdAt: {
          $gte: new Date(`${date}T00:00:00.000Z`),
          $lt: new Date(`${date}T23:59:59.999Z`),
        },
      }),
    };

    const sortCriteria = sortBy ? { [sortBy]: sortOrder, JVNo: sortOrder } : {};
    const totalItems = await EntriesModel.countDocuments(query);
    const journals = await EntriesModel.aggregate([
      { $unionWith: "entriescancelleds" },
      { $match: query },
    ])
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      entries: journals,
    });
  } catch (error) {
    console.error("Error fetching journals:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const findEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await EntriesModel.findById(id);
    res.json(doc);
  } catch (error) {
    console.error("Error fetching journals:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET method to fetch all entries
const getAllEntry = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const keyword = req.query.keyword || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? -1 : 1;
    const date = req.query.date;

    const query = {
      ...{ EntryType: { $ne: "Closing" } },
      ...(keyword && {
        $or: [
          { EntryType: { $regex: keyword, $options: "i" } },
          { CRNo: { $regex: "^" + keyword, $options: "i" } },
          { DVNo: { $regex: "^" + keyword, $options: "i" } },
          { JVNo: { $regex: "^" + keyword, $options: "i" } },
          { CheckNo: { $regex: keyword, $options: "i" } },
          { ReceiptEntryType: { $regex: keyword, $options: "i" } },
          { paymentMethods: { $regex: keyword, $options: "i" } },
          { Particulars: { $regex: keyword, $options: "i" } },
          { "CreatedBy.name": { $regex: keyword, $options: "i" } },
          { "PreparedBy.name": { $regex: keyword, $options: "i" } },
          { "CertifiedBy.name": { $regex: keyword, $options: "i" } },
          { "ReviewedBy.name": { $regex: keyword, $options: "i" } },
          { "ApprovedBy1.name": { $regex: keyword, $options: "i" } },
          { "ApprovedBy2.name": { $regex: keyword, $options: "i" } },
          { tag: { $regex: keyword, $options: "i" } },
        ],
      }),
      ...(date && {
        createdAt: {
          $gte: new Date(`${date}T00:00:00.000Z`),
          $lt: new Date(`${date}T23:59:59.999Z`),
        },
      }),
    };

    const sortCriteria = sortBy ? { [sortBy]: sortOrder } : {};
    const totalItems = await EntriesModel.countDocuments(query);
    const entries = await EntriesModel.aggregate([
      { $unionWith: "entriescancelleds" },
      { $match: query },
    ])
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      entries,
    });
  } catch (error) {
    console.error("Error fetching entries:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET method to fetch all existing JVNo, CRNo, DVNo along with EntryType
const getAllUsedNumbers = async (req, res) => {
  try {
    const entries = await EntriesModel.find({
      $or: [
        { JVNo: { $exists: true, $ne: null } },
        { CRNo: { $exists: true, $ne: null } },
        { DVNo: { $exists: true, $ne: null } },
      ],
    }).select("EntryType JVNo CRNo DVNo");

    const usedNumbers = entries.flatMap((entry) => {
      const numbers = [];
      if (entry.JVNo) numbers.push({ JVNo: entry.JVNo, type: "Journal" });
      if (entry.CRNo) numbers.push({ CRNo: entry.CRNo, type: "Receipt" });
      if (entry.DVNo) numbers.push({ DVNo: entry.DVNo, type: "Payment" });
      return numbers;
    });

    return res.status(200).json({
      message: "Used numbers fetched successfully",
      usedNumbers,
    });
  } catch (error) {
    console.error("Error fetching used numbers:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const exportRentalAccrual = async (req, res) => {
  try {
    const defaultBorder = { style: "thin", color: "000000" };
    const entrydata = req.body;
    // open excel template and append data
    const templatePath = path.join(
      __dirname,
      "../helper/",
      "rentalaccrualtemplate.xlsx"
    );
    const workbook = await XlsxPopulate.fromFileAsync(templatePath);
    const sheet = workbook.sheet(0);
    // set JV No and date
    sheet.cell("F3").value(entrydata.JVNo);
    sheet.cell("F4").value(entrydata.JVDate);
    // last available row
    const usedRange = sheet.usedRange();
    let lastRow = usedRange._maxRowNumber;
    // write accounts info
    for (let i = 0; i < entrydata.table.length; i++) {
      sheet
        .row(lastRow)
        .cell(1)
        .value(entrydata.table[i].accountCode)
        .style({
          border: {
            right: { style: "dashed", color: "000000" },
            left: defaultBorder,
          },
        });
      sheet
        .row(lastRow)
        .cell(2)
        .value(entrydata.table[i].accountTitle)
        .style({ border: { right: { style: "dashed", color: "000000" } } });
      sheet
        .row(lastRow)
        .cell(3)
        .value(entrydata.table[i].d1)
        .style({ border: { right: { style: "dashed", color: "000000" } } });
      sheet
        .row(lastRow)
        .cell(4)
        .value(entrydata.table[i].c1)
        .style({ border: { right: { style: "dashed", color: "000000" } } });
      sheet
        .row(lastRow)
        .cell(5)
        .value(entrydata.table[i].d2)
        .style({ border: { right: { style: "dashed", color: "000000" } } });
      sheet.row(lastRow).cell(6).value(entrydata.table[i].c2);
      lastRow++; // increment to proceed next row
    }
    sheet
      .row(lastRow - 1)
      .cell(1)
      .style({ border: { top: defaultBorder, left: defaultBorder } });
    sheet
      .row(lastRow - 1)
      .cell(2)
      .style({ border: { top: defaultBorder } });
    sheet
      .row(lastRow - 1)
      .cell(3)
      .style({ border: { top: defaultBorder } });
    sheet
      .row(lastRow - 1)
      .cell(4)
      .style({ border: { top: defaultBorder } });
    sheet
      .row(lastRow - 1)
      .cell(5)
      .style({ border: { top: defaultBorder } });
    sheet
      .row(lastRow - 1)
      .cell(6)
      .style({ border: { top: defaultBorder, right: defaultBorder } });
    // begin building footer
    // empty row with border
    sheet.range(`A${lastRow}:F${lastRow}`).merged(true);
    sheet.range(`A${lastRow}:F${lastRow}`).style({
      border: {
        bottom: defaultBorder,
        left: defaultBorder,
        right: defaultBorder,
      },
    });
    lastRow++; // increment to proceed next row
    // EXPLANATION
    // empty row
    sheet
      .row(lastRow)
      .cell(1)
      .value("")
      .style({ border: { left: defaultBorder } });
    sheet
      .row(lastRow)
      .cell(6)
      .value("")
      .style({ border: { right: defaultBorder } });
    lastRow++; // increment to proceed next row
    sheet.range(`A${lastRow}:F${lastRow}`).merged(true); // merge last row
    sheet
      .row(lastRow)
      .cell(1)
      .value("EXPLANATION:")
      .style({
        border: { left: defaultBorder, right: defaultBorder },
        horizontalAlignment: "left",
      });
    lastRow++; // increment to proceed next row
    sheet.range(`A${lastRow}:F${lastRow}`).merged(true); // merge last row
    sheet
      .row(lastRow)
      .cell(1)
      .value(entrydata.Particulars)
      .style({
        border: { left: defaultBorder, right: defaultBorder },
        horizontalAlignment: "left",
      });
    lastRow++; // increment to proceed next row
    // empty row with border bottom
    sheet.range(`A${lastRow}:F${lastRow}`).merged(true);
    sheet.range(`A${lastRow}:F${lastRow}`).style({
      border: {
        bottom: defaultBorder,
        left: defaultBorder,
        right: defaultBorder,
      },
    });
    lastRow++; // increment to proceed next row
    // ATTACHMENTS
    // empty row
    sheet
      .row(lastRow)
      .cell(1)
      .value("")
      .style({ border: { left: defaultBorder } });
    sheet
      .row(lastRow)
      .cell(6)
      .value("")
      .style({ border: { right: defaultBorder } });
    lastRow++; // increment to proceed next row
    sheet.range(`A${lastRow}:F${lastRow}`).merged(true); // merge last row
    sheet
      .row(lastRow)
      .cell(1)
      .value("ATTACHMENTS:")
      .style({
        border: { left: defaultBorder, right: defaultBorder },
        horizontalAlignment: "left",
      });
    lastRow++; // increment to proceed next row
    sheet.range(`A${lastRow}:F${lastRow}`).merged(true); // merge last row
    sheet
      .row(lastRow)
      .cell(1)
      .value(
        entrydata.Attachments.length > 0
          ? entrydata.Attachments.reduce((pre, cur) => pre + " " + cur, "")
          : ""
      )
      .style({
        border: { left: defaultBorder, right: defaultBorder },
        horizontalAlignment: "left",
      });
    lastRow++; // increment to proceed next row
    // empty row with border bottom
    sheet.range(`A${lastRow}:F${lastRow}`).merged(true);
    sheet.range(`A${lastRow}:F${lastRow}`).style({
      border: {
        bottom: defaultBorder,
        left: defaultBorder,
        right: defaultBorder,
      },
    });
    lastRow++; // increment to proceed next row
    // PREPARED BY
    sheet
      .row(lastRow)
      .cell(1)
      .value("PREPARED BY:")
      .style({ border: { left: defaultBorder }, horizontalAlignment: "left" });
    sheet
      .row(lastRow)
      .cell(2)
      .value("DATE")
      .style({
        border: { right: defaultBorder },
        horizontalAlignment: "center",
      });
    sheet
      .row(lastRow)
      .cell(3)
      .value("BUDGET")
      .style({
        border: { right: defaultBorder },
        horizontalAlignment: "center",
      });
    sheet
      .row(lastRow)
      .cell(4)
      .value("BALANCE")
      .style({
        border: { right: defaultBorder },
        horizontalAlignment: "center",
      });
    sheet
      .row(lastRow)
      .cell(5)
      .value("THIS JV")
      .style({
        border: { right: defaultBorder },
        horizontalAlignment: "center",
      });
    sheet
      .row(lastRow)
      .cell(6)
      .value("")
      .style({ border: { right: defaultBorder } });
    lastRow++;
    sheet
      .row(lastRow)
      .cell(1)
      .value("")
      .style({ border: { left: defaultBorder }, horizontalAlignment: "left" });
    sheet
      .row(lastRow)
      .cell(2)
      .value("")
      .style({
        border: { right: defaultBorder },
        horizontalAlignment: "center",
      });
    sheet
      .row(lastRow)
      .cell(3)
      .value("ITEM")
      .style({
        border: { right: defaultBorder },
        horizontalAlignment: "center",
      });
    sheet
      .row(lastRow)
      .cell(4)
      .value("BEFORE")
      .style({
        border: { right: defaultBorder },
        horizontalAlignment: "center",
      });
    sheet
      .row(lastRow)
      .cell(5)
      .value("")
      .style({
        border: { right: defaultBorder },
        horizontalAlignment: "center",
      });
    sheet
      .row(lastRow)
      .cell(6)
      .value("BALANCE")
      .style({
        border: { right: defaultBorder },
        horizontalAlignment: "center",
      });
    lastRow++;
    sheet
      .row(lastRow)
      .cell(1)
      .value(entrydata.PreparedBy)
      .style({
        bold: true,
        border: { left: defaultBorder, bottom: defaultBorder },
        horizontalAlignment: "left",
      });
    sheet
      .row(lastRow)
      .cell(2)
      .value("")
      .style({
        border: { right: defaultBorder, bottom: defaultBorder },
        horizontalAlignment: "center",
      });
    sheet
      .row(lastRow)
      .cell(3)
      .value("")
      .style({
        border: { right: defaultBorder, bottom: defaultBorder },
        horizontalAlignment: "center",
      });
    sheet
      .row(lastRow)
      .cell(4)
      .value("")
      .style({
        border: { right: defaultBorder, bottom: defaultBorder },
        horizontalAlignment: "center",
      });
    sheet
      .row(lastRow)
      .cell(5)
      .value("")
      .style({
        border: { right: defaultBorder, bottom: defaultBorder },
        horizontalAlignment: "center",
      });
    sheet
      .row(lastRow)
      .cell(6)
      .value("")
      .style({ border: { right: defaultBorder, bottom: defaultBorder } });
    lastRow++;
    // VERIFIED BY
    sheet.range(`C${lastRow}:E${lastRow}`).merged(true);
    sheet
      .row(lastRow)
      .cell(1)
      .value("VERIFIED BY:")
      .style({ border: { left: defaultBorder }, horizontalAlignment: "left" });
    sheet
      .row(lastRow)
      .cell(2)
      .value("DATE")
      .style({
        border: { right: defaultBorder },
        horizontalAlignment: "center",
      });
    sheet
      .row(lastRow)
      .cell(3)
      .value("BUDGET OFFICER:")
      .style({ horizontalAlignment: "left" });
    sheet
      .row(lastRow)
      .cell(5)
      .value("")
      .style({ border: { right: defaultBorder } });
    sheet
      .row(lastRow)
      .cell(6)
      .value("DATE")
      .style({ border: { right: defaultBorder }, horizontalAlignment: "left" });
    lastRow++;
    sheet.range(`C${lastRow}:E${lastRow}`).merged(true);
    sheet
      .row(lastRow)
      .cell(1)
      .value("")
      .style({ border: { left: defaultBorder }, horizontalAlignment: "left" });
    sheet
      .row(lastRow)
      .cell(2)
      .value("")
      .style({
        border: { right: defaultBorder },
        horizontalAlignment: "center",
      });
    sheet.row(lastRow).cell(3).value("").style({ horizontalAlignment: "left" });
    sheet
      .row(lastRow)
      .cell(5)
      .value("")
      .style({ border: { right: defaultBorder } });
    sheet
      .row(lastRow)
      .cell(6)
      .value("")
      .style({ border: { right: defaultBorder }, horizontalAlignment: "left" });
    lastRow++;
    sheet.range(`C${lastRow}:E${lastRow}`).merged(true);
    sheet
      .row(lastRow)
      .cell(1)
      .value(entrydata.CertifiedBy)
      .style({
        bold: true,
        border: { left: defaultBorder, bottom: defaultBorder },
        horizontalAlignment: "left",
      });
    sheet
      .row(lastRow)
      .cell(2)
      .value("")
      .style({
        border: { right: defaultBorder, bottom: defaultBorder },
        horizontalAlignment: "center",
      });
    sheet
      .row(lastRow)
      .cell(3)
      .value("")
      .style({
        border: { bottom: defaultBorder },
        horizontalAlignment: "left",
      });
    sheet
      .row(lastRow)
      .cell(4)
      .value("")
      .style({ border: { right: defaultBorder, bottom: defaultBorder } });
    sheet
      .row(lastRow)
      .cell(5)
      .value("")
      .style({ border: { right: defaultBorder, bottom: defaultBorder } });
    sheet
      .row(lastRow)
      .cell(6)
      .value("")
      .style({
        border: { right: defaultBorder, bottom: defaultBorder },
        horizontalAlignment: "left",
      });
    lastRow++;
    // RECEIVED BY
    sheet.range(`C${lastRow}:E${lastRow}`).merged(true);
    sheet
      .row(lastRow)
      .cell(1)
      .value("APPROVED BY:")
      .style({ border: { left: defaultBorder }, horizontalAlignment: "left" });
    sheet
      .row(lastRow)
      .cell(2)
      .value("DATE")
      .style({
        border: { right: defaultBorder },
        horizontalAlignment: "center",
      });
    sheet
      .row(lastRow)
      .cell(3)
      .value("COA RECEIVING CLERK")
      .style({ horizontalAlignment: "left" });
    sheet
      .row(lastRow)
      .cell(5)
      .value("")
      .style({ border: { right: defaultBorder } });
    sheet
      .row(lastRow)
      .cell(6)
      .value("DATE")
      .style({ border: { right: defaultBorder }, horizontalAlignment: "left" });
    lastRow++;
    sheet.range(`C${lastRow}:E${lastRow}`).merged(true);
    sheet
      .row(lastRow)
      .cell(1)
      .value("")
      .style({ border: { left: defaultBorder }, horizontalAlignment: "left" });
    sheet
      .row(lastRow)
      .cell(2)
      .value("")
      .style({
        border: { right: defaultBorder },
        horizontalAlignment: "center",
      });
    sheet.row(lastRow).cell(3).value("").style({ horizontalAlignment: "left" });
    sheet
      .row(lastRow)
      .cell(5)
      .value("")
      .style({ border: { right: defaultBorder } });
    sheet
      .row(lastRow)
      .cell(6)
      .value("")
      .style({ border: { right: defaultBorder }, horizontalAlignment: "left" });
    lastRow++;
    sheet.range(`C${lastRow}:E${lastRow}`).merged(true);
    sheet
      .row(lastRow)
      .cell(1)
      .value(entrydata.ApprovedBy)
      .style({
        bold: true,
        border: { left: defaultBorder, bottom: defaultBorder },
        horizontalAlignment: "left",
      });
    sheet
      .row(lastRow)
      .cell(2)
      .value("")
      .style({
        border: { right: defaultBorder, bottom: defaultBorder },
        horizontalAlignment: "center",
      });
    sheet
      .row(lastRow)
      .cell(3)
      .value("")
      .style({
        border: { bottom: defaultBorder },
        horizontalAlignment: "left",
      });
    sheet
      .row(lastRow)
      .cell(4)
      .value("")
      .style({ border: { right: defaultBorder, bottom: defaultBorder } });
    sheet
      .row(lastRow)
      .cell(5)
      .value("")
      .style({ border: { right: defaultBorder, bottom: defaultBorder } });
    sheet
      .row(lastRow)
      .cell(6)
      .value("")
      .style({
        border: { right: defaultBorder, bottom: defaultBorder },
        horizontalAlignment: "left",
      });
    lastRow++;
    // GL BY
    sheet.range(`C${lastRow}:E${lastRow}`).merged(true);
    sheet
      .row(lastRow)
      .cell(1)
      .value("POSTED TO GL BY:")
      .style({ border: { left: defaultBorder }, horizontalAlignment: "left" });
    sheet
      .row(lastRow)
      .cell(2)
      .value("DATE")
      .style({
        border: { right: defaultBorder },
        horizontalAlignment: "center",
      });
    sheet
      .row(lastRow)
      .cell(3)
      .value("ACKNOWLEDGED BY:")
      .style({ horizontalAlignment: "left" });
    sheet
      .row(lastRow)
      .cell(5)
      .value("")
      .style({ border: { right: defaultBorder } });
    sheet
      .row(lastRow)
      .cell(6)
      .value("DATE")
      .style({ border: { right: defaultBorder }, horizontalAlignment: "left" });
    lastRow++;
    sheet.range(`C${lastRow}:E${lastRow}`).merged(true);
    sheet
      .row(lastRow)
      .cell(1)
      .value("")
      .style({ border: { left: defaultBorder }, horizontalAlignment: "left" });
    sheet
      .row(lastRow)
      .cell(2)
      .value("")
      .style({
        border: { right: defaultBorder },
        horizontalAlignment: "center",
      });
    sheet.row(lastRow).cell(3).value("").style({ horizontalAlignment: "left" });
    sheet
      .row(lastRow)
      .cell(5)
      .value("")
      .style({ border: { right: defaultBorder } });
    sheet
      .row(lastRow)
      .cell(6)
      .value("")
      .style({ border: { right: defaultBorder }, horizontalAlignment: "left" });
    lastRow++;
    sheet.range(`C${lastRow}:E${lastRow}`).merged(true);
    sheet
      .row(lastRow)
      .cell(1)
      .value("")
      .style({
        border: { left: defaultBorder, bottom: defaultBorder },
        horizontalAlignment: "left",
      });
    sheet
      .row(lastRow)
      .cell(2)
      .value("")
      .style({
        border: { right: defaultBorder, bottom: defaultBorder },
        horizontalAlignment: "center",
      });
    sheet
      .row(lastRow)
      .cell(3)
      .value("COA OFFICER/REPRESENTATIVE")
      .style({
        border: { bottom: defaultBorder },
        horizontalAlignment: "left",
      });
    sheet
      .row(lastRow)
      .cell(4)
      .value("")
      .style({ border: { right: defaultBorder, bottom: defaultBorder } });
    sheet
      .row(lastRow)
      .cell(5)
      .value("")
      .style({ border: { right: defaultBorder, bottom: defaultBorder } });
    sheet
      .row(lastRow)
      .cell(6)
      .value("")
      .style({
        border: { right: defaultBorder, bottom: defaultBorder },
        horizontalAlignment: "left",
      });
    lastRow++;
    // SL BY
    sheet.range(`C${lastRow}:E${lastRow}`).merged(true);
    sheet
      .row(lastRow)
      .cell(1)
      .value("POSTED TO SL BY:")
      .style({ border: { left: defaultBorder }, horizontalAlignment: "left" });
    sheet
      .row(lastRow)
      .cell(2)
      .value("DATE")
      .style({
        border: { right: defaultBorder },
        horizontalAlignment: "center",
      });
    sheet.row(lastRow).cell(3).value("").style({ horizontalAlignment: "left" });
    sheet
      .row(lastRow)
      .cell(5)
      .value("")
      .style({ border: { right: defaultBorder } });
    sheet
      .row(lastRow)
      .cell(6)
      .value("")
      .style({ border: { right: defaultBorder }, horizontalAlignment: "left" });
    lastRow++;
    sheet.range(`C${lastRow}:E${lastRow}`).merged(true);
    sheet
      .row(lastRow)
      .cell(1)
      .value("")
      .style({ border: { left: defaultBorder }, horizontalAlignment: "left" });
    sheet
      .row(lastRow)
      .cell(2)
      .value("")
      .style({
        border: { right: defaultBorder },
        horizontalAlignment: "center",
      });
    sheet.row(lastRow).cell(3).value("").style({ horizontalAlignment: "left" });
    sheet
      .row(lastRow)
      .cell(5)
      .value("")
      .style({ border: { right: defaultBorder } });
    sheet
      .row(lastRow)
      .cell(6)
      .value("")
      .style({ border: { right: defaultBorder }, horizontalAlignment: "left" });
    lastRow++;
    sheet.range(`C${lastRow}:E${lastRow}`).merged(true);
    sheet
      .row(lastRow)
      .cell(1)
      .value("")
      .style({
        border: { left: defaultBorder, bottom: defaultBorder },
        horizontalAlignment: "left",
      });
    sheet
      .row(lastRow)
      .cell(2)
      .value("")
      .style({
        border: { right: defaultBorder, bottom: defaultBorder },
        horizontalAlignment: "center",
      });
    sheet
      .row(lastRow)
      .cell(3)
      .value("JV NO")
      .style({
        bold: true,
        border: { bottom: defaultBorder },
        horizontalAlignment: "right",
      });
    sheet
      .row(lastRow)
      .cell(4)
      .value("")
      .style({ border: { right: defaultBorder, bottom: defaultBorder } });
    sheet
      .row(lastRow)
      .cell(5)
      .value("")
      .style({ border: { right: defaultBorder, bottom: defaultBorder } });
    sheet
      .row(lastRow)
      .cell(6)
      .value(entrydata.JVNo)
      .style({
        bold: true,
        border: { right: defaultBorder, bottom: defaultBorder },
        horizontalAlignment: "left",
      });
    lastRow++;
    // respond with workbook buffer for file download
    const buffer = await workbook.outputAsync();
    res.setHeader(
      "Content-Dispositiom",
      'attachment; filename="updated_rentalaccrualtemplate.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxlmformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error) {
    console.error("error on exporting rental accural to xlsx", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const getEntriesDeleted = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const skip = (pageInt - 1) * limitInt;
    const count = await EntriesDeleted.countDocuments();
    const entries = await EntriesDeleted.find()
      .sort({ deletedDate: -1 })
      .skip(skip)
      .limit(limitInt);
    res.json({ entries: entries, count: count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const undoDeleted = async (req, res) => {
  try {
    const { id } = req.params;
    const entry = await EntriesDeleted.findById(id);
    entry.deletedBy = null;
    entry.deletedDate = null;
    if (!entry.cancelledDate) {
      // return to entries
      await EntriesModel.create(entry.toObject());
    } else {
      // return to cancelled entries
      await EntriesCancelled.create(entry.toObject());
    }
    await EntriesDeleted.deleteOne({ _id: id });
    // log
    await new EntriesLogModel({
      entryId: id,
      updated: {
        field: "Restored",
        oldValue: "",
        newValue: "",
      },
      updatedDate: new Date(),
      updatedBy: req.user.name,
    }).save();
    res.json({ message: "Entry restored" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const cancelEntry = async (req, res) => {
  try {
    const { id } = req.params;
    // find that entry
    const entry = await EntriesModel.findById(id);
    const doc = entry;
    doc.cancelledBy = req.user.name;
    doc.cancelledDate = new Date();
    await EntriesCancelled.create(doc.toObject());
    await EntriesModel.deleteOne({ _id: id });
    // log
    await new EntriesLogModel({
      entryId: id,
      updated: {
        field: "Cancelled",
        oldValue: "",
        newValue: "",
      },
      updatedDate: new Date(),
      updatedBy: req.user.name,
    }).save();
    res.json([]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const undoCancelEntry = async (req, res) => {
  try {
    const { id } = req.params;
    // find that entry
    const entry = await EntriesCancelled.findById(id);
    const doc = entry;
    if (doc) {
      doc.cancelledBy = null;
      doc.cancelledDate = null;
      await EntriesModel.create(doc.toObject());
    }
    await EntriesCancelled.deleteOne({ _id: id });

    // log
    await new EntriesLogModel({
      entryId: id,
      updated: {
        field: "Undo cancel",
        oldValue: "",
        newValue: "",
      },
      updatedDate: new Date(),
      updatedBy: req.user.name,
    }).save();

    res.json([]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

async function findTin(req, res) {
  try {
    const { tin } = req.params;

    const found = await EntriesModel.aggregate([
      [
        // First Aggregation
        { $project: { _id: 0, ledgers: 1 } },
        { $unwind: "$ledgers" },
        { $replaceRoot: { newRoot: "$ledgers" } },
        { $match: { it: { $ne: "" } } },
        { $project: { _id: 0, it: 1 } },
        { $unwind: { path: "$it" } },
        { $replaceRoot: { newRoot: "$it" } },
        {
          $project: {
            tin: 1,
            registeredName: 1,
            supplierName: 1,
            supplierAddress: 1,
          },
        },
        {
          $group: {
            _id: "$tin",
            registeredName: { $first: "$registeredName" },
            allSupplierNames: { $push: "$supplierName" },
            allSupplierAddresses: { $push: "$supplierAddress" },
          },
        },
        {
          $project: {
            _id: 0,
            tin: "$_id",
            registeredName: 1,
            name: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$allSupplierNames",
                    as: "name",
                    cond: { $ne: ["$$name", null] },
                  },
                },
                0,
              ],
            },
            address: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$allSupplierAddresses",
                    as: "address",
                    cond: { $ne: ["$$address", null] },
                  },
                },
                0,
              ],
            },
          },
        },

        // Merge with Second Aggregation using $unionWith
        {
          $unionWith: {
            coll: "collection_name", // Replace with actual collection name
            pipeline: [
              {
                $match: {
                  tin: { $ne: null },
                },
              },
              {
                $project: {
                  _id: 0,
                  tin: 1,
                  registeredName: "$name",
                  name: "$name",
                  address: "$address",
                },
              },
            ],
          },
        },

        // Final Grouping by TIN to avoid duplicates
        {
          $group: {
            _id: "$tin",
            registeredName: { $first: "$registeredName" },
            name: { $first: "$name" },
            address: { $first: "$address" },
          },
        },
        {
          $project: {
            _id: 0,
            tin: "$_id",
            registeredName: 1,
            name: 1,
            address: 1,
          },
        },
        {$match: {
          tin: tin
        }}
      ]
    ]);
    res.json(found);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}



module.exports = {
  createEntry,
  patchEntry,
  deleteEntry,
  getAllReceipts,
  getAllPayments,
  getAllJournals,
  getAllEntry,
  // createAutoNumber,
  getAllUsedNumbers,
  exportRentalAccrual,
  findEntry,

  getEntriesDeleted,
  undoDeleted,
  getLog,
  cancelEntry,
  undoCancelEntry,
  findTin,

  patchTempEntry,
  createTempEntry
};
