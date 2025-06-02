const AssetsModel = require("../models/AssetsModel");
const AssetsIssuanceModel = require("../models/AssetsIssuanceModel");
const AssetsReturnModel = require("../models/AssetsReturnModel");
const AssetsDisposal = require("../models/AssetsDisposalModel");
const AssetsRepairModel = require("../models/AssetsRepairModel");
const EmployeeModel = require("../models/employeeModel");

const getAssetsHistory = async (req, res) => {
  try {
    const {} = req.body;
  } catch (error) {
    console.error("Error fetching assets history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
