// controllers/AlphaListTaxController.js
const AlphaListTaxModel = require("../models/AlphaListTaxModel");

// Create a new AlphaListTax
const createAlphaListTax = async (req, res) => {
  try {
    const {
      Title,
      OwnerTIN,
      OwnerName,
      OwnerTradeName,
      OwnerAddress,
      Description,
      AlphaList,
    } = req.body;

    const newAlphaListTax = new AlphaListTaxModel({
      Title,
      OwnerTIN,
      OwnerName,
      OwnerTradeName,
      OwnerAddress,
      Description,
      AlphaList,
    });

    await newAlphaListTax.save();

    return res.status(201).json({
      message: "AlphaListTax successfully created!",
      data: newAlphaListTax,
    });
  } catch (error) {
    console.error("Error creating AlphaListTax:", error);
    return res
      .status(500)
      .json({ message: "Error creating AlphaListTax", error });
  }
};

// Update
const updateAlphaListTax = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedAlphaListTax = await AlphaListTaxModel.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!updatedAlphaListTax) {
      return res.status(404).json({ message: "AlphaListTax not found" });
    }

    return res.status(200).json({
      message: "AlphaListTax successfully updated!",
      data: updatedAlphaListTax,
    });
  } catch (error) {
    console.error("Error updating AlphaListTax:", error);
    return res
      .status(500)
      .json({ message: "Error updating AlphaListTax", error });
  }
};

const getAllAlphaListTax = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1; //
    const limit = parseInt(req.query.limit, 10) || 10;
    const keyword = req.query.keyword || "";

    const query = {
      $or: [
        { Title: { $regex: "^" + keyword, $options: "i" } },
        { SupplierName: { $regex: "^" + keyword, $options: "i" } },
        { TaxpayerID: { $regex: "^" + keyword, $options: "i" } },
        { RegisteredName: { $regex: "^" + keyword, $options: "i" } },
        { Description: { $regex: "^" + keyword, $options: "i" } },
      ],
    };

    const totalItems = await AlphaListTaxModel.countDocuments(query);
    const alphaListTaxItems = await AlphaListTaxModel.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      alphaListTax: alphaListTaxItems,
    });
  } catch (error) {
    console.error("Error getting AlphaListTax:", error);
    return res
      .status(500)
      .json({ message: "Error getting AlphaListTax", error });
  }
};

const getAlphaListTaxById = async (req, res) => {
  try {
    const { id } = req.params;

    const alphaListTax = await AlphaListTaxModel.findById(id);

    if (!alphaListTax) {
      return res.status(404).json({ message: "AlphaListTax not found" });
    }

    return res.status(200).json({
      message: "AlphaListTax retrieved successfully!",
      data: alphaListTax,
    });
  } catch (error) {
    console.error("Error retrieving AlphaListTax by ID:", error);
    return res
      .status(500)
      .json({ message: "Error retrieving AlphaListTax", error });
  }
};

// Delete AlphaListTax by ID
const deleteAlphaListTaxById = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAlphaListTax = await AlphaListTaxModel.findByIdAndDelete(id);

    if (!deletedAlphaListTax) {
      return res.status(404).json({ message: "AlphaListTax not found" });
    }

    return res.status(200).json({
      message: "AlphaListTax successfully deleted!",
      data: deletedAlphaListTax,
    });
  } catch (error) {
    console.error("Error deleting AlphaListTax:", error);
    return res
      .status(500)
      .json({ message: "Error deleting AlphaListTax", error });
  }
};

// Get AlphaListTax by Date (within a date range)
const getAlphaListTaxByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Start date and end date are required." });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) {
      return res.status(400).json({ message: "Invalid start date format." });
    }

    if (isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid end date format." });
    }

    // Ensure the end date is inclusive (set it to the end of the day)
    end.setHours(23, 59, 59, 999);

    // Check if endDate is before startDate
    if (end < start) {
      return res
        .status(400)
        .json({ message: "End date cannot be earlier than start date." });
    }

    if (start.getTime() === end.getTime()) {
      const result = await AlphaListTaxModel.aggregate([
        {
          $unwind: "$AlphaList",
        },
        {
          $match: {
            "AlphaList.Date": {
              $gte: start,
              $lte: end,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalGrossPurchase: { $sum: "$AlphaList.TaxAmount.GrossPurchase" },
            totalExemptPurchase: {
              $sum: "$AlphaList.TaxAmount.ExemptPurchase",
            },
            totalZeroRatePurchase: {
              $sum: "$AlphaList.TaxAmount.ZeroRatePurchase",
            },
            totalTaxablePurchase: {
              $sum: "$AlphaList.TaxAmount.TaxablePurchase",
            },
            totalServicesPurchase: {
              $sum: "$AlphaList.TaxAmount.ServicesPurchase",
            },
            totalCapitalGoods: { $sum: "$AlphaList.TaxAmount.CapitalGoods" },
            totalGoodsOtherThanCapital: {
              $sum: "$AlphaList.TaxAmount.GoodsOtherThanCapital",
            },
            totalInputTaxAmount: {
              $sum: "$AlphaList.TaxAmount.InputTaxAmount",
            },
            totalGrossTaxablePurchase: {
              $sum: "$AlphaList.TaxAmount.GrossTaxablePurchase",
            },
          },
        },
      ]);

      if (result.length === 0) {
        return res
          .status(404)
          .json({ message: "No records found for the given date." });
      }

      return res.status(200).json({
        message: "AlphaListTax totals successfully retrieved!",
        dataDateRange: result[0],
      });
    } else {
      const result = await AlphaListTaxModel.aggregate([
        {
          $unwind: "$AlphaList",
        },
        {
          $match: {
            "AlphaList.Date": {
              $gte: start,
              $lte: end,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalGrossPurchase: { $sum: "$AlphaList.TaxAmount.GrossPurchase" },
            totalExemptPurchase: {
              $sum: "$AlphaList.TaxAmount.ExemptPurchase",
            },
            totalZeroRatePurchase: {
              $sum: "$AlphaList.TaxAmount.ZeroRatePurchase",
            },
            totalTaxablePurchase: {
              $sum: "$AlphaList.TaxAmount.TaxablePurchase",
            },
            totalServicesPurchase: {
              $sum: "$AlphaList.TaxAmount.ServicesPurchase",
            },
            totalCapitalGoods: { $sum: "$AlphaList.TaxAmount.CapitalGoods" },
            totalGoodsOtherThanCapital: {
              $sum: "$AlphaList.TaxAmount.GoodsOtherThanCapital",
            },
            totalInputTaxAmount: {
              $sum: "$AlphaList.TaxAmount.InputTaxAmount",
            },
            totalGrossTaxablePurchase: {
              $sum: "$AlphaList.TaxAmount.GrossTaxablePurchase",
            },
          },
        },
      ]);

      if (result.length === 0) {
        return res
          .status(404)
          .json({ message: "No records found for the given date range." });
      }

      return res.status(200).json({
        message: "AlphaListTax totals successfully retrieved!",
        dataDateRange: result[0],
      });
    }
  } catch (error) {
    console.error("Error retrieving AlphaListTax by Date:", error);
    return res
      .status(500)
      .json({ message: "Error retrieving AlphaListTax by Date", error });
  }
};

module.exports = {
  createAlphaListTax,
  updateAlphaListTax,
  getAllAlphaListTax,
  getAlphaListTaxById,
  deleteAlphaListTaxById,
  getAlphaListTaxByDate,
};
