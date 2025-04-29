const { PaymentTermsEnum, Invoice } = require("../models/InvoicesModel");
const InvoicePaymentLogs = require("../models/InvoicePaymentLogs");
const { uploadInvoiceAttachment, findGzippedFile } = require('../helper/helper');
const path = require('path');
const fs = require('fs');
const zlib = require('zlib');
const { v4: uuidv4 } = require("uuid"); // Ensure to include UUID library
const mongoose = require('mongoose'); // Add this line at the top of your file


const { deductCredit, addCredit } = require("./customerController");

const generateTemporaryInvoiceNumber = async () => {
  const prefix = "INV"; // Customize prefix

  // Format current date as MMDDYYYY
  const now = new Date();
  const formattedDate = `${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${now
    .getDate()
    .toString()
    .padStart(2, "0")}${now.getFullYear()}`;

  let temporaryInvoiceNumber;

  while (true) {
    // Generate a UUID and take the first 6 characters
    const randomSuffix = uuidv4().replace(/-/g, "").substring(0, 6); // Get first 6 characters of UUID

    // Construct the temporary invoice number
    temporaryInvoiceNumber = `${prefix}-${formattedDate}-${randomSuffix}`;

    // Check if this temporary invoice number already exists
    const existingInvoice = await Invoice.findOne({ temporaryInvoiceNumber });

    // If it doesn't exist, break the loop
    if (!existingInvoice) {
      break;
    }
  }

  return temporaryInvoiceNumber;
};

// Controller to get a new temporary invoice number
const getTemporaryInvoiceNumber = async (req, res) => {
  try {
    const temporaryInvoiceNumber = await generateTemporaryInvoiceNumber();

    return res.status(200).json({
      success: true,
      message: "Temporary invoice number generated successfully",
      temporaryInvoiceNumber: temporaryInvoiceNumber,
    });
  } catch (error) {
    console.error("Error generating temporary invoice number:", error);
    return res.status(500).json({
      success: false,
      message: "Error generating temporary invoice number",
      error: error.message,
    });
  }
};

// Controller to create a new invoice
const createInvoice = async (req, res) => {

  const {
    temporaryInvoiceNumber,
    officialInvoiceNumber,
    customer,
    message,
    reference,
    items = [], // Default to empty string if items are not provided
    paymentTerms,
    dueDate,
    invoiceDate,
    attachment
  } = JSON.parse(req.body.json);

  try {
    // Validate presence of temporaryInvoiceNumber if officialInvoiceNumber is not provided
    if (!officialInvoiceNumber && !temporaryInvoiceNumber) {
      return res.status(400).json({
        success: false,
        message:
          "temporaryInvoiceNumber is required if officialInvoiceNumber is not provided.",
      });
    }

    // If officialInvoiceNumber is provided, check if it exists
    if (officialInvoiceNumber) {
      const existingOfficialInvoice = await Invoice.findOne({
        officialInvoiceNumber,
      });
      if (existingOfficialInvoice) {
        return res.status(400).json({
          success: false,
          message: "Official invoice number already exists.",
        });
      }
    }

    // If temporaryInvoiceNumber is provided, check if it exists
    if (temporaryInvoiceNumber) {
      const existingTemporaryInvoice = await Invoice.findOne({
        temporaryInvoiceNumber,
      });
      if (existingTemporaryInvoice) {
        return res.status(400).json({
          success: false,
          message: "Temporary invoice number already exists.",
        });
      }
    }

    // reject invoice with empty items
    if(items.filter(i=>i.id).length === 0){
      return res.status(400).json({
        success: false,
        message: "Empty invoice items."
      });
    }

    // Create a new invoice
    const newInvoiceData = {
      customer,
      message,
      reference,
      items: items.filter(i=>i.id),
      paymentTerms,
      invoiceDate,
      dueDate,
      officialInvoiceNumber, // Include officialInvoiceNumber if provided
      // Always include temporaryInvoiceNumber when provided; it should not be null
      temporaryInvoiceNumber: temporaryInvoiceNumber || undefined, // Use undefined to omit if not provided
      attachment: attachment
    };

    const newInvoice = new Invoice(newInvoiceData);
    newInvoice.calculateItemsTotals(); // Calculate totals based on items

    await newInvoice.save(); // Save the invoice

    // console.log(newInvoice);

    // upload files
    if(req.files.files){
      for(let i = 0; i < req.files.files.length; i++){
        req.files.files[i].originalname = `${newInvoice._id}-${req.files.files[i].originalname}`;
        await uploadInvoiceAttachment(req.files.files[i]);
        // console.log(req.files.files[i])
      }
    }

    return res.status(201).json({
      success: true,
      message: "Invoice created successfully.",
      data: newInvoice,
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating invoice.",
      error: error.message,
    });
  }
};

// Controller to update an Invoice

