const mongoose = require("mongoose");

// Define enum for payment terms
const PaymentTermsEnum = {
  NET15: "net15",
  NET30: "net30",
  NET60: "net60",
};

// Create a schema for the invoice
const InvoiceSchema = new mongoose.Schema({
  temporaryInvoiceNumber: {
    type: String,
    unique: true,
    sparse: true,
    validate: {
      validator: function (value) {
        // Only require temporaryInvoiceNumber if officialInvoiceNumber is not present
        return this.officialInvoiceNumber || value != null;
      },
      message:
        "temporaryInvoiceNumber is required if officialInvoiceNumber is not provided.",
    },
  },
  officialInvoiceNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  customer: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    customerDisplayName: { type: String },
    mobileNumber: { type: String},
    email: { type: String, required: true },
    address: {
      region: {
        id: { type: Number, required: true },
        region_name: { type: String, required: true },
      },
      province: {
        id: { type: Number, required: true },
        province_name: { type: String, required: true },
      },
      municipality: {
        id: { type: Number, required: true },
        municipality_name: { type: String, required: true },
      },
      barangay: {
        id: { type: Number, required: true },
        barangay_name: { type: String, required: true },
      },
      streetAddress: { type: String },
      houseNumber: { type: String },
      zipcode: { type: String },
    },
  },
  items: [
    {
      type: {
        type: String,
        enum: ["Product", "Service"],
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "items.type", // Refers to the model based on the type field
      },
      description: {
        type: String,
      },
      quantity: {
        type: Number,
        min: 1,
      },
      price: {
        type: Number,
        min: 0,
      },
      taxRate: {
        type: Number,
        min: 0,
        max: 100,
      },
    },
  ],
  subtotal: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
  invoiceDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    sparse: true, // Optional, use sparse if not always provided
  },
  paymentTerms: {
    type: String,
    enum: Object.values(PaymentTermsEnum),
    required: true,
  },
  reference:{
    type: String,
    default: "",
  },
  paidDate: {
    type: Date,
    sparse: true, // Optional, use sparse if not always provided
  },
  message: {
    type: String,
    default: "",
  },
  dateTimestamp: {
    type: Date,
    default: Date.now,
  },
  dateUpdated: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: {
      type: String,
      enum: ["Pending", "Paid", "Partially Paid", "Past Due", "Void"],
      default: "Pending",
    },
    message: {
      type: String,
      default: "",
    },
  },
  payment: [
    {
      date: {type: Date},
      method: {type: String},
      referenceNo: {type: String},
      account: {type: mongoose.Types.ObjectId, ref: 'Account'},
      amount: {type: Number},
      attachments: [{type: String}]
    }
  ],
  memo: {type: String},
  attachment: [{type: String}]
});

// Calculate status dynamically
InvoiceSchema.methods.updateStatus = function () {

  let totalPayment = 0;
  this.payment.forEach((payment) => {
    totalPayment += payment.amount;
  });

  if (totalPayment > 0) {
    if (totalPayment >= this.total) {
      this.status.type = 'Paid';
      this.status.message = 'Invoice is fully paid.';
    } else if (totalPayment < this.total) {
      this.status.type = 'Partially Paid';
      this.status.message = 'Invoice is partially paid.';
    }
  }else if (this.dueDate && new Date(this.dueDate) < new Date()) {
    this.status.type = "Past Due";
    this.status.message = "Invoice is past due.";
  }

  // if (this.status.type === "Paid") {
  //   this.paidDate = new Date(); // Set paidDate when invoice is marked as paid
  //   this.status.message = "Invoice is fully paid.";
  // } else if (this.dueDate && new Date(this.dueDate) < new Date()) {
  //   this.status.type = "Past Due";
  //   this.status.message = "Invoice is past due.";
  // } else if (this.paymentTerms) {
  //   this.status.type = "Pending"; // Set status to Pending if paymentTerms is set
  //   this.status.message = "Invoice is pending.";
  // } else {
  //   this.status.type = "Paid";
  //   this.status.message = "Invoice is fully paid.";
  // }
};

// Method to calculate subtotal and total for items
InvoiceSchema.methods.calculateItemsTotals = function () {
  let invoiceSubtotal = 0;
  let invoiceTotal = 0;

  this.items.forEach((item) => {
    item.subtotal = item.price * item.quantity;
    //  + item.subtotal * (item.taxRate / 100)
    item.total = item.subtotal;
    
    invoiceSubtotal += item.subtotal;
    invoiceTotal += item.total;
  });

  this.subtotal = invoiceSubtotal;
  this.total = invoiceTotal;
};

// InvoiceSchema.methods.evaluatePayment = function () {
//   let totalPayment = 0;
//   this.payment.forEach((payment) => {
//     totalPayment += payment.amount;
//   });

//   if (totalPayment > 0) {
//     if (totalPayment >= this.total) {
//       this.status = 'Paid';
//     } else if (totalPayment < this.total) {
//       this.status = 'Partially Paid';
//     }
//   }
// };


InvoiceSchema.post('findOneAndUpdate', async function (doc) {
  // Fetch the updated document
  const invoice = await this.model.findOne(this.getQuery());
  if (invoice) {
    invoice.updateStatus();
    await invoice.save();  // Save the updated status
  }
});

InvoiceSchema.pre('save', function (next) {
  // Remove the temporary invoice number if the official invoice number is set
  if (this.officialInvoiceNumber) {
    this.temporaryInvoiceNumber = undefined; // Set it to undefined to remove it
  }
  next();
});


// Calculate due date based on payment terms before saving
InvoiceSchema.pre("save", function (next) {
  this.updateStatus(); // Automatically update status before saving

  // Only calculate due date if it's not set by the user
  if (!this.dueDate) {
    if (this.paymentTerms) {
      const daysToAdd = {
        [PaymentTermsEnum.NET15]: 15,
        [PaymentTermsEnum.NET30]: 30,
        [PaymentTermsEnum.NET60]: 60,
      }[this.paymentTerms];

      // Calculate the due date based on the invoice date and payment terms
      this.dueDate = new Date(this.invoiceDate);
      this.dueDate.setDate(this.dueDate.getDate() + daysToAdd);
    }
  }

  // Proceed to the next middleware
  this.updateStatus(); // Automatically update status before saving
  next();
});




const Invoice = mongoose.model("Invoice", InvoiceSchema);

// Exporting both the Invoice model and PaymentTermsEnum
module.exports = {
  Invoice,
  PaymentTermsEnum,
};
