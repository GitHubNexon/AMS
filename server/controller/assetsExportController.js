const assetsModal = require("../models/AssetsModel");
const XlsxPopulate = require("xlsx-populate");
const fs = require("fs");
const path = require("path");
const moment = require("moment");

const exportAssetHistory = async (req, res) => {
  try {
    const { inventoryHistory } = req.body;
    const templatePath = path.join(
      __dirname,
      "../templates/",
      "Assets_History.xlsx"
    );
    const workbook = await XlsxPopulate.fromFileAsync(templatePath);
    const sheet = workbook.sheet(0);

    let currentRow = 2;

    inventoryHistory.forEach((entry) => {
      const date =
        entry.dateLostStolen ||
        entry.dateAcquired ||
        entry.dateReturned ||
        entry.dateRepaired ||
        entry.dateDisposed;

      const transaction = entry.transaction || "";
      const entityName = entry.entityName || "";
      const unit = entry.unit || "";

      (entry.assetRecords || []).forEach((record) => {
        sheet
          .cell(`A${currentRow}`)
          .value(moment(date).format("MM/DD/YYYY"))
          .style({ horizontalAlignment: "center" });

        sheet.cell(`B${currentRow}`).value(transaction);
        sheet.cell(`C${currentRow}`).value(entityName);
        sheet.cell(`D${currentRow}`).value(record.unit || "");
        sheet.cell(`E${currentRow}`).value(record.itemNo || "");
        sheet.cell(`F${currentRow}`).value(record.amount || "");
        sheet.cell(`G${currentRow}`).value(record.useFullLife || "");
        sheet.cell(`H${currentRow}`).value(record.description || "");

        currentRow++;
      });
    });

    const buffer = await workbook.outputAsync();
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Assets_History.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error) {
    console.error("error on exporting to xlsx", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  exportAssetHistory,
};
