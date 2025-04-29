const Bill = require("../models/BillModel");
const Vendor = require("../models/VendorModel");
const Log = require("../models/BillPaymentLogs");
const { uploadBillAttachment, findGzippedFile } = require("../helper/helper");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const BillController = {
    getBills: async function(req, res){
        try{
            const start = req.query.start || 0;
            const limit = req.query.limit || 1000;
            const status = req.query.status || '';
            const query = req.query.query || '';
            const filter = req.query.filter || '';
            const queries = {
                $or: [
                    { billNo: { $regex: query, $options: 'i' } },
                    { reference: { $regex: query, $options: 'i' } },
                    { tags: { $regex: query, $options: 'i' } },
                    { 'vendor.vendorName': { $regex: query, $options: 'i' } }
                ]
            };
            if(status){
                queries.status = status;
            }
            switch(filter){
                case "overdue":
                    queries.$and = [
                        { $expr: { $ne: ['$totalPaid', '$totalAmount'] } },
                        { dueDate: { $lt: new Date() } }
                    ];
                break;
                case "today":
                    const startOfDay = new Date();
                    startOfDay.setHours(0, 0, 0, 0);
                    const endOfDay = new Date();
                    endOfDay.setHours(23, 59, 59, 999);
                    queries.dueDate = { $gte: startOfDay, $lte: endOfDay };
                break;
                case "paid":
                    queries.status = 'paid';
                break;
                case "partial":
                    queries.$and = [
                        { $expr: { $ne: ['$totalPaid', '$totalAmount'] } },
                        { totalPaid: { $ne: 0 } }  
                    ];
                break;
            }
            const bills = await Bill.find(queries)
            .populate('categoryDetails.category')
            .sort({billDate: -1})
            .skip(start)
            .limit(limit);
            const count = await Bill.countDocuments(queries);
            return res.json({bills: bills, count: count});
        }catch(error){
            console.error(error);
        }
    },
    createBill: async function(req, res){
        try{
            const jsonData = JSON.parse(req.body.json);
            // saves the bill
            const newBill = new Bill(jsonData);
            await newBill.save();
            // handle file uploads
            if(req.files.files){
                for(let i = 0; i < req.files.files.length; i++){
                    req.files.files[i].originalname = `${newBill._id}-${req.files.files[i].originalname}`;
                    await uploadBillAttachment(req.files.files[i]);
                }
            }
            return res.json({status: true});
        }catch(error){
            console.error(error);
        }
    },
    editBill: async function(req, res){
        try{
            const { id } = req.params;
            const jsonData = JSON.parse(req.body.json);
            const existingBill = await Bill.findById(id);
            
            // check for deleted files based on currently sent file attachments
            const filenamesToDelete = existingBill.attachments.filter(f=>!jsonData.attachments.includes(f))
           
            Object.assign(existingBill, jsonData);
            const updatedBill = await existingBill.save();
            if(req.files.files){
                for(let i = 0; i < req.files.files.length; i++){
                    req.files.files[i].originalname = `${id}-${req.files.files[i].originalname}`;
                    await uploadBillAttachment(req.files.files[i]);
                }
            }

            if(filenamesToDelete.length > 0){
                for(let i = 0; i < filenamesToDelete.length; i++){
                    const wildcardPattern = `*-${id}-${filenamesToDelete[i]}.gz`;
                    const gzippedFilePath = path.join(__dirname, '../uploads/bill-attachment');
                    const gzippedFileName = findGzippedFile(wildcardPattern, gzippedFilePath);
                    if(!gzippedFileName){
                        continue;
                    }
                    const fullGzippedFilePath = path.join(gzippedFilePath, gzippedFileName);
                    fs.unlink(fullGzippedFilePath, (err) => {
                        if (err) {
                            console.error(`Error deleting file ${fullGzippedFilePath}:`, err);
                        } else {
                            console.log(`Successfully deleted file ${fullGzippedFilePath}`);
                        }
                    });
                }
            }
            return res.json({status: true});
        }catch(error){
            console.error(error);
        }
    },
    downloadAttachment: async function(req, res){
        try {
            const { id, filename } = req.params;
            // Construct the wildcard pattern for the gzipped file
            const wildcardPattern = `*-${id}-${filename}.gz`; 
            const gzippedFilePath = path.join(__dirname, '../uploads/bill-attachment');
            // Find the gzipped file using the wildcard pattern
            const gzippedFileName = findGzippedFile(wildcardPattern, gzippedFilePath);
            if (!gzippedFileName) {
                return res.status(404).send('File not found.');
            }
            // Full path to the gzipped file
            const fullGzippedFilePath = path.join(gzippedFilePath, gzippedFileName);
            // Set the headers for the response
            res.setHeader('Content-Type', 'image/png'); // Adjust this if the file type is different
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            // Create a read stream for the gzipped file
            const readStream = fs.createReadStream(fullGzippedFilePath);
            const unzipStream = zlib.createGunzip();
            // Pipe the gzipped file through the unzip stream and then to the response
            readStream
            .pipe(unzipStream)
            .pipe(res)
            .on('finish', () => {
                console.log('File sent successfully.');
            })
            .on('error', (err) => {
                console.error('Error sending file:', err);
                res.status(500).send('Could not download the file.');
            });
        } catch (error) {
            console.error('Error in downloadFile:', error);
            res.status(500).send('Internal Server Error');
        }
    },
    deleteBill: async function (req, res){
        try{
            const {id} = req.params;
            const existingBill = await Bill.findById(id);
            const billAttachments = existingBill.attachments;
            const paymentAttachments = existingBill.payment.map(m=>m.attachment).flat();
            const filenamesToDelete = billAttachments.concat(paymentAttachments);
            console.log(filenamesToDelete);
            const result = await Bill.deleteOne({ _id: id });
            // delete associated files on this bill
            if(filenamesToDelete.length > 0){
                for(let i = 0; i < filenamesToDelete.length; i++){
                    const wildcardPattern = `*-${id}-${filenamesToDelete[i]}.gz`;
                    const gzippedFilePath = path.join(__dirname, '../uploads/bill-attachment');
                    const gzippedFileName = findGzippedFile(wildcardPattern, gzippedFilePath);
                    if(!gzippedFileName){
                        continue;
                    }
                    const fullGzippedFilePath = path.join(gzippedFilePath, gzippedFileName);
                    fs.unlink(fullGzippedFilePath, (err) => {
                        if (err) {
                            console.error(`Error deleting file ${fullGzippedFilePath}:`, err);
                        } else {
                            console.log(`Successfully deleted file ${fullGzippedFilePath}`);
                        }
                    });
                }
            }
            res.json({status: true});
        }catch(error){
            console.error('Error in deleting bill:', error);
            res.status(500).send('Internal Server Error');
        }
    },
    pay: async function (req, res){
        try{
            const data = JSON.parse(req.body.json);
            // get account info based on vendor
            // const vendor = await Vendor.findOne({_id: data.vendor.vendorId});
            // record payment
            const paymentInfo = {
                paymentDate: data.paymentDate,
                method: data.method,
                reference: data.reference,
                account: data.account,
                amount: data.amount,
                attachment: data.attachment
            };
            await Bill.findOneAndUpdate(
                {_id: data.billId},
                { $push: { payment: paymentInfo } }
            );
            // upload files
            if(req.files.files){
                for(let i = 0; i < req.files.files.length; i++){
                    req.files.files[i].originalname = `${data.billId}-${req.files.files[i].originalname}`;
                    await uploadBillAttachment(req.files.files[i]);
                }
            }
            // record logs
            const logInfo = {
                billId: data.billId,
                paymentDate: data.paymentDate,
                reference: data.reference,
                method: data.method,
                account: data.account._id,
                amount: data.amount,
                attachment: data.attachment
            };
            const log = new Log(logInfo);
            await log.save();
            res.json({status: true})
        }catch(error){
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },
    payBatch: async function (req, res){
        try{
            const data = req.body;
            // save payment
            const paymentInfo = {
                paymentDate: data.paymentDate,
                method: data.method,
                reference: data.referenceNo,
                account: data.account,
                attachment: []
            };
            for(let i = 0; i < data.bills.length; i++){
                const payment = {...paymentInfo, amount: data.bills[i].openBalance};
                await Bill.findOneAndUpdate(
                    {_id: data.bills[i]._id},
                    { $push: { payment: payment } }
                );
            }
            // save logs
            const logInfo = {
                paymentDate: data.paymentDate,
                reference: data.referenceNo,
                method: data.method,
                account: data.account._id,
                attachment: []
            };
            for(let i = 0; i < data.bills.length; i++){
                const log = {
                    ...logInfo, 
                    billId: data.bills[i]._id,
                    amount: data.bills[i]._openBalance
                };
                const logsave = new Log(log);
                await logsave.save();
            }
            res.json({status: true});
        }catch(error){
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },
    generateRandomBillNo: async function (req, res){
        try{
            // count all documents
            const count = await Bill.countDocuments();
            res.json({id: count});
        }catch(error){
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }
};

module.exports = BillController;
