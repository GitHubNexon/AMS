const AssetsIssuanceModel = require("../models/AssetsIssuanceModel");
const AssetsModel = require("../models/AssetsModel");

const createAssetsIssuance = async (req, res) => {
  try {
    const AssetsIssuanceData = req.body;
    const newAssetsIssuance = new AssetsIssuanceModel(AssetsIssuanceData);
    await newAssetsIssuance.save();

    for (let record of AssetsIssuanceData.assetRecords) {
      const asset = await AssetsModel.findOne({ _id: record.assetId });

      if (!asset) {
        return res
          .status(404)
          .json({ message: `Asset with ID ${record.assetId} not found` });
      }

      const inventoryItem = asset.inventory.find(
        (item) => item._id.toString() === record.inventoryId
      );

      if (!inventoryItem) {
        return res.status(404).json({
          message: `Inventory item with ID ${record.inventoryId} not found`,
        });
      }

      const historyData = {
        parNo: newAssetsIssuance.parNo,
        fundCluster: newAssetsIssuance.fundCluster,
        entityName: newAssetsIssuance.entityName,
        date: newAssetsIssuance.createdAt,
        transaction: "Issuance",
        issuanceId: newAssetsIssuance._id,
        employeeId: newAssetsIssuance.employeeId,
        dateAcquired: newAssetsIssuance.dateAcquired,
        dateReleased: newAssetsIssuance.dateReleased,
        issuedBy: newAssetsIssuance.CreatedBy,
      };

      await AssetsModel.updateOne(
        { _id: record.assetId, "inventory._id": record.inventoryId },
        {
          $push: {
            "inventory.$.history": historyData,
          },
          $set: {
            "inventory.$.status": "Issued",
          },
        }
      );
    }

    res.status(201).json({
      message:
        "Assets Issuance record created and history updated successfully",
      data: newAssetsIssuance,
    });
  } catch (error) {
    console.error("Error creating assets record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllAssetsIssuanceRecords = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const keyword = req.query.keyword || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? -1 : 1;
    const status = req.query.status;

    const query = {
      ...(keyword && {
        $or: [
          { "CreatedBy.name": { $regex: keyword, $options: "i" } },
          { "CreatedBy.position": { $regex: keyword, $options: "i" } },
        ],
      }),
      ...(status &&
        status === "isDeleted" && {
          "Status.isDeleted": true,
        }),
      ...(status &&
        status === "isArchived" && {
          "Status.isArchived": true,
        }),
    };

    const sortCriteria = {
      "Status.isDeleted": 1,
      "Status.isArchived": 1,
      [sortBy]: sortOrder,
    };
    const totalItems = await AssetsIssuanceModel.countDocuments(query);
    const issuanceRecords = await AssetsIssuanceModel.find(query)
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      issuanceRecords: issuanceRecords,
    });
  } catch (error) {
    console.error("Error getting all Employee record", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createAssetsIssuance,
  getAllAssetsIssuanceRecords,
};
