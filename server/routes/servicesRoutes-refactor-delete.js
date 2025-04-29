const express = require("express");
const router = express.Router();
const {
  createService,
  readServices,
  getServiceById,
  updateServiceById,
  deleteServiceById,
} = require("../controller/servicesController"); // Adjust the path as necessary
const { authenticateToken } = require("../controller/authController");
const { asyncHandler } = require("../helper/helper");

/**
 * Create a new service
 * Authorization in header with Bearer <token>
 * Request body: {
 *    "name": "<string>",
 *    "sku": "<string>", // Optional
 *    "description": "<string>",
 *    "price": "<number>",
 *    "serviceImage": "<string>" // Optional
 * }
 */
router.post(
  "/",
  authenticateToken,
  asyncHandler(createService)
);

/**
 * Read services with optional parameters for pagination and filtering
 * Query params:
 * - page: for pagination
 * - limit: for pagination
 * - keyword: for searching by name, sku, or description
 * - id: to search for a specific service by its ID
 */
// get all services
router.get(
  "/",
  authenticateToken,
  asyncHandler(readServices)
);

/**
 * Get a service by ID
 * URL params: id
 */
router.get(
  "/:id",
  authenticateToken,
  asyncHandler(getServiceById)
);

/**
 * Update a service by ID
 * URL params: id
 * Request body: {
 *    "name": "<string>",
 *    "sku": "<string>", // Optional
 *    "description": "<string>",
 *    "price": "<number>",
 *    "serviceImage": "<string>" // Optional
 * }
 */
router.patch(
  "/:id",
  authenticateToken,
  asyncHandler(updateServiceById)
);

/**
 * Delete a service by ID
 * URL params: id
 */
router.delete(
  "/:id",
  authenticateToken,
  asyncHandler(deleteServiceById)
);

module.exports = router;
