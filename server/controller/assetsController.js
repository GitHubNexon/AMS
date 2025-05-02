const AssetsModel = require("../models/AssetsModel");

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

const getAllAssetsRecords = async (req, res) => {
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
          { propNo: { $regex: keyword, $options: "i" } },
          { propName: { $regex: keyword, $options: "i" } },
          { propDescription: { $regex: keyword, $options: "i" } },
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
    const totalItems = await AssetsModel.countDocuments(query);
    const assets = await AssetsModel.find(query)
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      assets: assets,
    });
  } catch (error) {
    console.error("Error in get All Assets Records:", error);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
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

module.exports = {
  createAssetsRecord,
  updateAssetsRecord,
  getAllAssetsRecords,
  deleteAssetsRecord,
  archiveAssetsRecord,
  undoDeleteAssetRecord,
  undoArchiveAssetRecord,
};
