const Products = require("../models/Products"); // Make sure this path is correct
const Account = require("../models/AccountModel");
const { checkBody } = require("../helper/helper");

// Validate SKU for creation and update
const validateSku = async (req, res, isUpdate = false) => {
  const { sku } = req.body; // Get SKU from request body

  // If SKU is provided and not empty
  if (sku && sku.trim() !== "") {
    try {
      const query = isUpdate ? { sku, _id: { $ne: req.params.id } } : { sku };
      const existingProduct = await Products.findOne(query);

      if (existingProduct) {
        return res.status(409).json({
          message:
            "SKU already exists, cannot create/update a product with the same SKU.",
        });
      }
    } catch (error) {
      console.error("Error checking SKU:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return true; // Indicates that the SKU is valid for creation or update
};

async function createProduct(req, res) {
  try {
    checkBody(["name", "description", "price"], req, res); // SKU is not required

    // Validate SKU for creation
    const skuValidationResult = await validateSku(req, res);
    if (skuValidationResult !== true) {
      return; // Return early if SKU validation failed
    }

    // Create a new product
    const product = new Products(req.body);
    await product.save();

    // Respond with the newly created product
    res.status(201).json({
      name: product.name,
      sku: product.sku, // This may be undefined if not provided
      description: product.description,
      price: product.price,
      _id: product._id,
      account: product.account
    });
  } catch (error) {
    // Handle errors
    if (error.code === 11000) {
      return res.status(409).json({ message: "SKU already exists" });
    }
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function readProducts(req, res) {
  try {
    const params = {};
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const keyword = req.query.keyword || "";

    if (keyword) {
      params.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { sku: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    if (req.query.id) {
      if (req.query.id.length !== 24) {
        return res.status(400).json({ error: "Invalid ID format" });
      }
      params._id = req.query.id;
    }

    const totalItems = await Products.countDocuments(params);
    const products = await Products.find(params).populate('account')
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      products,
    });
  } catch (error) {
    console.error("Error reading products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Get product by ID
async function getProductById(req, res) {
  try {
    const { id } = req.params
    if (id.length !== 24) {
      return res.status(400).json({ error: "Invalid ID format" });
    }


    const product = await Products.findById(id).populate('account');


    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error retrieving product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Update product by ID
async function updateProductById(req, res) {
  try {
    const { id } = req.params;
    if (id.length !== 24) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const product = await Products.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if SKU is being updated
    if (req.body.sku) {
      if (product.sku) {
        return res.status(400).json({
          message:
            "Editing the SKU is not allowed. Please create a new product if you want to change the SKU.",
        });
      }
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
    if (req.body.sku) updates.sku = req.body.sku; // Allow setting SKU only if it is not present
    if (req.body.productImage) updates.productImage = req.body.productImage; // Update the product image if it exists
    updates.account = req.body.account._id;

    // Set the dateUpdated field to the current date
    updates.dateUpdated = Date.now();

    const updatedProduct = await Products.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Delete product by ID
async function deleteProductById(req, res) {
  try {
    const { id } = req.params;
    if (id.length !== 24) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const deletedProduct = await Products.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  createProduct,
  readProducts,
  getProductById,
  updateProductById,
  deleteProductById,
};
