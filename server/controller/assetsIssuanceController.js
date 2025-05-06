const AssetsIssuanceModel = require("../models/AssetsIssuanceModel");

const createAssetsIssuance = async (req, res) => {
  try {
    const AssetsIssuanceData = req.body;

    const newAssetsIssuance = new AssetsIssuanceModel(AssetsIssuanceData);

    await newAssetsIssuance.save();
    res.status(201).json({
      message: "Assets Issuance record created successfully",
      data: newAssetsIssuance,
    });
  } catch (error) {
    console.error("Error creating assets record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createAssetsIssuance,
};
