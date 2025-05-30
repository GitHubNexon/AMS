const AssetsDisposal = require("../models/AssetsDisposalModel");
const AssetsModel = require("../models/AssetsModel");
const EmployeeModel = require("../models/employeeModel");

const handleDisposalApproval = async (disposal) => {
  for (let record of disposal.assetRecords) {
    const asset = await AssetsModel.findOne({ _id: record.assetId });
    if (!asset) {
      throw new Error(`Asset with ID ${record.assetId} not found`);
    }
    const historyData = {
      parNo: disposal.parNo,
      fundCluster: disposal.fundCluster,
      entityName: disposal.entityName,
      date: disposal.creadtedAt,
      transaction: "Disposal",
      disposalId: disposal._id,
      employeeId: disposal.employeeId,
      dateDisposed: disposal.dateDisposed,
      issuedBy: disposal.CreatedBy,
      assetRecords: disposal.assetRecords,
    };
  }
};


const handleDisposalReservation = async = (returnDoc) => {
    
}