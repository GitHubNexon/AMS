const mongoose = require("mongoose");

const AssetsInventoryHistorySchema = new mongoose.Schema(
  {
    parNo: { type: mongoose.Schema.Types.Mixed },
    fundCluster: { type: mongoose.Schema.Types.Mixed },
    entityName: { type: mongoose.Schema.Types.Mixed },
    date: { type: mongoose.Schema.Types.Mixed },
    transaction: { type: mongoose.Schema.Types.Mixed },
    issuanceId: { type: mongoose.Schema.Types.Mixed },
    returnId: { type: mongoose.Schema.Types.Mixed },
    disposalId: { type: mongoose.Schema.Types.Mixed },
    repairId: { type: mongoose.Schema.Types.Mixed },
    repairedId: { type: mongoose.Schema.Types.Mixed },
    lostStolenId: { type: mongoose.Schema.Types.Mixed },
    employeeId: { type: mongoose.Schema.Types.Mixed },
    dateAcquired: { type: mongoose.Schema.Types.Mixed },
    dateReleased: { type: mongoose.Schema.Types.Mixed },
    issuedBy: { type: mongoose.Schema.Types.Mixed },
    assetRecords: { type: mongoose.Schema.Types.Mixed },
    assetId: { type: mongoose.Schema.Types.Mixed },
    inventoryId: { type: mongoose.Schema.Types.Mixed },
    dateReturned: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

const AssetInventoryHistory = mongoose.model(
  "AssetInventoryHistory",
  AssetsInventoryHistorySchema
);

module.exports = AssetInventoryHistory;
