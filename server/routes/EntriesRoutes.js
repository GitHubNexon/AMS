const express = require("express");
const router = express.Router();
const EntriesController = require("../controller/EntriesController");
const AutoNumber = require("../controller/AutoNumberController");
const { authenticateToken } = require("../controller/authController");

// POST ROUTE for creating temporary entry
router.post("/temp", authenticateToken, EntriesController.createTempEntry);

// POST route for creating a new entry
router.post("/", authenticateToken, EntriesController.createEntry);


// PATCH route for updating an temporary entry by ID
router.patch("/temp/:id", authenticateToken, EntriesController.patchTempEntry);

// PATCH route for updating an entry by ID
router.patch("/:id", authenticateToken, EntriesController.patchEntry);


// DELETE route for deleting an entry by ID
router.delete("/:id", authenticateToken, EntriesController.deleteEntry);

// GET route for fetching all entries
router.get("/all", EntriesController.getAllEntry);

router.get("/find/:id", EntriesController.findEntry);

// GET routes for fetching entries by EntryType
router.get("/receipts", EntriesController.getAllReceipts);
router.get("/payments", EntriesController.getAllPayments);
router.get("/journals", EntriesController.getAllJournals);

// GET route for generating an auto-number
router.get("/auto-number", AutoNumber.createAutoNumber);

router.get("/auto-number/payment", AutoNumber.createPaymentAutoNumber);

// GET route for fetching all used JVNo, CRNo, and DVNo numbers with their EntryType
router.get("/used-numbers", EntriesController.getAllUsedNumbers);

// export rental accrual to xlsx
router.post("/accrual/rental", EntriesController.exportRentalAccrual);

router.get("/deleted", authenticateToken, EntriesController.getEntriesDeleted);
router.post("/deleted/undo/:id", authenticateToken, EntriesController.undoDeleted);

router.get('/logs/:id', authenticateToken, EntriesController.getLog);
router.patch('/cancel/:id', authenticateToken, EntriesController.cancelEntry);
router.patch('/cancel/undo/:id', authenticateToken, EntriesController.undoCancelEntry);

router.get('/tin/:tin', EntriesController.findTin);


module.exports = router;
