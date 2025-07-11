require("dotenv").config();
const generateStatusHandlers = require("../utils/generateStatusHandlers");
const patchUpdate = require("../utils/patchUpdate");
const assetsPurchaseOrderModel = require("../models/AssetsPurchaseOrderModel");

const createPurchaseOrder = async (req, res, next) => {
  try {
    const POData = req.body;
    const newPOData = new assetsPurchaseOrderModel(POData);
    await newPOData.save();
    res.status(201).json({
      message: "PO Created Successfully",
      data: newPOData,
    });
  } catch (error) {
    next(error);
  }
};

const updatePurchaseOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { updated, changed } = await patchUpdate(
      assetsPurchaseOrderModel,
      id,
      req.body
    );

    if (!updated) {
      return res.status(404).json({
        message: "Purchase Order Not Found",
      });
    }

    if (!changed) {
      return res.status(200).json({
        message: "No Changes Detected",
        data: updated,
      });
    }

    res.status(200).json({
      message: "Purchase Order Updated Successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

const getAllPurchaseOrder = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const keyword = req.query.keyword || "";
    const status = req.query.status;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? -1 : 1;

    const query = {
      ...(keyword && {
        $or: [
          { prNo: { $regex: keyword, $options: "i" } },
          { fundCluster: { $regex: keyword, $options: "i" } },
        ],
      }),
      ...(status === "isDeleted" && { "status.isDeleted": true }),
      ...(status === "isArchived" && { "status.isArchived": true }),
    };

    const sortCriteria = {
      "status.isDeleted": 1,
      "status.isArchived": 1,
      [sortBy]: sortOrder,
    };

    const totalItems = await assetsPurchaseOrderModel.countDocuments(query);
    const poRecords = await assetsPurchaseOrderModel
      .find(query)
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      poRecords,
    });
  } catch (error) {
    next(error);
  }
};

const {
  softDelete: softDeletePurchaseOrder,
  undoDelete: undoDeletePurchaseOrder,
  softArchive: softArchivePurchaseOrder,
  undoArchive: undoArchivePurchaseOrder,
} = generateStatusHandlers(assetsPurchaseOrderModel, "AssetsPurchaseOrder");

module.exports = {
  createPurchaseOrder,
  updatePurchaseOrder,
  getAllPurchaseOrder,
  softDeletePurchaseOrder,
  undoDeletePurchaseOrder,
  softArchivePurchaseOrder,
  undoArchivePurchaseOrder,
};
