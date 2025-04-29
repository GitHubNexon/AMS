const CaFileMaintenance = require("../models/CAFileMaintenance");
const CashAdvance = require("../models/CashAdvance");
const {findBookBalance} = require("./reportController");
const EntriesModel  = require('../models/EntriesModel');
const {EntriesTemp} = require('../models/EntriesModel');
const generateUniqueCaNo = async () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2); // Last 2 digits of the year (YY)
    const month = ("0" + (now.getMonth() + 1)).slice(-2); // Ensure MM format
    const prefix = `${year}0${month}-`; // Correct format: YY0MM-

    // Find latest Cash Advance in the same month
    const lastCa = await CashAdvance.findOne({ caNo: { $regex: `^${prefix}` } })
        .sort({ caNo: -1 })
        .collation({ locale: "en", numericOrdering: true }); // Ensures sorting as numbers

    let sequence = 1;
    
    if (lastCa) {
        // Extract the last sequence number and increment it
        const lastSequence = parseInt(lastCa.caNo.split("-")[1], 10);
        sequence = lastSequence + 1;
    }

    // Ensure two-digit sequence format (e.g., "01", "02", ..., "99")
    const caNo = `${prefix}${sequence.toString().padStart(2, "0")}`;

    // Double-check uniqueness
    const exists = await CashAdvance.exists({ caNo });
    if (exists) {
        return generateUniqueCaNo(); // Recursively retry if collision occurs
    }

    return caNo;
};

