const express = require("express");
const router = express.Router();
const {
  createProduct,
  readProducts,
  getProductById,
  updateProductById,
  deleteProductById,
} = require("../controller/productController"); // Adjust the path as necessary
const { authenticateToken } = require("../controller/authController");
const { asyncHandler } = require("../helper/helper");

/**
 * Create a new product
 * Authorization in header with Bearer <token>
 * Request body: {
 *    "name": "<string>",
 *    "sku": "<string>",
 *    "description": "<string>",
 *    "price": "<number>",
 *    "productImage": "<string>" // Optional
 * }
 */
router.post(
  "/",
  authenticateToken,
  asyncHandler(createProduct)
);

/**
 * Read products with optional parameters for pagination and filtering
 * Query params:
 * - page: for pagination
 * - limit: for pagination
 * - keyword: for searching by name, sku, or description
 * - id: to search for a specific product by its ID
 */

// get all the products
router.get(
  "/",
  authenticateToken,
  asyncHandler(readProducts)
);

/**
 * Get a product by ID
 * URL params: id
 */
router.get(
  "/:id",
  authenticateToken,
  asyncHandler(getProductById)
);

/**
 * Update a product by ID
 * URL params: id
 * Request body: {
 *    "name": "<string>",
 *    "sku": "<string>",
 *    "description": "<string>",
 *    "price": "<number>",
 *    "productImage": "<string>" // Optional
 * }
 */
router.patch(
  "/:id",
  authenticateToken,
  asyncHandler(updateProductById)
);

/**
 * Delete a product by ID
 * URL params: id
 */
router.delete(
  "/:id",
  authenticateToken,
  asyncHandler(deleteProductById)
);

module.exports = router;