const updateInvoice = async (req, res) => {
  try {

    // Find the existing invoice first
    const existingInvoice = await Invoice.findById(req.params.id);
    if (!existingInvoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    req.body = JSON.parse(req.body.json);

    // upload files
    if(req.files.files){
      for(let i = 0; i < req.files.files.length; i++){
        req.files.files[i].originalname = `${req.params.id}-${req.files.files[i].originalname}`;
        await uploadInvoiceAttachment(req.files.files[i]);
      }
    }

    // update deleted files
    const filenamesToDelete = existingInvoice.attachment.filter(f=>!req.body.attachment.includes(f))
    if(filenamesToDelete.length > 0){
      for(let i = 0; i < filenamesToDelete.length; i++){
        const wildcardPattern = `*-${req.params.id}-${filenamesToDelete[i]}.gz`;
        const gzippedFilePath = path.join(__dirname, '../uploads/invoice-attachment');
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
  
    // reject invoice with empty items
    if(req.body.items.filter(i=>i.id).length === 0){
      return res.status(400).json({
        success: false,
        message: "Empty invoice items."
      });
    }

    // INVOICE DETAILS UPDATE!!!
    

    // const updateData = { ...req.body, dateUpdated: new Date() }; // Add dateUpdated field

    // // Define allowed updates
    // const allowedUpdates = [
    //   "items",
    //   "subtotal",
    //   "total",
    //   "dueDate",
    //   "paymentTerms",
    //   "paidDate",
    //   "dateUpdated",
    // ];

    // const updates = Object.keys(updateData);
    // const isValidUpdate = updates.every((update) =>
    //   allowedUpdates.includes(update)
    // );

    // if (!isValidUpdate) {
    //   return res.status(400).json({ error: "Invalid updates!" });
    // }


    // Check if officialInvoiceNumber is provided and remove temporaryInvoiceNumber if true
    if (req.body.officialInvoiceNumber) {
      existingInvoice.temporaryInvoiceNumber = undefined; // Remove the temporary invoice number
      existingInvoice.officialInvoiceNumber = req.body.officialInvoiceNumber; // Set the official invoice number
    }


    
    const updateData = {
      message: req.body.message,
      reference: req.body.reference,
      paymentTerms: req.body.paymentTerms,
      dueDate: req.body.dueDate,
      items: req.body.items,
      customer: req.body.customer,
      attachment: req.body.attachment
    };
    
    // console.log(updateData);
    // Update the invoice with the new data
    Object.assign(existingInvoice, updateData);
    // Recalculate totals and due date based on the updated items
    if (updateData.items) {
      existingInvoice.calculateItemsTotals(); // Recalculate totals based on items
    }

    if (updateData.paymentTerms) {
      const daysToAdd = {
        [PaymentTermsEnum.NET15]: 15,
        [PaymentTermsEnum.NET30]: 30,
        [PaymentTermsEnum.NET60]: 60,
      }[updateData.paymentTerms];

      existingInvoice.dueDate = new Date(existingInvoice.invoiceDate);
      existingInvoice.dueDate.setDate(
        existingInvoice.dueDate.getDate() + daysToAdd
      );
    }


    // Save the updated invoice
    const updatedInvoice = await existingInvoice.save();
    res.status(200).json({
      success: true,
      message: "Invoice updated successfully.",
      data: updatedInvoice,
    });
  } catch (error) {
    console.error("Error updating invoice:", error);
    if (error.code === 11000) {
      return res.status(409).json({ error: "Duplicate entry error" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Define the getAllInvoices function
const getAllInvoices = async (req, res) => {
  try {
    const params = {};
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const keyword = req.query.keyword || "";
    const status = req.query.status || 'all';

    
    // Add filtering based on keyword if provided
    if (keyword) {
      params.$or = [
        { officialInvoiceNumber: { $regex: keyword, $options: "i" } },
        { temporaryInvoiceNumber: { $regex: keyword, $options: "i" } },
      ];
    }
    
    if(status != 'All' && status != 'Overdue'){
      params.$and = [
        { 'status.type': {$eq: status} }
      ];
    }else if(status === 'Overdue'){
      params.$and = [
        { dueDate: {$lte: new Date() }},
        { 'status.type': {$ne: 'Paid'} }
      ];
    }

    // Get the total number of invoices matching the criteria
    const totalItems = await Invoice.countDocuments(params);
    // Get the invoices with pagination
    const invoices = await Invoice.find(params)
    .sort({dateTimestamp: -1})
    .populate('items.id')
    .skip((page - 1) * limit)
    .limit(limit);

    // Respond with the data
    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      invoices,
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function to get an invoice by ID
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params; // Extract ID from URL parameters
    if (!id || id.length !== 24) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    const invoice = await Invoice.findById(id).populate('customer.id').populate('items.id');
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    res.json(invoice);
  } catch (error) {
    console.error("Error fetching invoice by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function to delete an invoice by ID
const deleteInvoiceById = async (req, res) => {
  try {
    const { id } = req.params; // Extract ID from URL parameters

    if (!id || id.length !== 24) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const deletedInvoice = await Invoice.findByIdAndDelete(id);
    // delete all file attachments associated with this invoice

    let filenamesToDelete = [];
    
    for(let i in deletedInvoice.attachment){
      filenamesToDelete.push(`${deletedInvoice._id}-` + deletedInvoice.attachment[i]);
    }
    
    for(let i in deletedInvoice.payment){
      // attachments in payment on invoice is logid-filename
      filenamesToDelete.push(...deletedInvoice.payment[i].attachments);
    }

    if(filenamesToDelete.length > 0){
      for(let i = 0; i < filenamesToDelete.length; i++){
        const wildcardPattern = `*-${filenamesToDelete[i]}.gz`;
        const gzippedFilePath = path.join(__dirname, '../uploads/invoice-attachment');
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

    if (!deletedInvoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.status(200).json({ message: "Invoice deleted successfully", deletedInvoice });
  } catch (error) {
    console.error("Error deleting invoice by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getInvoiceByCustomerId = async (req, res) => {
  try{
    const { id } = req.params;
    if (!id || id.length !== 24) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    const filter = {'customer.id': id};
    if(req.body.filter.length > 0){
      filter['status.type'] = req.body.filter;
    }
    const invoices = await Invoice.find(filter).sort({dueDate: 1});
    res.json({status: true, data: invoices});
  }catch(error){
    console.error("Error retrieving invoice by customer ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const payInvoices = async (req, res) => {
  try{
    const jsonData = JSON.parse(req.body.json);
    const paymentInfo = jsonData.paymentInfo;
    const paidInvoices = jsonData.paidInvoices;
    let recordAttachments = [];
    if(paymentInfo.appliedCredit > 0){
      deductCredit(paymentInfo.customer._id, paymentInfo.appliedCredit);
    }
    // add to credit if any
    if(paymentInfo.newCredit > 0){
      addCredit(paymentInfo.customer._id, paymentInfo.newCredit);
    }
    // log payment
    const log = new InvoicePaymentLogs({
      customerId: paymentInfo.customer.id,
      depositAccount: paymentInfo.depositTo._id,
      paymentDate: paymentInfo.paymentDate,
      amountReceived: paymentInfo.amountReceived,
      appliedAmount: paymentInfo.appliedAmount,
      appliedCredits: paymentInfo.appliedCredit,
      credited: paymentInfo.newCredit,
      paymentMethod: paymentInfo.paymentMethod,
      memo: paymentInfo.memo,
      referenceNumber: paymentInfo.referenceNo,
      invoices: paidInvoices.map(p=>({invoiceId: p._id, amount: p.amount})),
      attachments: !req.files.files ? [] : req.files.files.map(m=>m.originalname)
    });
    await log.save();
    if(req.files.files){
      recordAttachments = req.files.files.map(m=>`${log._id}-${m.originalname}`);
    }
    // record payment per invoice
    for(let i = 0; i < paidInvoices.length; i++){
      await Invoice.findByIdAndUpdate(
        paidInvoices[i]._id,
        {
          $push: {payment: {
            date: paidInvoices[i].date,
            method: paidInvoices[i].method,
            referenceNo: paidInvoices[i].referenceNo,
            account: paidInvoices[i].account,
            amount: paidInvoices[i].amount,
            attachments: recordAttachments
          }}
        },
        {new: true}
      );
    }
    // handle attachements
    if(req.files.files){
      for(let i = 0; i < req.files.files.length; i++){
        req.files.files[i].originalname = `${log._id}-${req.files.files[i].originalname}`;
        await uploadInvoiceAttachment(req.files.files[i]);
      }
    }
    // send email to customer
    res.json({status: true});
  }catch(error){
    console.error("Error processing invoice payment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// download file attachments from invoice payments
const downloadPaymentAttachment = async (req, res) => {
  try {
    const { id, filename } = req.params;
    // Construct the wildcard pattern (replace with your actual prefix if necessary)
    const wildcardPattern = `*-${filename}.gz`; // Using * to represent the random part
    const gzippedFilePath = path.join(__dirname, '../uploads/invoice-attachment'); // Directory containing the files
    // Find the gzipped file using the wildcard pattern
    const gzippedFileName = findGzippedFile(wildcardPattern, gzippedFilePath);
    if (!gzippedFileName) {
      return res.status(404).send('File not found.');
    }
    // Full path to the gzipped file
    const fullGzippedFilePath = path.join(gzippedFilePath, gzippedFileName);
    // Set the headers for the response
    res.setHeader('Content-Type', 'image/png'); // Change this if the file type is different
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
  }catch(error){
    console.error(error);
    res.status(500).send('Internal server error.');
  }
};

// Exporting the controller functions
module.exports = {
  getTemporaryInvoiceNumber,
  createInvoice,
  updateInvoice,
  getAllInvoices,
  getInvoiceById,
  deleteInvoiceById,
  getInvoiceByCustomerId,
  payInvoices,
  downloadPaymentAttachment
};
