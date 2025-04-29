const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    TotalBudget: {
      type: Number,  
      required: true,
    },
    ActualExpenses: {
      type: Number,  
      required: true,
    },
    RemainingBalance: {
      type: Number,  
      required: true,
      default: 0, 
    },
  },
  {
    timestamps: true, 
  }
);

budgetSchema.pre('save', function(next) {
  if (this.TotalBudget && this.ActualExpenses) {
    const totalBudget = this.TotalBudget;  
    const actualExpenses = this.ActualExpenses;  

    if (!isNaN(totalBudget) && !isNaN(actualExpenses)) {
      this.RemainingBalance = totalBudget - actualExpenses; 
    }
  }
  next();
});

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;
