const employeeAssetsModel = require("../models/employeeAssetsModel");
const AssetsModel = require("../models/AssetsModel");

const mongoose = require("mongoose");

const createEmployeeAssetsRecord = async (req, res) => {
  try {
    const {
      parNo,
      fundCluster,
      entityName,
      employeeName,
      position,
      approvedBy,
      issuedBy,
      assetRecords,
    } = req.body;

    const newEmployeeAssets = new employeeAssetsModel({
      parNo,
      fundCluster,
      entityName,
      employeeName,
      position,
      approvedBy,
      issuedBy,
      assetRecords,
    });

    const savedEmployeeAssets = await newEmployeeAssets.save();

    res.status(201).json(savedEmployeeAssets);
  } catch (error) {
    console.error(
      "Error creating employee assets record:",
      error.message,
      error.stack
    );
    res.status(500).json({ message: "Error processing request" });
  }
};



module.exports = {
  createEmployeeAssetsRecord,
};
