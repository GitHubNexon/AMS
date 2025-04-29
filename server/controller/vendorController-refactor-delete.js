const Vendor = require("../models/VendorModel"); // Ensure the correct path to the model

// Create a new vendor
const createVendor = async (req, res) => {
  const vendorData = req.body;

  try {
    const vendor = new Vendor(vendorData);
    await vendor.save();
    res.status(201).json(vendor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all vendors with pagination and search
const getAllVendors = async (req, res) => {
  try {
    const params = {};
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const keyword = req.query.keyword || "";

    // Adding search criteria for keyword
    if (keyword) {
      params.$or = [
        { firstName: { $regex: keyword, $options: "i" } },
        { lastName: { $regex: keyword, $options: "i" } },
        { Email: { $regex: keyword, $options: "i" } },
        { VendorDisplayName: { $regex: keyword, $options: "i" } }, // Added VendorDisplayName
        { CompanyName: { $regex: keyword, $options: "i" } }, // Added CompanyName
      ];
    }

    if (req.query.id) {
      if (req.query.id.length !== 24) {
        return res.status(400).json({ error: "Invalid ID format" });
      }
      params._id = req.query.id;
    }

    const totalItems = await Vendor.countDocuments(params);
    const vendors = await Vendor.find(params)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      vendors: vendors.map((vendor) => ({
        _id: vendor._id,
        firstName: vendor.firstName,
        middleName: vendor.middleName,
        lastName: vendor.lastName,
        suffix: vendor.suffix,
        CompanyName: vendor.CompanyName,
        VendorDisplayName: vendor.VendorDisplayName,
        Email: vendor.Email,
        phoneNumber: vendor.phoneNumber,
        mobileNumber: vendor.mobileNumber,
        website: vendor.website,
        taxNo: vendor.taxNo,
        // account: vendor.account,
        // openBalance: vendor.openBalance.map((balance) => ({
        //   amount: balance.amount, // Use the correct reference
        //   creditAsOf: balance.creditAsOf.toISOString(),
        // })),
        address: {
          region: vendor.address.region,
          province: vendor.address.province,
          municipality: vendor.address.municipality,
          barangay: vendor.address.barangay,
          streetAddress: vendor.address.streetAddress,
          houseNumber: vendor.address.houseNumber,
          zipcode: vendor.address.zipcode,
        },
        createdAt: vendor.dateTimestamp.toISOString(),
        updatedAt: vendor.dateUpdated.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a specific vendor by ID
const getVendorById = async (req, res) => {
  const { id } = req.params;

  try {
    const vendor = await Vendor.findById(id);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json({
      ...vendor.toObject(),
      taxNo: vendor.taxNo,
      // account: vendor.account,
      // openBalance: vendor.openBalance.map((balance) => ({
      //   amount: balance.amount,
      //   creditAsOf: balance.creditAsOf.toISOString(),
      // })),
      address: {
        region: vendor.address.region,
        province: vendor.address.province,
        municipality: vendor.address.municipality,
        barangay: vendor.address.barangay,
        streetAddress: vendor.address.streetAddress,
        houseNumber: vendor.address.houseNumber,
        zipcode: vendor.address.zipcode,
      },
      createdAt: vendor.dateTimestamp.toISOString(),
      updatedAt: vendor.dateUpdated.toISOString(),
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a vendor
const patchVendor = async (req, res) => {
  const { id } = req.params;

  try {
    const existingVendor = await Vendor.findById(id);
    if (!existingVendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    const updateData = { ...req.body, dateUpdated: new Date() };

    const allowedUpdates = [
      "firstName",
      "middleName",
      "lastName",
      "suffix",
      "CompanyName",
      "VendorDisplayName",
      "Email",
      "phoneNumber",
      "mobileNumber",
      "website",
      "taxNo", // Added taxNo
      // "account", // Added accountType
      // "openBalance", // Added openBalance
      "address",
      "dateUpdated",
    ];
    const updates = Object.keys(updateData);
    const isValidUpdate = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidUpdate) {
      return res.status(400).json({ error: "Invalid updates!" });
    }

    const updatedVendor = await Vendor.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedVendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    res.json({
      ...updatedVendor.toObject(),
      taxNo: updatedVendor.taxNo, // Added taxNo
      // account: updatedVendor.account,
      // openBalance: updatedVendor.openBalance.map((balance) => ({
      //   amount: balance.amount,
      //   creditAsOf: balance.creditAsOf.toISOString(),
      // })), // Added openBalance
      address: {
        region: updatedVendor.address.region,
        province: updatedVendor.address.province,
        municipality: updatedVendor.address.municipality,
        barangay: updatedVendor.address.barangay,
        streetAddress: updatedVendor.address.streetAddress,
        houseNumber: updatedVendor.address.houseNumber,
        zipcode: updatedVendor.address.zipcode,
      },
      createdAt: updatedVendor.dateTimestamp.toISOString(),
      updatedAt: updatedVendor.dateUpdated.toISOString(),
    });
  } catch (error) {
    console.error("Error updating vendor:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete a vendor
const deleteVendor = async (req, res) => {
  const { id } = req.params;

  try {
    const vendor = await Vendor.findByIdAndDelete(id);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(204).send(); // No content to send back
  } catch (error) {
    console.error("Error deleting vendor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Export the functions
module.exports = {
  createVendor,
  getAllVendors,
  getVendorById,
  patchVendor,
  deleteVendor,
};
