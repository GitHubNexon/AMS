const AssetsModel = require("../models/AssetsModel");
const moment = require("moment");

const generateMonthlyDepreciation = async (req, res, next) => {
  try {
    const { assetId } = req.params; // Assuming asset ID is passed as parameter

    // Find the asset by ID
    const asset = await AssetsModel.findById(assetId);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    // Validate required fields
    if (!asset.unitCost || !asset.useFullLife || !asset.acquisitionDate) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: unitCost, useFullLife, or acquisitionDate",
      });
    }

    // Calculate monthly depreciation amount
    const monthlyDepreciation = asset.unitCost / asset.useFullLife;

    // Initialize arrays
    const months = [];
    const amounts = [];
    const startDates = [];
    const endDates = [];

    // Start from acquisition date
    let currentDate = moment(asset.acquisitionDate);

    // Generate data for each month based on useful life
    for (let i = 0; i < asset.useFullLife; i++) {
      // Add month name to array
      months.push(currentDate.format("MMMM"));

      // Add depreciation amount
      amounts.push(monthlyDepreciation);

      // For start date
      if (i === 0) {
        // First month uses acquisition date
        startDates.push(currentDate.format("MM-DD-YYYY"));
      } else {
        // Subsequent months use first day of the month
        startDates.push(currentDate.startOf("month").format("MM-DD-YYYY"));
      }

      // For end date - always last day of the month
      endDates.push(currentDate.endOf("month").format("MM-DD-YYYY"));

      // Move to next month for next iteration
      currentDate = moment(asset.acquisitionDate).add(i + 1, "months");
    }

    // Create response object
    const depreciationSchedule = {
      assetId: asset._id,
      propNo: asset.propNo,
      propName: asset.propName,
      unitCost: asset.unitCost,
      useFullLife: asset.useFullLife,
      monthlyDepreciation: monthlyDepreciation,
      acquisitionDate: moment(asset.acquisitionDate).format("MM-DD-YYYY"),
      finalDepreciationDate: endDates[endDates.length - 1],
      schedule: {
        month: months,
        amount: amounts,
        startDate: startDates,
        endDate: endDates,
      },
    };

    res.status(200).json({
      success: true,
      message: "Monthly depreciation schedule generated successfully",
      data: depreciationSchedule,
    });
  } catch (error) {
    console.error("Error generating monthly depreciation:", error);
    next(error);
  }
};

