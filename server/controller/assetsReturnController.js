const AssetsIssuanceModel = require("../models/AssetsIssuanceModel");
const AssetsModel = require("../models/AssetsModel");
const EmployeeModel = require("../models/employeeModel");
const AssetsReturnModel = require("../models/AssetsReturnModel");
const mongoose = require("mongoose");

const createAssetsReturn = async (req, res) => {
  try {
    const AssetsReturnData = req.body;
    const NewAssetsReturnData = new AssetsReturnModel(AssetsReturnData);
    await NewAssetsReturnData.save();

    res.status(201).json({
      message: "Assets return created successfully",
      data: NewAssetsReturnData,
    });
  } catch (error) {
    console.error("Error creating assets return:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createAssetsReturn,
};
