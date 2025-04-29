const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Account = require("../models/AccountModel");
const BudgetTemplateModel = require("../models/BudgetTemplateModel");
require("dotenv").config();

const batchSize = 100;

const saveBudgetTemplate = async (budgetCategoriesJson) => {
  try {
    for (const { fundsType, fundsCode, codes } of budgetCategoriesJson) {
      // Find accounts based on the fundsCode
      const account = await Account.findOne({ code: fundsCode });

      if (!account) {
        console.log(`No account found for fundsCode ${fundsCode}`);
        continue;
      }

      let accounts = [];

      for (let i = 0; i < codes.length; i += batchSize) {
        const batch = codes.slice(i, i + batchSize);
        const batchAccounts = await Account.find({ code: { $in: batch } });
        accounts = accounts.concat(batchAccounts);
      }

      if (accounts.length === 0) {
        console.log(`No accounts found for the provided codes in fundsType: ${fundsType}`);
        continue;
      }

      const categories = accounts.map((account) => ({
        CategoryCode: account.code,
        CategoryName: account.name,
        CategoryBudget: 0,
        CategoryActual: 0,
        CurrentBalance: 0,
        CategoryPercentage: 0,
        _id: account._id,
      }));

      const budgetTemplate = new BudgetTemplateModel({
        FundsName: fundsType,
        FundsCode: fundsCode,
        FundsBudget: 0,
        FundsAllocated: 0,
        UnutilizedAmount: 0,
        FundsPercentage: 0,
        Category: categories,
        _id: account._id,
      });

      const savedTemplate = await budgetTemplate.save();
      console.log(`Budget Template for ${fundsType} saved successfully:`, savedTemplate);
    }
  } catch (error) {
    console.error("Error saving Budget Template:", error);
    throw error;
  }
};

// Example usage
(async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log("Connecting to MongoDB...");
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const filePath = path.join(__dirname, "../helper/BudgetCategories.json");
    const fileData = fs.readFileSync(filePath, "utf8");
    const budgetCategoriesJson = JSON.parse(fileData);

    await saveBudgetTemplate(budgetCategoriesJson);
  } catch (error) {
    console.error("Error:", error);
  }
})();
