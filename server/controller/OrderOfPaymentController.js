const OrderOfPaymentModel = require('../models/OrderOfPaymentModel');
const {OrderOfPaymentDeleted, OrderOfPaymentCancelled} = require('../models/OrderOfPaymentModel');
const EntriesModel = require("../models/EntriesModel");
const { EntriesCancelled } = require("../models/EntriesModel");

const OrderOfPaymentController = {
    // Add a new order of payment
    saveOrder: async (req, res) => {
        try {
            const ors = req.body;
            const newOrs = ors.filter(or => !or._id);
            const existingOrs = ors.filter(or => or._id);
            const newOrSaved = [];
            // Validate all orders before saving
            for (let i = 0; i < newOrs.length; i++) {
                const newOrder = new OrderOfPaymentModel(newOrs[i]);
                await newOrder.validate(); // Validate without saving
            }
            // If all validations pass, save all orders
            for (let i = 0; i < newOrs.length; i++) {
                const newOrder = new OrderOfPaymentModel(newOrs[i]);
                const newOr = await newOrder.save(); // Save after validation
                newOrSaved.push(newOr)
            }
            // update existing orders
            for (let i = 0; i < existingOrs.length; i++) {
                const existingOrder = await OrderOfPaymentModel.findById(existingOrs[i]._id);
                if (!existingOrder) {
                    return res.status(404).json({ message: `OR No. ${existingOrs[i].orderOfPaymentNo} not found` });
                }
                existingOrder.set(existingOrs[i]);
                await existingOrder.save();
            }
            res.json(newOrSaved);
        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({ 
                    message: `OR No. ${error.keyValue.orderOfPaymentNo} already exists` 
                });
            }
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    }, 

    // Retrieve all orders of payment
    getAllOrders: async (req, res) => {
        try {
            const { page = 1, limit = 1000, date = '', search = '', noCashReceipt = false, noDepositSlip = false } = req.query;
            const pageInt = parseInt(page);
            const limitInt = parseInt(limit);
            const skip = (pageInt - 1) * limitInt;
    
            const matchFilter = {};
            if (date) matchFilter.date = date;
            if (search) {
                matchFilter.$or = [
                    { 'client.name': { $regex: search, $options: 'i' } },
                    { 'client.slCode': { $regex: search, $options: 'i' } },
                    { 'orderOfPaymentNo': { $regex: search, $options: 'i' } }
                ];
            }
    
            if (noCashReceipt === "true") {
                matchFilter.linkedCashReceiptEntry = { $exists: false, $eq: null };
            }
            if (noDepositSlip === "true") {
                matchFilter.linkedDepositSlipEntry = { $exists: false, $eq: null };
            }
    
            const orders = await OrderOfPaymentModel.aggregate([
                { $match: matchFilter }, // Apply filters to active orders
                {
                    $unionWith: {
                        coll: "orderofpaymentdeleteds", // Join with deleted orders
                        pipeline: [{ $match: matchFilter }]
                    }
                },
                {
                    $unionWith: {
                        coll: "orderofpaymentcancelleds", // Join with cancelled orders
                        pipeline: [{ $match: matchFilter }]
                    }
                },
                { $sort: { date: -1, orderOfPaymentNo: -1 } }, // Sort both active and deleted together
                { $skip: skip },
                { $limit: limitInt },
                {
                    $lookup: { // Populate linkedCashReceiptEntry
                        from: "entries",
                        localField: "linkedCashReceiptEntry",
                        foreignField: "_id",
                        as: "linkedCashReceiptEntry"
                    }
                },
                {
                    $lookup: { // Populate linkedDepositSlipEntry
                        from: "entries",
                        localField: "linkedDepositSlipEntry",
                        foreignField: "_id",
                        as: "linkedDepositSlipEntry"
                    }
                },
                {
                    $addFields: {
                        linkedCashReceiptEntry: {
                            $cond: {
                                if: { $gt: [{ $size: "$linkedCashReceiptEntry" }, 0] }, 
                                then: { $arrayElemAt: ["$linkedCashReceiptEntry", 0] },  // Convert array to object
                                else: null
                            }
                        },
                        linkedDepositSlipEntry: {
                            $cond: {
                                if: { $gt: [{ $size: "$linkedDepositSlipEntry" }, 0] }, 
                                then: { $arrayElemAt: ["$linkedDepositSlipEntry", 0] },  // Convert array to object
                                else: null
                            }
                        }
                    }
                }
            ]);
            const totalCount = await OrderOfPaymentModel.countDocuments(matchFilter) + await OrderOfPaymentDeleted.countDocuments(matchFilter);
            res.status(200).json({ or: orders, count: totalCount });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    },
    
    link: async (req, res)=>{
        try{
            const { entryId, orId, type } = req.body;
            const existingOrder = await OrderOfPaymentModel.findById(orId);
            if(type === 'Cash Receipt'){
                existingOrder.linkedCashReceiptEntry = entryId;
            }else if(type === 'Deposit Slip'){
                existingOrder.linkedDepositSlipEntry = entryId;
            }
            await existingOrder.save();

            res.json("trying to link");
        }catch(error){
            console.log(error);
            res.status(500).json({ message: error.message });
        }
    },

    getPrevious: async (req, res)=>{
        try{
            const { id } = req.params;
            // get top 499 transactions
            const transactions = await OrderOfPaymentModel.find({ 'client.slCode': id }).sort({ date: -1}).limit(499);            
            res.json(transactions);
        }catch(error){
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    },

    find: async (req, res)=>{
        try{
            const { id } = req.params;
            const or = await OrderOfPaymentModel.findOne({ $or: [{_id: id}, { linkedCashReceiptEntry: id}, {linkedDepositSlipEntry: id }]});
            res.json(or);
        }catch(error){
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    },

    validate: async (req, res)=>{
        try{
            const { no } = req.params;
            const or = await OrderOfPaymentModel.findOne({ orderOfPaymentNo: no });
            if(or){
                return res.status(409).json({ valid: false });
            }
            res.json({valid: true});
        }catch(error){
            console.error(error);
            res.status(500).json({ message: error.message });   
        }
    },

    autonumber: async (req, res) => {
        try {
            const { count } = req.params;
            const { except = [] } = req.body;
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const prefix = `${year}-${month}`;
    
            // Find the latest order number with the same prefix
            const latestOrder = await OrderOfPaymentModel.aggregate([
                {
                    $unionWith: {
                        coll: "orderofpaymentcancelleds",
                        pipeline: [{ 
                            $match: { orderOfPaymentNo: new RegExp(`^${prefix}-\\d+$`) }
                        }]
                    }
                },
                {
                    $match: {
                        orderOfPaymentNo: new RegExp(`^${prefix}-\\d+$`)
                    }
                },
                {
                    $addFields: {
                        numericPart: { 
                            $toInt: { 
                                $arrayElemAt: [{ $split: ["$orderOfPaymentNo", "-"] }, 2] 
                            } 
                        }
                    }
                },
                { $sort: { numericPart: -1 } }, // Sort numerically
                { $limit: 1 } // Get the latest order
            ]);
    
            let lastSequence = 0;
            if (latestOrder.length > 0 && latestOrder[0].numericPart !== undefined) {
                lastSequence = latestOrder[0].numericPart;
            }
    
            const generatedNumbers = [];
            let nextSequence = lastSequence + 1;
            const countNum = parseInt(count, 10); // Convert count to a number
    
            while (generatedNumbers.length < countNum) {
                const newOrderNo = `${prefix}-${String(nextSequence).padStart(2, '0')}`;
                if (!except.includes(newOrderNo)) {
                    generatedNumbers.push(newOrderNo);
                }
                nextSequence++;
            }
    
            res.json(generatedNumbers);
        } catch (error) { 
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    },    

    imbalance: async (req, res)=>{
        try{
            const or = await OrderOfPaymentModel.aggregate([
                {
                    $project: {
                        orderOfPaymentNo: 1,
                        date: 1,
                        remarks: 1,
                        client: 1,
                        gl: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        amount: { $round: ["$amount", 2] },
                        glsum: { $round: [{ $sum: "$gl.amount" }, 2] }
                    }
                },
                {
                    $match: {
                        glsum: {$ne: 0},
                        $expr: {
                        $gt: [
                                { $abs: { $subtract: ["$amount", "$glsum"] } },
                                0.01
                            ]
                        }
                    }
                }
            ]).limit(1000);
            res.json(or);
        }catch(error){
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    },

    deleteOrder: async (req, res)=>{
        try{
            const { id } = req.params;
            const or = await OrderOfPaymentModel.findById(id);
            if(or.linkedCashReceiptEntry){
                await EntriesModel.findByIdAndDelete(or.linkedCashReceiptEntry)
            }
            if(or.linkedDepositSlipEntry){
                await EntriesModel.findByIdAndDelete(or.linkedDepositSlipEntry)
            }
            const copy = or.toObject();
            const d = await OrderOfPaymentModel.findByIdAndDelete(or._id);
            copy.deletedDate = new Date();
            await OrderOfPaymentDeleted.create(copy);
            res.json(d);
        }catch(error){
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    },

    cancelOrder: async (req, res) => {
        try {
            const { id } = req.params;
    
            // Find the Order of Payment
            const or = await OrderOfPaymentModel.findById(id);
            const copy = or.toObject(); // Convert to plain object
            // Cancel linked receipt entry
            if (or.linkedCashReceiptEntry) {
                const ent = await EntriesModel.findById(or.linkedCashReceiptEntry);
                if (ent) {
                    const canc = ent.toObject();
                    canc.cancelledDate = new Date();
                    await EntriesCancelled.collection.insertOne(canc); // Keep same _id
                    await ent.deleteOne();
                }
            }
            // Cancel linked deposit slip entry
            if (or.linkedDepositSlipEntry) {
                const ent = await EntriesModel.findById(or.linkedDepositSlipEntry);
                if (ent) {
                    const canc = ent.toObject();
                    canc.cancelledDate = new Date();
                    await EntriesCancelled.collection.insertOne(canc);
                    await ent.deleteOne();
                }
            }
    
            // Move OR to cancelled collection
            copy.cancelledDate = new Date();
            await OrderOfPaymentCancelled.create(copy); // Keep same _id
    
            // Delete original OR
            await or.deleteOne();
    
            res.json({ message: "Order cancelled successfully" });
    
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    }
    
    

}

module.exports = OrderOfPaymentController;