const generateAllMonthlyAssetsDepreciation = async (req, res, next) => {
  try {
    // Extract query parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const keyword = req.query.keyword || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? -1 : 1;

    // Build query object
    const query = {
      unitCost: { $exists: true, $ne: null },
      useFullLife: { $exists: true, $ne: null },
      acquisitionDate: { $exists: true, $ne: null },
      "Status.isDeleted": { $ne: true },
      ...(keyword && {
        $or: [
          { propNo: { $regex: keyword, $options: "i" } },
          { propName: { $regex: keyword, $options: "i" } },
        ],
      }),
    };

    // Build sort criteria
    const sortCriteria = {
      [sortBy]: sortOrder,
    };

    // Get total count for pagination
    const totalItems = await AssetsModel.countDocuments(query);

    if (totalItems === 0) {
      return res.status(404).json({
        success: false,
        message: "No assets found with required depreciation data",
      });
    }

    // Find assets with pagination
    const assets = await AssetsModel.find(query)
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit);

    const allDepreciationSchedules = [];

    for (const asset of assets) {
      // Calculate monthly depreciation amount
      const monthlyDepreciation = asset.unitCost / asset.useFullLife;

      // Initialize arrays
      const months = [];
      const amounts = [];
      const startDates = [];
      const endDates = [];

      // Start from acquisition date
      let currentDate = moment(asset.acquisitionDate);

      // Generate data for each month based on useful life
      for (let i = 0; i < asset.useFullLife; i++) {
        // Add month name to array
        months.push(currentDate.format("MMMM"));

        // Add depreciation amount
        amounts.push(monthlyDepreciation);

        // For start date
        if (i === 0) {
          // First month uses acquisition date
          startDates.push(currentDate.format("MM-DD-YYYY"));
        } else {
          // Subsequent months use first day of the month
          startDates.push(currentDate.startOf("month").format("MM-DD-YYYY"));
        }

        // For end date - always last day of the month
        endDates.push(currentDate.endOf("month").format("MM-DD-YYYY"));

        // Move to next month for next iteration
        currentDate = moment(asset.acquisitionDate).add(i + 1, "months");
      }

      // Add to results array
      allDepreciationSchedules.push({
        assetId: asset._id,
        propNo: asset.propNo,
        propName: asset.propName,
        unitCost: asset.unitCost,
        useFullLife: asset.useFullLife,
        monthlyDepreciation: monthlyDepreciation,
        acquisitionDate: moment(asset.acquisitionDate).format("MM-DD-YYYY"),
        finalDepreciationDate: endDates[endDates.length - 1],
        schedule: {
          month: months,
          amount: amounts,
          startDate: startDates,
          endDate: endDates,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: `Depreciation schedules generated for ${allDepreciationSchedules.length} assets`,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      limit,
      data: allDepreciationSchedules,
    });
  } catch (error) {
    console.error("Error generating all assets depreciation:", error);
    next(error);
  }
};

const generateAllAssetsNetBookValue = async (req, res, next) => {
  try {
    // Extract query parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const keyword = req.query.keyword || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? -1 : 1;

    // Build query object
    const query = {
      unitCost: { $exists: true, $ne: null },
      useFullLife: { $exists: true, $ne: null },
      acquisitionDate: { $exists: true, $ne: null },
      "Status.isDeleted": { $ne: true },
      ...(keyword && {
        $or: [
          { propNo: { $regex: keyword, $options: "i" } },
          { propName: { $regex: keyword, $options: "i" } },
        ],
      }),
    };

    // Build sort criteria
    const sortCriteria = {
      [sortBy]: sortOrder,
    };

    // Get total count for pagination
    const totalItems = await AssetsModel.countDocuments(query);

    if (totalItems === 0) {
      return res.status(404).json({
        success: false,
        message: "No assets found with required net book value data",
      });
    }

    // Find assets with pagination
    const assets = await AssetsModel.find(query)
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit);

    const allNetBookValueSchedules = [];

    for (const asset of assets) {
      // Calculate monthly depreciation amount
      const monthlyDepreciation = asset.unitCost / asset.useFullLife;

      // Initialize arrays
      const years = [];
      const months = [];
      const values = [];

      // Start from acquisition date
      let currentDate = moment(asset.acquisitionDate);

      // Add initial value (full unit cost at acquisition)
      years.push(currentDate.format("YYYY"));
      months.push(currentDate.format("MMMM"));
      values.push(asset.unitCost);

      // Generate net book values for each month based on useful life
      for (let i = 1; i <= asset.useFullLife; i++) {
        // Move to next month
        currentDate = moment(asset.acquisitionDate).add(i, "months");

        // Calculate net book value (original cost - accumulated depreciation)
        const accumulatedDepreciation = monthlyDepreciation * i;
        const netBookValue = asset.unitCost - accumulatedDepreciation;

        // Add year, month, and net book value
        years.push(currentDate.format("YYYY"));
        months.push(currentDate.format("MMMM"));
        values.push(Math.max(0, netBookValue)); // Ensure value doesn't go below 0
      }

      // Add to results array
      allNetBookValueSchedules.push({
        assetId: asset._id,
        propNo: asset.propNo,
        propName: asset.propName,
        unitCost: asset.unitCost,
        useFullLife: asset.useFullLife,
        acquisitionDate: moment(asset.acquisitionDate).format("MM-DD-YYYY"),
        schedule: {
          years: years,
          months: months,
          values: values,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: `Net book value schedules generated for ${allNetBookValueSchedules.length} assets`,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      limit,
      data: allNetBookValueSchedules,
    });
  } catch (error) {
    console.error("Error generating all assets net book value:", error);
    next(error);
  }
};

module.exports = {
  generateMonthlyDepreciation,
  generateAllMonthlyAssetsDepreciation,
  generateAllAssetsNetBookValue,
};
