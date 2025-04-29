const Customer = require("../models/Customer");
const {Invoice} = require("../models/InvoicesModel");
const InvoicePaymentLogs = require('../models/InvoicePaymentLogs');

// Create a new customer
exports.createCustomer = async (req, res) => {
  const customerData = req.body;

  try {
    const customer = new Customer(customerData);
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all customers with pagination and search
exports.getAllCustomers = async (req, res) => {
  try {
    const params = {};
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const keyword = req.query.keyword || "";

    if (keyword) {
      params.$or = [
        { firstName: { $regex: keyword, $options: "i" } },
        { lastName: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
      ];
    }

    if (req.query.id) {
      if (req.query.id.length !== 24) {
        return res.status(400).json({ error: "Invalid ID format" });
      }
      params._id = req.query.id;
    }

    const totalItems = await Customer.countDocuments(params);
    // get all customer list with all their outstanding invoices
    const customers = await Customer
    .aggregate([
      {
        $lookup: {
          from: 'invoices',
          let: { customerId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$customer.id', '$$customerId'] } }
            },
            {
              $addFields: { totalPayments: { $sum: '$payment.amount' } }
            },
            {
              $match: {
                $expr: { $lt: [{ $ifNull: ['$totalPayments', 0] }, '$total'] }
              }
            }
          ],
          as: 'invoices'
        }
      },
      {
        $match: {
          $or: [
            { firstName: { $regex: keyword, $options: "i" } },
            { lastName: { $regex: keyword, $options: "i" } },
            { email: { $regex: keyword, $options: "i" } },
          ]
        }
      },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ]);
    
    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      customers: customers.map((customer) => ({
        _id: customer._id,
        firstName: customer.firstName,
        middleName: customer.middleName,
        lastName: customer.lastName,
        suffix: customer.suffix,
        companyName: customer.companyName,
        customerDisplayName: customer.customerDisplayName,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        mobileNumber: customer.mobileNumber,
        website: customer.website,
        address: {
          region: customer.address.region,
          province: customer.address.province,
          municipality: customer.address.municipality,
          barangay: customer.address.barangay,
          streetAddress: customer.address.streetAddress,
          houseNumber: customer.address.houseNumber,
          zipcode: customer.address.zipcode
        },
        createdAt: customer.dateTimestamp.toISOString(),
        updatedAt: customer.dateUpdated.toISOString(),
        credit: customer.credit,
        invoices: customer.invoices
      })),
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a specific customer by ID
exports.getCustomerById = async (req, res) => {
  const { id } = req.params;

  try {
    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({
      ...customer.toObject(),
      address: {
        region: customer.address.region,
        province: customer.address.province,
        municipality: customer.address.municipality,
        barangay: customer.address.barangay,
        streetAddress: customer.address.streetAddress,
        houseNumber: customer.address.houseNumber,
        zipcode: customer.address.zipcode
      },
      createdAt: customer.dateTimestamp.toISOString(),
      updatedAt: customer.dateUpdated.toISOString(),
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a customer
exports.patchCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the existing customer first
    const existingCustomer = await Customer.findById(id);
    if (!existingCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const updateData = { ...req.body, dateUpdated: new Date() };

    // Define allowed updates
    const allowedUpdates = [
      "firstName",
      "middleName",
      "lastName",
      "suffix",
      "companyName",
      "customerDisplayName",
      "email",
      "phoneNumber",
      "mobileNumber",
      "website",
      "address",
      "dateUpdated",
    ];
    const updates = Object.keys(updateData);
    const isValidUpdate = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidUpdate) {
      return res.status(400).json({ error: "Invalid updates!" });
    }

    // Update the customer with the new data
    const updatedCustomer = await Customer.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({
      ...updatedCustomer.toObject(),
      address: {
        region: updatedCustomer.address.region,
        province: updatedCustomer.address.province,
        municipality: updatedCustomer.address.municipality,
        barangay: updatedCustomer.address.barangay,
        streetAddress: updatedCustomer.address.streetAddress,
        houseNumber: updatedCustomer.address.houseNumber,
        zipcode: updatedCustomer.address.zipcode
      },
      createdAt: updatedCustomer.dateTimestamp.toISOString(),
      updatedAt: updatedCustomer.dateUpdated.toISOString(),
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete a customer
exports.deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(204).send(); // No content
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// credits logic
exports.getCredit = async (req, res) => {
  const { id } = req.params;
  try{
    const customer = await Customer.findById(id);
    res.json({credit: customer.credit || 0});
  }catch(error){
    console.error("Error fetching customer credit", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Deduct credit from a customer
exports.deductCredit = async (id, credit) => {
  try {  
    console.log(id, credit);
    const dc = await Customer.findByIdAndUpdate(id, { $inc: { credit: -credit } }, { new: true });
    return dc;
  } catch (error) {
    console.error("Error deducting customer credit", error);
    // Instead of returning a response, just throw an error
    throw new Error("Failed to deduct credit");
  }
};

// Add credit to a customer
exports.addCredit = async (id, credit) => {
  try {
    const ac = await Customer.findByIdAndUpdate(id, { $inc: { credit: credit } }, { new: true });
    return ac;
  } catch (error) {
    console.error("Error adding customer credit", error);
    throw new Error("Failed to add credit");
  }
};

exports.getCustomerTransactions = async (req, res)=>{
  try{
    const { id } = req.params;
    const s = req.query.s || 0;
    const e = req.query.e || 1000;
    const q = req.query.q || '';
    console.log(id, s, e, q);
    const query = {'customer.id': id};
    if(q){
      const searchRegex = new RegExp(q, 'i');
      query.$or = [
        { temporaryInvoiceNumber: { $regex: searchRegex } },
        { officialInvoiceNumber: { $regex: searchRegex } },
      ];
    }
    // get total number of invoices
    const invoices = await Invoice.find(query).sort({invoiceDate: -1}).skip(s).limit(e);
    // get invoices based on pagination orderd by invoiceDate
    // for(let i in invoices){
    //   for(let p in invoices[i].payment){
    //     console.log(invoices[i]._id);
        
    //     const log = await InvoicePaymentLogs.find({'invoices.invoiceId': invoices[i]._id});
    //     console.log(log);

    //   }
    // }
    // populate invoice logs for each payment on invoice to see attached files

    res.json(invoices);
  }catch(error){
    console.error("Error retrieving customer invoices", error);
    throw new Error('Failed to retrieve invoices');
  }
};