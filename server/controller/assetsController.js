const AssetsModel = require("../models/AssetsModel");
const AssetsIssuanceModel = require("../models/AssetsIssuanceModel");
const AssetsReturnModel = require("../models/AssetsReturnModel");
const EmployeeModel = require("../models/employeeModel");

const createAssetsRecord = async (req, res) => {
  try {
    const AssetsData = req.body;
    const newAsset = new AssetsModel(AssetsData);

    await newAsset.save();
    res
      .status(201)
      .json({ message: "Assets record created successfully", data: newAsset });
  } catch (error) {
    console.error("Error creating assets record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateAssetsRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedAsset = await AssetsModel.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!updatedAsset) {
      return res.status(404).json({ message: "Assets record not found" });
    }

    res.status(200).json({
      message: "Assets record updated successfully",
      data: updatedAsset,
    });
  } catch (error) {
    console.error("Error updating assets record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteLinkIdHistory = async () => {
  try {
    const validCheckers = {
      issuanceId: AssetsIssuanceModel,
      returnId: AssetsReturnModel,
      // disposalId: AssetsDisposalModel,
      // repairId: AssetsRepairModel,
    };

    const allAssets = await AssetsModel.find({});

    for (const asset of allAssets) {
      let modified = false;

      for (const inventory of asset.inventory) {
        if (!Array.isArray(inventory.history)) continue;

        const filteredHistory = [];
        let originalLength = inventory.history.length;

        for (const historyItem of inventory.history) {
          let isValid = false;

          for (const [key, model] of Object.entries(validCheckers)) {
            if (historyItem[key]) {
              const exists = await model.exists({ _id: historyItem[key] });
              if (exists) {
                isValid = true;
                break;
              }
            }
          }

          if (isValid) {
            filteredHistory.push(historyItem);
          }
        }

        if (filteredHistory.length !== originalLength) {
          inventory.history = filteredHistory;
          inventory.status = "Available";
          modified = true;
        }
      }

      if (modified) {
        await asset.save();
      }
    }
  } catch (err) {
    console.error("Error in deleteLinkIdHistory:", err);
  }
};

// const getAllAssetsRecords = async (req, res) => {
//   try {
//     await deleteLinkIdHistory();

//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = parseInt(req.query.limit, 10) || 10;
//     const keyword = req.query.keyword || "";
//     const sortBy = req.query.sortBy || "createdAt";
//     const sortOrder = req.query.sortOrder === "asc" ? -1 : 1;
//     const status = req.query.status;

//     const query = {
//       ...(keyword && {
//         $or: [
//           { propNo: { $regex: keyword, $options: "i" } },
//           { propName: { $regex: keyword, $options: "i" } },
//           { propDescription: { $regex: keyword, $options: "i" } },
//         ],
//       }),
//       ...(status &&
//         status === "isDeleted" && {
//           "Status.isDeleted": true,
//         }),
//       ...(status &&
//         status === "isArchived" && {
//           "Status.isArchived": true,
//         }),
//     };

//     const sortCriteria = {
//       "Status.isDeleted": 1,
//       "Status.isArchived": 1,
//       [sortBy]: sortOrder,
//     };
//     const totalItems = await AssetsModel.countDocuments(query);
//     const assets = await AssetsModel.find(query)
//       .sort(sortCriteria)
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .populate({
//         path: "inventory",
//         populate: [
//           {
//             path: "issuanceId",
//             model: "AssetsIssuance",
//           },
//           {
//             path: "employeeId",
//             model: "Employee",
//             select: "-employeeImage",
//           },
//           {
//             path: "history",
//             populate: [
//               {
//                 path: "issuanceId",
//                 model: "AssetsIssuance",
//               },
//               {
//                 path: "employeeId",
//                 model: "Employee",
//                 select: "-employeeImage",
//               },
//             ],
//           },
//         ],
//       });

//     res.json({
//       totalItems,
//       totalPages: Math.ceil(totalItems / limit),
//       currentPage: page,
//       assets: assets,
//     });
//   } catch (error) {
//     console.error("Error getting all Employee record", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// Helper to populate issuance history and related employee

const populateIssuanceHistory = () => ({
  path: "issuanceId",
  model: "AssetsIssuance",
});

// Helper to populate return history and related employee
const populateReturnHistory = () => ({
  path: "returnId",
  model: "AssetsReturn",
});

// Helper to populate employee without image
const populateEmployee = () => ({
  path: "employeeId",
  model: "Employee",
  select: "-employeeImage",
});

const getAllAssetsRecords = async (req, res) => {
  try {
    await deleteLinkIdHistory();

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const keyword = req.query.keyword || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? -1 : 1;
    const status = req.query.status;

    const query = {
      ...(keyword && {
        $or: [
          { propNo: { $regex: keyword, $options: "i" } },
          { propName: { $regex: keyword, $options: "i" } },
          { propDescription: { $regex: keyword, $options: "i" } },
        ],
      }),
      ...(status === "isDeleted" && { "Status.isDeleted": true }),
      ...(status === "isArchived" && { "Status.isArchived": true }),
    };

    const sortCriteria = {
      "Status.isDeleted": 1,
      "Status.isArchived": 1,
      [sortBy]: sortOrder,
    };

    const totalItems = await AssetsModel.countDocuments(query);

    const assets = await AssetsModel.find(query)
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: "inventory",
        populate: [
          populateIssuanceHistory(),
          populateReturnHistory(),
          populateEmployee(),
          {
            path: "history",
            populate: [
              populateIssuanceHistory(),
              populateReturnHistory(),
              populateEmployee(),
            ],
          },
        ],
      });

    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      assets,
    });
  } catch (error) {
    console.error("Error getting all assets records", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllAssetRecordsList = async (req, res) => {
  try {
    const excludedStatuses = ["Issued", "Dispose", "under-repair", "Reserved"];

    const query = {
      ...(req.query.isDeleted === "true" && { "Status.isDeleted": true }),
      ...(req.query.isArchived === "true" && { "Status.isArchived": true }),
    };

    const assets = await AssetsModel.find(query);

    const filteredAssets = assets.map((asset) => {
      asset.inventory = asset.inventory.filter((item) => {
        return !excludedStatuses.includes(item.status);
      });
      return asset;
    });

    res.json({
      assets: filteredAssets,
    });
  } catch (error) {
    console.error("Error getting all Asset records", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteAssetsRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await AssetsModel.findById(id);
    if (!asset || !asset.Status) {
      return res.status(404).json({ message: "Asset or status not found" });
    }

    if (asset.Status.isArchived) {
      return res
        .status(400)
        .json({ message: "Cannot delete an archived asset." });
    }

    if (asset.Status.isDeleted) {
      return res.status(400).json({ message: "Asset is already deleted." });
    }

    const updatedAsset = await AssetsModel.findByIdAndUpdate(
      id,
      { "Status.isDeleted": true },
      { new: true }
    );

    if (!updatedAsset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    res.status(200).json(updatedAsset);
  } catch (error) {
    console.error("Error deleting asset:", error.message, error.stack);
    res.status(500).json({ message: "Error processing request" });
  }
};

const archiveAssetsRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await AssetsModel.findById(id);
    if (!asset || !asset.Status) {
      return res.status(404).json({ message: "Asset or status not found" });
    }

    if (asset.Status.isArchived) {
      return res.status(400).json({ message: "Asset is already archived." });
    }

    if (asset.Status.isDeleted) {
      return res
        .status(400)
        .json({ message: "Cannot archive a deleted asset." });
    }

    const updatedAsset = await AssetsModel.findByIdAndUpdate(
      id,
      { "Status.isArchived": true },
      { new: true }
    );

    if (!updatedAsset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    res.status(200).json(updatedAsset);
  } catch (error) {
    console.error("Error archiving asset:", error.message, error.stack);
    res.status(500).json({ message: "Error processing request" });
  }
};

const undoDeleteAssetRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await AssetsModel.findById(id);
    if (!asset || !asset.Status) {
      return res.status(404).json({ message: "Asset or status not found" });
    }

    if (!asset.Status.isDeleted) {
      return res.status(400).json({ message: "Asset is not deleted." });
    }

    const updatedAsset = await AssetsModel.findByIdAndUpdate(
      id,
      { "Status.isDeleted": false },
      { new: true }
    );

    if (!updatedAsset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    res.status(200).json(updatedAsset);
  } catch (error) {
    console.error("Error undoing delete of asset:", error.message, error.stack);
    res.status(500).json({ message: "Error processing request" });
  }
};

const undoArchiveAssetRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await AssetsModel.findById(id);
    if (!asset || !asset.Status) {
      return res.status(404).json({ message: "Asset or status not found" });
    }

    if (!asset.Status.isArchived) {
      return res.status(400).json({ message: "Asset is not archived." });
    }

    if (asset.Status.isDeleted) {
      return res
        .status(400)
        .json({ message: "Cannot undo archive for a deleted asset." });
    }

    const updatedAsset = await AssetsModel.findByIdAndUpdate(
      id,
      { "Status.isArchived": false },
      { new: true }
    );

    if (!updatedAsset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    res.status(200).json(updatedAsset);
  } catch (error) {
    console.error(
      "Error undoing archive of asset:",
      error.message,
      error.stack
    );
    res.status(500).json({ message: "Error processing request" });
  }
};


const getEmployeeAssetsRecords = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const activeDraftReturns = await AssetsReturnModel.find(
      {
        docType: "Draft",
        "Status.isDeleted": false,
        "Status.isArchived": false,
      },
      { "assetRecords.inventoryId": 1 }
    );

    // Extract all inventoryIds from active draft returns
    const draftInventoryIds = [];
    activeDraftReturns.forEach((returnDoc) => {
      if (returnDoc.assetRecords && Array.isArray(returnDoc.assetRecords)) {
        returnDoc.assetRecords.forEach((asset) => {
          if (asset.inventoryId) {
            draftInventoryIds.push(asset.inventoryId.toString());
          }
        });
      }
    });


    const employee = await EmployeeModel.findById(employeeId)
      .populate("assetRecords.assetId")
      .exec();

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const filteredAssetRecords = employee.assetRecords
      .map((record) => {
        const availableAssetDetails = record.assetDetails.filter((asset) => {
          return !draftInventoryIds.includes(asset.inventoryId.toString());
        });

        return {
          ...record,
          assetDetails: availableAssetDetails,
        };
      })
      .filter((record) => record.assetDetails.length > 0); // Remove records with no available assets

    return res.status(200).json({
      assetRecords: filteredAssetRecords,
    });
  } catch (error) {
    console.error("Error fetching asset records:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createAssetsRecord,
  updateAssetsRecord,
  getAllAssetsRecords,
  deleteAssetsRecord,
  archiveAssetsRecord,
  undoDeleteAssetRecord,
  undoArchiveAssetRecord,
  getAllAssetRecordsList,
  getEmployeeAssetsRecords,
};
