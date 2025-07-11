require("dotenv").config();
const AssetsPurchaseRequestModel = require("../models/AssetsPurchaseRequestModel");
const generateStatusHandlers = require("../utils/generateStatusHandlers");
const patchUpdate = require("../utils/patchUpdate");

const createPurchaseRequest = async (req, res, next) => {
  try {
    const PRData = req.body;
    const newPRData = new AssetsPurchaseRequestModel(PRData);
    await newPRData.save();
    res.status(201).json({
      message: "PR created Successfully",
      data: newPRData,
    });
  } catch (error) {
    next(error);
  }
};

const updatePurchaseRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { updated, changed } = await patchUpdate(
      AssetsPurchaseRequestModel,
      id,
      req.body
    );

    if (!updated) {
      return res.status(404).json({ message: "Purchase Request Not Found" });
    }

    if (!changed) {
      return res.status(200).json({
        message: "No Changes Detected",
        data: updated,
      });
    }
    res.status(200).json({
      message: "Purchase Request Updated Successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

const getAllPurchaseRequest = async (req, res, next) => {
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

    const totalItems = await AssetsPurchaseRequestModel.countDocuments(query);
    const prRecords = await AssetsPurchaseRequestModel.find(query)
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      prRecords,
    });
  } catch (error) {
    next(error);
  }
};

const {
  softDelete: softDeletePurchaseRequest,
  undoDelete: undoDeletePurchaseRequest,
  softArchive: softArchivePurchaseRequest,
  undoArchive: undoArchivePurchaseRequest,
} = generateStatusHandlers(AssetsPurchaseRequestModel, "AssetsPurchaseRequest");

module.exports = {
  createPurchaseRequest,
  updatePurchaseRequest,
  getAllPurchaseRequest,
  softDeletePurchaseRequest,
  undoDeletePurchaseRequest,
  softArchivePurchaseRequest,
  undoArchivePurchaseRequest,
};
