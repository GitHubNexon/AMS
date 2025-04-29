const TaxModel = require("../models/taxModel");

const createTax = async (req, res) => {
  const { Code, Category, Coverage, Type, taxRate } = req.body;

  try {
    const newTax = new TaxModel({
      Code,
      Category,
      Coverage,
      Type,
      taxRate,
    });

    const savedTax = await newTax.save();

    res.status(201).json({
      success: true,
      message: "Tax created successfully!",
      data: savedTax,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while creating tax.",
    });
  }
};

const deleteTax = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTax = await TaxModel.findByIdAndDelete(id);

    if (!deletedTax) {
      return res.status(404).json({
        success: false,
        message: "Tax entry not found.",
      });
    }

    // Return a success response
    res.status(200).json({
      success: true,
      message: "Tax entry deleted successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while deleting tax.",
    });
  }
};

const getAllTaxes = async (req, res) => {
  try {
    const params = {};
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const keyword = req.query.keyword || "";

    if (keyword) {
      params.$or = [
        { Code: { $regex: keyword, $options: "i" } },
        { Category: { $regex: keyword, $options: "i" } },
      ];
    }

    const totalItems = await TaxModel.countDocuments(params);

    const taxes = await TaxModel.find(params)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      taxes,
    });
  } catch (error) {
    console.error("Error reading taxes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a specific tax entry by ID
const getTaxById = async (req, res) => {
  const { id } = req.params;

  try {
    const tax = await TaxModel.findById(id);

    if (!tax) {
      return res.status(404).json({
        success: false,
        message: "Tax entry not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: tax,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while fetching tax.",
    });
  }
};

// Update a tax entry by ID
const updateTax = async (req, res) => {
  const { id } = req.params;
  const { Code, Category, Coverage, Type, taxRate } = req.body;

  try {
    const updatedTax = await TaxModel.findByIdAndUpdate(
      id,
      { Code, Category, Coverage, Type, taxRate },
      { new: true }
    );

    if (!updatedTax) {
      return res.status(404).json({
        success: false,
        message: "Tax entry not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tax updated successfully!",
      data: updatedTax,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error occurred while updating tax.",
    });
  }
};

module.exports = {
  createTax,
  deleteTax,
  getAllTaxes,
  getTaxById,
  updateTax,
};
