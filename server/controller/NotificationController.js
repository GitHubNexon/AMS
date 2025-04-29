const User = require("../models/userModel");
const EntriesModel = require("../models/EntriesModel");
const OrderOfPayment = require('../models/OrderOfPaymentModel'); 


const getEntriesByUser = async (req, res) => {
  try {
    // Extract parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const keyword = req.query.keyword || "";
    const taskDate = req.query.taskDate || ""; // Capture the taskDate query parameter
    const { name, signatoryType } = req.query;

    // Ensure name query parameter is provided
    if (!name) {
      return res
        .status(400)
        .json({ message: "Name query parameter is required" });
    }

    // Find the user by the provided name
    const user = await User.findOne({ name: { $regex: name, $options: "i" } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prepare the filter for the entries
    const params = {};

    // If signatoryType is provided, filter based on the user's name in the appropriate field
    if (signatoryType) {
      params[`${signatoryType}.name`] = { $in: [user.name] };
    } else {
      // If no signatoryType is provided, check all relevant signatory fields
      params.$or = [
        { "ReviewedBy.name": user.name },
        { "PreparedBy.name": user.name },
        { "CertifiedBy.name": user.name },
        { "ApprovedBy1.name": user.name },
        { "ApprovedBy2.name": user.name },
      ];
    }

    if (taskDate) {
      const parsedDate = new Date(taskDate);
      if (!isNaN(parsedDate.getTime())) {
        // Create a date range from the start of the day to just before the next day
        const startOfDay = new Date(`${taskDate}T00:00:00.000Z`);
        const endOfDay = new Date(`${taskDate}T23:59:59.999Z`);
        
        params.createdAt = { $gte: startOfDay, $lt: endOfDay };  
      } else {
        return res.status(400).json({ message: "Invalid taskDate format" });
      }
    }
    

    // Fetch the entries with pagination and sorting
    const entries = await EntriesModel.find(params)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Get the total number of entries for pagination
    const totalEntries = await EntriesModel.countDocuments(params);

    return res.status(200).json({
      totalEntries,
      entries,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching entries:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getOrderOfPayments = async (req, res) => {
  try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const keyword = req.query.keyword || "";

      // Build query filter
      const queryFilter = keyword
          ? {
                $or: [
                    { orderOfPaymentNo: { $regex: keyword, $options: 'i' } },
                    { 'client.name': { $regex: keyword, $options: 'i' } },
                    { 'client.slCode': { $regex: keyword, $options: 'i' } },
                ],
            }
          : {};

      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
          OrderOfPayment.find(queryFilter)
              .populate('linkedCashReceiptEntry')
              .populate('linkedDepositSlipEntry')
              .sort({ createdAt: -1 })
              .skip(skip)
              .limit(limit),
          OrderOfPayment.countDocuments(queryFilter),
      ]);

      // Send response
      res.status(200).json({
          success: true,
          data,
          page,
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({
          success: false,
          message: 'An error occurred while fetching order of payments.',
      });
  }
};

module.exports = { getEntriesByUser, getOrderOfPayments };
