const Services = require("../models/Services"); // Make sure this path is correct
const { checkBody } = require("../helper/helper");

// Validate SKU for creation and update
const validateSku = async (req, res, isUpdate = false) => {
  const { sku } = req.body; // Get SKU from request body

  // If SKU is provided and not empty
  if (sku && sku.trim() !== "") {
    try {
      const query = isUpdate ? { sku, _id: { $ne: req.params.id } } : { sku };
      const existingService = await Services.findOne(query);

      if (existingService) {
        return res.status(409).json({
          message: "SKU already exists, cannot create/update a service with the same SKU.",
        });
      }
    } catch (error) {
      console.error("Error checking SKU:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return true; // Indicates that the SKU is valid for creation or update
}

async function createService(req, res) {
  try {
    checkBody(["name", "description", "price"], req, res); // SKU is not required

    // Validate SKU for creation
    const skuValidationResult = await validateSku(req, res);
    if (skuValidationResult !== true) {
      return; // Return early if SKU validation failed
    }

    // Create a new service
    const service = new Services(req.body);
    await service.save();

    // Respond with the newly created service
    res.status(201).json({
      name: service.name,
      sku: service.sku, // This may be undefined if not provided
      description: service.description,
      price: service.price,
      _id: service._id,
      account: service.account._id
    });
  } catch (error) {
    // Handle errors
    if (error.code === 11000) {
      return res.status(409).json({ message: "SKU already exists" });
    }
    console.error("Error creating service:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function readServices(req, res) {
  try {
    const params = {};
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const keyword = req.query.keyword || "";

    if (keyword) {
      params.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { sku: { $regex: keyword, $options: "i" } }, // Retaining SKU search in case it's used
      ];
    }

    if (req.query.id) {
      if (req.query.id.length !== 24) {
        return res.status(400).json({ error: "Invalid ID format" });
      }
      params._id = req.query.id;
    }

    const totalItems = await Services.countDocuments(params);
    const services = await Services.find(params).populate('account')
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      services,
    });
  } catch (error) {
    console.error("Error reading services:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Get service by ID
async function getServiceById(req, res) {
  try {
    const { id } = req.params;
    if (id.length !== 24) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const service = await Services.findById(id).populate('account');
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json(service);
  } catch (error) {
    console.error("Error retrieving service:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Update service by ID
async function updateServiceById(req, res) {
  try {
    const { id } = req.params;
    if (id.length !== 24) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const service = await Services.findById(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Validate SKU for update
    const skuValidationResult = await validateSku(req, res, true);
    if (skuValidationResult !== true) {
      return; // Return early if SKU validation failed
    }

    // Only check for required fields if they are present in the request
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.description) updates.description = req.body.description;
    if (req.body.price) updates.price = req.body.price;
    if (req.body.sku) updates.sku = req.body.sku; // Allow setting SKU if it's provided
    if (req.body.serviceImage) updates.serviceImage = req.body.serviceImage; // Update the service image if it exists
    updates.account = req.body.account._id;

    // Set the dateUpdated field to the current date
    updates.dateUpdated = Date.now();

    const updatedService = await Services.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json(updatedService);
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Delete service by ID
async function deleteServiceById(req, res) {
  try {
    const { id } = req.params;
    if (id.length !== 24) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const deletedService = await Services.findByIdAndDelete(id);
    if (!deletedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  createService,
  readServices,
  getServiceById,
  updateServiceById,
  deleteServiceById,
};
