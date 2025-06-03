require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const statementOfAccount = require("./controller/StatementOfAccountController");

// Import the custom Helmet middleware setup
const setupHelmet = require("./middleware/helmetMiddleware");

const app = express();
app.disable("x-powered-by");
const PORT = process.env.PORT || 3002;

// Setup Helmet
// setupHelmet(app);
// parse cookies from request headers
app.use(cookieParser());

// Set limit to a higher value (e.g., 50MB)
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json());

// Enable CORS for frontend domain
app.use(
  cors({
    // origin: "*",
    origin: ["http://localhost:5173", "http://localhost:3002"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    // credentials: false
  })
);

// routes import
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const companySettingsRoutes = require("./routes/companySettingsRoutes");
const baseRoutes = require("./routes/baseRoutes");
const accountRoutes = require("./routes/accountRoutes");
const regionRoutes = require("./routes/regionRoutes");
const provincesRoutes = require("./routes/provinceRoutes");
const municipalitiesRoutes = require("./routes/municipalityRoutes");
const barangayRoutes = require("./routes/barangayRoutes");
// const customerRoutes = require("./routes/customerRoutes");
// const invoicesRoutes = require("./routes/invoiceRoutes");
// const productRoutes = require("./routes/productRoutes");
// const servicesRoutes = require("./routes/servicesRoutes");
const emailRoutes = require("./routes/emailRoutes");
const reportRoutes = require("./routes/reportRoutes");
// const vendorRoutes = require("./routes/vendorRoutes");
// const billRoutes = require("./routes/BillRoutes");
// const paymentRoutes = require("./routes/paymentRoutes");
// const budgetRoutes = require("./routes/BudgetRoute");
const EntriesRoutes = require("./routes/EntriesRoutes");
const subledgerRoutes = require("./routes/subledgerReferenceRoutes");
const taxRoutes = require("./routes/taxRoutes");
const alphaListTaxRoutes = require("./routes/alphaListTaxRoutes");
const EntriesReportRoutes = require("./routes/EntriesReportRoutes");
const ExportRoutes = require("./routes/ExportRoutes");
const BudgetTrackRoutes = require("./routes/BudgetTrackRoutes");
const NotificationRoutes = require("./routes/NotificationRoutes");
const OrderOfPaymentRoutes = require("./routes/OrderOfPaymentRoutes");
const BudgetReportRoutes = require("./routes/BudgetReportRoutes");
const TrialBalanceRoutes = require("./routes/TrialBalanceRoutes");
const FileAttachmentsRoutes = require("./routes/FileAttachmentsRoutes");
const CustomizedReportRoutes = require("./routes/CustomizedReportRoutes");
const SubReportRoutes = require("./routes/SubReportRoutes");
const BankReconRoutes = require("./routes/BankReconRoutes");
const PeriodClosingRoutes = require("./routes/PeriodClosingRoutes");
const SOARoutes = require("./routes/SOARoutes"); // no longer used
const ChartRoutes = require("./routes/ChartRoutes");
const DepreciationRoutes = require("./routes/DepreciationRoutes");
const StatementOfAccountRoutes = require("./routes/statementOfAccountRoutes");
const CashAdvanceRoutes = require("./routes/CashAdvance");
const PayroullRoutes = require("./routes/PayrollRoutes");
const assetsRoutes = require("./routes/assetsRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const assetsIssuanceRoutes = require("./routes/assetsIssuanceRoutes");
const assetsReturnRoutes = require("./routes/assetReturnRoutes");
const assetsDisposalRoutes = require("./routes/assetsDisposalRoutes");
const assetsRepairRouters = require("./routes/assetsRepairRoutes");
const assetsReportsRoutes = require("./routes/assetsReportsRoutes");
const assetsLostStolenRoutes = require("./routes/assetsLostStolenRoutes");

const cron = require("node-cron");

app.use(express.json());

// test mongodb connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("connected to MONGODB");
  })
  .catch((error) => {
    console.error(error);
  });

app.get("/ams/api", (req, res) => {
  res.send("AMS BACKEND");
});

// Serve static files from the React app
app.use("/AMS/", express.static(path.join(__dirname, "./../dist")));

app.use(express.json({ limit: "30mb" }));

// routes implementation
app.use("/ams/api/user", userRoutes);
app.use("/ams/api/auth", authRoutes);
app.use("/ams/api/company-settings", companySettingsRoutes);
app.use("/ams/api/base", baseRoutes);
app.use("/ams/api/account", accountRoutes);
app.use("/ams/api/region", regionRoutes);
app.use("/ams/api/province", provincesRoutes);
app.use("/ams/api/municipality", municipalitiesRoutes);
app.use("/ams/api/barangays", barangayRoutes);
// app.use("/api/customers", customerRoutes);
// app.use("/api/invoices", invoicesRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/services", servicesRoutes);
app.use("/ams/api/emails", emailRoutes);
app.use("/ams/api/reports", reportRoutes);
// app.use("/api/vendors", vendorRoutes);
// app.use("/api/bills", billRoutes);/
// app.use("/api/payments", paymentRoutes);
// app.use("/api/budget", budgetRoutes);
app.use("/ams/api/entries", EntriesRoutes);
app.use("/ams/api/subledgers", subledgerRoutes);
app.use("/ams/api/tax", taxRoutes);
app.use("/ams/api/alphaListTax", alphaListTaxRoutes);
app.use("/ams/api/EntriesReport", EntriesReportRoutes);
app.use("/ams/api/export", ExportRoutes);
app.use("/ams/api/budget-track", BudgetTrackRoutes);
app.use("/ams/api/notifications", NotificationRoutes);
app.use("/ams/api/or", OrderOfPaymentRoutes);
app.use("/ams/api/BudgetReport", BudgetReportRoutes);
app.use("/ams/api/TrialBalance", TrialBalanceRoutes);
app.use("/ams/api/files", FileAttachmentsRoutes);
app.use("/ams/api/reports/customized", CustomizedReportRoutes);
app.use("/ams/api/reports/sub", SubReportRoutes);
app.use("/ams/api/bank-recon", BankReconRoutes);
app.use("/ams/api/closing", PeriodClosingRoutes);
app.use("/ams/api/soa", SOARoutes);
app.use("/ams/api/Charts", ChartRoutes);
app.use("/ams/api/depreciation", DepreciationRoutes);
app.use("/ams/api/statementOfAccount", StatementOfAccountRoutes);
app.use("/ams/api/ca", CashAdvanceRoutes);
app.use("/ams/api/payroll", PayroullRoutes);
app.use("/ams/api/assets", assetsRoutes);
app.use("/ams/api/employee", employeeRoutes);
app.use("/ams/api/assets-issuance", assetsIssuanceRoutes);
app.use("/ams/api/assets-return", assetsReturnRoutes);
app.use("/ams/api/assets-disposal", assetsDisposalRoutes);
app.use("/ams/api/assets-repair", assetsRepairRouters);
app.use("/ams/api/assets-reports", assetsReportsRoutes);
app.use("/ams/api/assets-lost-stolen", assetsLostStolenRoutes);

// The "catchall" handler: for any request that doesn't
// match one above, send back React's(frontend) index.html file.
app.get("/AMS/*", (req, res) => {
  res.sendFile(path.join(__dirname + "./../dist/index.html"));
});

cron.schedule("0 * * * *", async () => {
  console.log("cron job fired");
  await statementOfAccount.scheduledSync();
});

app.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT} last updated 02/04/2025 10:05AM`
  );
});
