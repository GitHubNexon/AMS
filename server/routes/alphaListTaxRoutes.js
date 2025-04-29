// routes/AlphaListTaxRoutes.js
const express = require("express");
const router = express.Router();
const {
  createAlphaListTax,
  updateAlphaListTax,
  getAllAlphaListTax,
  getAlphaListTaxById,
  deleteAlphaListTaxById,
  getAlphaListTaxByDate,
} = require("../controller/AlphaListTaxController");

// POST route to create a new AlphaListTax
router.post("/", createAlphaListTax);

// PATCH route to partially update an existing AlphaListTax
router.patch("/:id", updateAlphaListTax);

// GET route to fetch all AlphaListTax
router.get("/", getAllAlphaListTax);

// GET route to fetch AlphaListTax by id
router.get("/:id", getAlphaListTaxById);

// DELETE route to delete AlphaListTax by id
router.delete("/:id", deleteAlphaListTaxById); 

// GET route to fetch AlphaListTax totals by Date range
router.get("/getTotal/by-date", getAlphaListTaxByDate);

module.exports = router;