const CashAdvanceController = {
    
    AddFileMaintenance: async (req, res)=>{
        try{
            const data = req.body;
            const file = new CaFileMaintenance(data);
            const savedFile = await file.save();
            res.json(savedFile);
        }catch(error){
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    },

    EditFileMaintenance: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;
            if (!id) {
                return res.status(400).json({ message: "ID is required" });
            }
            const updatedFile = await CaFileMaintenance.findByIdAndUpdate(id, updateData, { new: true });
            if (!updatedFile) {
                return res.status(404).json({ message: "File not found" });
            }
            res.json(updatedFile);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    },

    DeleteFileMaintenance: async (req, res) => {
        try {
            const { id } = req.params;
    
            if (!id) {
                return res.status(400).json({ message: "ID is required" });
            }
    
            const deletedFile = await CaFileMaintenance.findByIdAndDelete(id);
    
            if (!deletedFile) {
                return res.status(404).json({ message: "File not found" });
            }
    
            res.json({ message: "File deleted successfully", deletedFile });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    },    
     
    GetFileMaintenance: async (req, res) => {
        try {
            const { page = 1, search = "" } = req.query;
            const pageSize = 10;
            const pageNum = parseInt(page, 10);
    
            if (Number.isNaN(pageNum) || pageNum < 1) {
                return res.status(400).json({ message: "Invalid page number" });
            }
    
            // Build search query for wildcard matching
            const searchQuery = search
                ? {
                      $or: [
                          { riskNumber: { $regex: search, $options: "i" } }, // Case-insensitive match
                          { "subledger.slCode": { $regex: search, $options: "i" } },
                          { "subledger.name": { $regex: search, $options: "i" } }
                      ]
                  }
                : {}; // If no search, match everything
    
            // Get total count of matching documents
            const totalFiles = await CaFileMaintenance.countDocuments(searchQuery);
            const totalPages = Math.ceil(totalFiles / pageSize);
    
            if (totalFiles === 0) {
                return res.json({ data: [], totalRecords: 0, totalPages: 0, currentPage: pageNum });
            }
            
            // Fetch paginated search results
            let files = await CaFileMaintenance.find(searchQuery)
                .sort({ dateCreated: 1 })
                .skip((pageNum - 1) * pageSize)
                .limit(pageSize);
    
            // Get today's date in YYYY-MM-DD format
            const today = new Date().toISOString().split('T')[0];
    
            // Generate all async calls at once
            const balancePromises = files.map(async (file) => {
                const pt = await findBookBalance('10101020', file.subledger.slCode, '', today);
                const [caA, caB] = await Promise.all([
                    findBookBalance('19901040A', file.subledger.slCode, '', today),
                    findBookBalance('19901040B', file.subledger.slCode, '', today)
                ]);
    
                const caBal = (caA.debit - caA.credit) + (caB.debit - caB.credit);
                return { ...file._doc, pettyCash: (pt.debit - pt.credit), caBal: caBal };
            });
    
            // Wait for all promises to resolve
            const fileMaintenance = await Promise.all(balancePromises);
    
            res.json({
                data: fileMaintenance,
                totalRecords: totalFiles,
                totalPages,
                currentPage: pageNum
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    },    

    GetSLList: async (req, res)=>{
        try{
            const sls = await CaFileMaintenance.aggregate([
                {
                  $group: {
                    _id: "$subledger.slCode", // Group by unique subledger.slCode
                    subledger: { $first: "$subledger" } // Keep the first occurrence of subledger object
                  }
                },
                {
                  $replaceRoot: { newRoot: "$subledger" } // Remove _id and keep only subledger
                }
            ]);
            res.json(sls);
        }catch(error){
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    },

    FindFile: async (req, res)=>{
        try {
            const  {slCode, date } = req.params;
            const file = await CaFileMaintenance.findOne({
                "subledger.slCode": slCode,
                bondPeriodStart: { $lte: date },
                bondPeriodEnd: { $gte: date }
            });


            // Get today's date in YYYY-MM-DD format
            const today = new Date().toISOString().split('T')[0];

            const pt = await findBookBalance('10101020', file.subledger.slCode, '', today);

            const caA = await findBookBalance('19901040A', file.subledger.slCode, '', today);
            const caB = await findBookBalance('19901040B', file.subledger.slCode, '', today);

            const caBal = (caA.debit - caA.credit) + (caB.debit - caB.credit);
    
            res.json({...file._doc, pettyCash: (pt.debit - pt.credit), caBal: caBal});
        } catch (error) {
            console.error("Error finding document:", error);
            res.status(500).json({ message: error.message });
        }
    },
    
    CANoAutoGenerate: async (req, res)=>{
        try {
            const caNo = await generateUniqueCaNo();
            res.json({id: caNo});
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    AddCA: async (req, res)=>{
        try{
            // Create new CashAdvance document
            const newCashAdvance = new CashAdvance(req.body);
            // Save to database
            const savedCashAdvance = await newCashAdvance.save();
            res.status(201).json(savedCashAdvance);
        }catch(error){  
            console.error(error);
            res.status(500).json({ message: "Internal server error" })
        }
    },

    GetCA: async (req, res)=>{
        try {
            const { page = 1, search = "" } = req.query;
            const pageSize = 10;
            const pageNum = parseInt(page, 10);
    
            if (Number.isNaN(pageNum) || pageNum < 1) {
                return res.status(400).json({ message: "Invalid page number" });
            }
    
            // Build search query for wildcard matching
            const searchQuery = search
                ? {
                      $or: [
                          { caNo: { $regex: search, $options: "i" } }, // Case-insensitive match
                          { particulars: { $regex: search, $options: "i" } },
                          { date: { $regex: search, $options: "i" } },
                          { "file.subledger.name": { $regex: search, $options: "i" } }
                      ]
                  }
                : {}; // If no search, match everything
    
            // Get total count of matching documents
            const totalRecords = await CashAdvance.countDocuments(searchQuery);
            const totalPages = Math.ceil(totalRecords / pageSize);
    
            if (totalRecords === 0) {
                return res.json({ data: [], totalRecords: 0, totalPages: 0, currentPage: pageNum });
            }
    
            // Fetch paginated search results with file details populated
            const cashAdvances = await CashAdvance.find(searchQuery)
                .populate("file")
                .populate("linkedJV")
                .populate("linkedDV") // Populate subledger.name from file reference
                .populate("linkedForEntry")
                .sort({ date: 1 }) // Sorting by date
                .skip((pageNum - 1) * pageSize)
                .limit(pageSize);
    
            res.json({
                data: cashAdvances,
                totalRecords,
                totalPages,
                currentPage: pageNum
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    },

    link: async (req, res) => {
        try {
            const { id1, id2, updateType } = req.body; // id1 = CashAdvance ID, id2 = Entries ID, updateType = "jv" or "dv"
            if (!id1 || !id2 || !updateType) {
                return res.status(400).json({ message: "Missing required parameters" });
            }
            // Fetch the current Cash Advance to check its status
            const cashAdvance = await CashAdvance.findById(id1);
            if (!cashAdvance) {
                return res.status(404).json({ message: "Cash Advance not found" });
            }
            // Determine status update logic
            let updateField = {};
            // if jv is created automatically set this to liquidated
            if (updateType === "jv") {
                updateField = { linkedJV: id2, status: "liquidated" };
            } else if (updateType === "dv") {
                updateField = { linkedDV: id2 };
                // Keep "liquidated" status if it's already liquidated
                if (cashAdvance.status !== "liquidated") {
                    updateField.status = "for liquidation";
                }
            } else if(updateType === 'temp'){
                if(cashAdvance.status === 'for liquidation'){
                    updateField = { linkedForEntry: id2, status: "liquidated" };                    
                }else{
                    console.log('action is: ');
                    if(cashAdvance.status === "for liquidation" || cashAdvance.status === "liquidated"){
                        console.log("liquidated");
                        updateField = { linkedJV: id2, status: "liquidated" };
                    }else{
                        console.log("for entry? ", cashAdvance)
                        updateField = { linkedForEntry: id2, status: "for entry" };
                    }
                }
            } else {
                return res.status(400).json({ message: "Invalid update type. Use 'jv' or 'dv'." });
            }
            // Perform update
            const updatedCashAdvance = await CashAdvance.findByIdAndUpdate(
                id1,
                { $set: updateField },
                { new: true }
            );
            res.json({ message: "Cash Advance updated successfully", data: updatedCashAdvance });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    },    

    deleteCA: async (req, res)=>{
        try{
            const { id } = req.params; 
            await CashAdvance.deleteOne({ _id: id });
            res.json({ message: "cash advance deleted" });
        }catch(error){
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    },

    findUnliquidatedCA: async (req, res)=>{
        try{
            const { id } = req.params;
            const ca = await CashAdvance.find({ file: id, status: 'unliquidated' });
            res.json(ca);
        }catch(error){
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    },

    liquidate: async (req, res) => {
        try {
            const { id } = req.params;
    
            // Find temp entry
            const tempEntry = await EntriesTemp.findById(id);
            if (!tempEntry) {
                return res.status(404).json({ message: "Temporary entry not found" });
            }
    
            // Convert temp entry to plain object before saving
            const entryData = tempEntry.toObject();
            entryData._id = id; // Ensure _id remains the same
    
            // Insert into EntriesModel with the same _id
            const entry = new EntriesModel(entryData);
            await entry.save({ overwrite: true }); // Ensures MongoDB allows saving with the same _id
    
            // Find the CashAdvance entry linked to this temp entry
            const ca = await CashAdvance.findOne({ linkedForEntry: id });
            if (ca) {
                ca.linkedJV = ca.linkedForEntry;
                ca.linkedForEntry = null;
                ca.status = "liquidated";
                await ca.save();
            }
    
            // Delete the temp entry AFTER updating the CashAdvance
            await EntriesTemp.findByIdAndDelete(id);
    
            res.json({ message: "Entry successfully liquidated" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    },    
    
};

module.exports = CashAdvanceController;