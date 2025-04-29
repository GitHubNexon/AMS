const EntriesModel = require("../models/EntriesModel");
const XlsxPopulate = require("xlsx-populate");
const fs = require("fs");
const path = require("path");
const moment = require("moment");


const exportAlphaListTaxReport = async (req, res) => {
  try {
    const defaultBorder = { style: "thin", color: "000000" };
    const { Grandtotal, individualAlphaListEntries } = req.body;
    // open excel template and append data
    const templatePath = path.join(
      __dirname,
      "../templates/",
      "alphalisttaxreporttemplate.xlsx"
    );
    const workbook = await XlsxPopulate.fromFileAsync(templatePath);
    const sheet = workbook.sheet(0);


    sheet.cell("A3").value(moment().format("YYYY-MM-DD h:mm A"));
    // set date of Date Now
    // sheet.cell("N4").value(new Date().toLocaleDateString());

    //set Data
    // const usedRange = sheet.usedRange();
    // let lastRow = usedRange._maxRowNumber;

    const startRow = 13;
    let currentRow = startRow;

    individualAlphaListEntries.forEach((entry) => {
      sheet
        .cell(`A${currentRow}`)
        .value(new Date(entry.date).toLocaleDateString())
        .style({ horizontalAlignment: "center" });
      const documentNumber = entry.DVNo || entry.JVNo || entry.CRNo;

      sheet.cell(`B${currentRow}`).value(documentNumber);
      sheet.cell(`C${currentRow}`).value(entry.tin);
      sheet.cell(`D${currentRow}`).value(entry.registeredName);
      sheet.cell(`E${currentRow}`).value(entry.supplierName);
      sheet.cell(`F${currentRow}`).value(entry.supplierAddress);
      sheet.cell(`G${currentRow}`).value(entry.grossPurchase);
      sheet.cell(`H${currentRow}`).value(entry.exemptPurchase);
      sheet.cell(`I${currentRow}`).value(entry.zeroRatePurchase);
      sheet.cell(`J${currentRow}`).value(entry.amountOfTaxablePurchase);
      sheet.cell(`K${currentRow}`).value(entry.servicesPurchase);
      sheet.cell(`L${currentRow}`).value(entry.capitalGoods);
      sheet.cell(`M${currentRow}`).value(entry.goodsOtherThanCapital);
      sheet.cell(`N${currentRow}`).value(entry.inputTaxAmount);
      sheet.cell(`O${currentRow}`).value(entry.grossTaxablePurchase);
      currentRow++;
    });

    const footerRow = currentRow;

    sheet.cell(`A${footerRow}`).value("Grand Totals:");

    let footerColumn = "G";
    let lastColumn;

    for (const field in Grandtotal) {
      sheet.cell(`${footerColumn}${footerRow}`).value(Grandtotal[field]);

      lastColumn = footerColumn;

      footerColumn = String.fromCharCode(footerColumn.charCodeAt(0) + 1);
    }

    let column = "A";
    while (column <= lastColumn) {
      sheet.cell(`${column}${footerRow}`).style({
        bold: true,
        border: {
          top: { style: "thin", color: "000000" },
          bottom: { style: "thin", color: "000000" },
        },
        fill: {
          type: "pattern",
          pattern: "solid",
          foreground: {
            rgb: "BFBFBF",
          },
          background: {
            theme: 3,
            tint: 0.4,
          },
        },
      });
      column = String.fromCharCode(column.charCodeAt(0) + 1);
    }

    // Add the footer text "--- END OF REPORT ---" in the first column after the Grandtotal row
    const endOfReportRow = footerRow + 1;
    sheet
      .cell(`A${endOfReportRow}`)
      .value("--- END OF REPORT ---")
      .style("bold", true);

    // Adjust column widths if needed
    sheet.column("A").width(25);
    sheet.column("B").width(25);
    sheet.column("C").width(25);
    sheet.column("D").width(30);
    sheet.column("E").width(25);
    sheet.column("F").width(25);
    sheet.column("G").width(25);
    sheet.column("H").width(25);
    sheet.column("I").width(25);
    sheet.column("J").width(25);
    sheet.column("K").width(30);
    sheet.column("L").width(35);
    sheet.column("M").width(25);
    sheet.column("N").width(25);

    // respond with workbook buffer for file download
    const buffer = await workbook.outputAsync();
    res.setHeader(
      "Content-Dispositiom",
      'attachment; filename="alphalisttaxreporttemplate.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxlmformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error) {
    console.error("error on exporting AlphaListTaxReport to xlsx", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const exportAlphaListOutputTaxReport = async (req, res) => {
  try {
    const defaultBorder = { style: "thin", color: "000000" };
    const { Grandtotal, individualAlphaListEntries } = req.body;
    const templatePath = path.join(
      __dirname,
      "../templates/",
      "alphalistOutputTax.xlsx"
    );
    const workbook = await XlsxPopulate.fromFileAsync(templatePath);
    const sheet = workbook.sheet(0);


    sheet.cell("A3").value(moment().format("YYYY-MM-DD h:mm A"));
    // set date of Date Now
    // sheet.cell("N4").value(new Date().toLocaleDateString());

    //set Data
    // const usedRange = sheet.usedRange();
    // let lastRow = usedRange._maxRowNumber;

    const startRow = 13;
    let currentRow = startRow;

    individualAlphaListEntries.forEach((entry) => {
      sheet
        .cell(`A${currentRow}`)
        .value(new Date(entry.date).toLocaleDateString())
        .style({ horizontalAlignment: "center" });
      const documentNumber = entry.DVNo || entry.JVNo || entry.CRNo;

      sheet.cell(`B${currentRow}`).value(documentNumber);
      sheet.cell(`C${currentRow}`).value(entry.tin);
      sheet.cell(`D${currentRow}`).value(entry.registeredName);
      sheet.cell(`E${currentRow}`).value(entry.customerName);
      sheet.cell(`F${currentRow}`).value(entry.customerAddress);
      sheet.cell(`G${currentRow}`).value(entry.grossSales);
      sheet.cell(`H${currentRow}`).value(entry.exemptSales);
      sheet.cell(`I${currentRow}`).value(entry.zeroRateSales);
      sheet.cell(`J${currentRow}`).value(entry.amountOfTaxableSales);
      sheet.cell(`K${currentRow}`).value(entry.outputTaxAmount);
      sheet.cell(`L${currentRow}`).value(entry.grossTaxableSales);
      currentRow++;
    });

    const footerRow = currentRow;

    sheet.cell(`A${footerRow}`).value("Grand Totals:");

    let footerColumn = "G";
    let lastColumn;

    for (const field in Grandtotal) {
      sheet.cell(`${footerColumn}${footerRow}`).value(Grandtotal[field]);

      lastColumn = footerColumn;

      footerColumn = String.fromCharCode(footerColumn.charCodeAt(0) + 1);
    }

    let column = "A";
    while (column <= lastColumn) {
      sheet.cell(`${column}${footerRow}`).style({
        bold: true,
        border: {
          top: { style: "thin", color: "000000" },
          bottom: { style: "thin", color: "000000" },
        },
        fill: {
          type: "pattern",
          pattern: "solid",
          foreground: {
            rgb: "BFBFBF",
          },
          background: {
            theme: 3,
            tint: 0.4,
          },
        },
      });
      column = String.fromCharCode(column.charCodeAt(0) + 1);
    }

    const endOfReportRow = footerRow + 1;
    sheet
      .cell(`A${endOfReportRow}`)
      .value("--- END OF REPORT ---")
      .style("bold", true);

    sheet.column("A").width(25);
    sheet.column("B").width(25);
    sheet.column("C").width(25);
    sheet.column("D").width(30);
    sheet.column("E").width(25);
    sheet.column("F").width(25);
    sheet.column("G").width(25);
    sheet.column("H").width(25);
    sheet.column("I").width(25);
    sheet.column("J").width(25);
    sheet.column("K").width(30);
    sheet.column("L").width(30);


    // respond with workbook buffer for file download
    const buffer = await workbook.outputAsync();
    res.setHeader(
      "Content-Dispositiom",
      'attachment; filename="alphalistOutputTax.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxlmformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error) {
    console.error("error on exporting AlphaListOutputTaxReport to xlsx", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const exportEWTReport = async (req, res) => {
  try {
    const defaultBorder = { style: "thin", color: "000000" };
    const { reports, totalIncomePayment, totalTaxRate, totalTaxTotal } =
      req.body;

    const templatePath = path.join(
      __dirname,
      "../templates/",
      "EWT_Template.xlsx"
    );
    const workbook = await XlsxPopulate.fromFileAsync(templatePath);
    const sheet = workbook.sheet(0);

    sheet.cell("A3").value(moment().format("YYYY-MM-DD h:mm A"));

    const startRow = 10; 
    let currentRow = startRow;

    reports.forEach((report) => {
      const documentNumber = report.DVNo || report.JVNo || report.CRNo;
      sheet.cell(`A${currentRow}`).value(report.seqNo);
      sheet.cell(`B${currentRow}`).value(documentNumber);
      sheet.cell(`C${currentRow}`).value(report.tin);
      sheet.cell(`D${currentRow}`).value(report.corporation.name);
      sheet.cell(`E${currentRow}`).value(report.individual.name);
      sheet.cell(`F${currentRow}`).value(report.atcCode);
      sheet.cell(`G${currentRow}`).value(report.naturePayment);
      sheet.cell(`H${currentRow}`).value(report.incomePayment);
      sheet.cell(`I${currentRow}`).value(report.taxRate);
      sheet.cell(`J${currentRow}`).value(report.taxTotal);

      currentRow++;
    });

    const footerRow = currentRow;

    sheet.cell(`A${footerRow}`).value("Grand Totals:");
    sheet.cell(`H${footerRow}`).value(totalIncomePayment); 
    sheet.cell(`I${footerRow}`).value(totalTaxRate);
    sheet.cell(`J${footerRow}`).value(totalTaxTotal);

    let column = "A";
    while (column <= "K") {
      sheet.cell(`${column}${footerRow}`).style({
        bold: true,
        border: {
          top: defaultBorder,
          bottom: defaultBorder,
        },
        fill: {
          type: "pattern",
          pattern: "solid",
          foreground: { rgb: "BFBFBF" },
          background: { theme: 3, tint: 0.4 },
        },
      });
      column = String.fromCharCode(column.charCodeAt(0) + 1);
    }

    const endOfReportRow = footerRow + 1;
    sheet
      .cell(`A${endOfReportRow}`)
      .value("--- END OF REPORT ---")
      .style("bold", true);

    sheet.column("A").width(50);
    sheet.column("B").width(50);
    sheet.column("C").width(50);
    sheet.column("D").width(50);
    sheet.column("E").width(50);
    sheet.column("F").width(50);
    sheet.column("G").width(50);
    sheet.column("H").width(50);
    sheet.column("I").width(50);
    sheet.column("J").width(50);


    const buffer = await workbook.outputAsync();
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="EWT_Report.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error) {
    console.error("Error on exporting EWT Report to xlsx", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const exportFVATReport = async (req, res) => {
  try {
    const defaultBorder = { style: "thin", color: "000000" };
    const { reports, totalIncomePayment, totalTaxRate, totalTaxTotal } =
      req.body;

    const templatePath = path.join(
      __dirname,
      "../templates/",
      "FVAT_Template.xlsx"
    );
    const workbook = await XlsxPopulate.fromFileAsync(templatePath);
    const sheet = workbook.sheet(0);

    sheet.cell("A3").value(moment().format("YYYY-MM-DD h:mm A"));


    const startRow = 10; 
    let currentRow = startRow;

    reports.forEach((report) => {
      const documentNumber = report.DVNo || report.JVNo || report.CRNo;
      sheet.cell(`A${currentRow}`).value(report.seqNo);
      sheet.cell(`B${currentRow}`).value(documentNumber);
      sheet.cell(`C${currentRow}`).value(report.tin);
      sheet.cell(`D${currentRow}`).value(report.corporation.name);
      sheet.cell(`E${currentRow}`).value(report.individual.name);
      sheet.cell(`F${currentRow}`).value(report.atcCode);
      sheet.cell(`G${currentRow}`).value(report.naturePayment);
      sheet.cell(`H${currentRow}`).value(report.incomePayment);
      sheet.cell(`I${currentRow}`).value(report.taxRate);
      sheet.cell(`J${currentRow}`).value(report.taxTotal);

      currentRow++;
    });

    const footerRow = currentRow;

    sheet.cell(`A${footerRow}`).value("Grand Totals:");
    sheet.cell(`H${footerRow}`).value(totalIncomePayment); 
    sheet.cell(`I${footerRow}`).value(totalTaxRate); 
    sheet.cell(`J${footerRow}`).value(totalTaxTotal); 

    let column = "A";
    while (column <= "K") {
      sheet.cell(`${column}${footerRow}`).style({
        bold: true,
        border: {
          top: defaultBorder,
          bottom: defaultBorder,
        },
        fill: {
          type: "pattern",
          pattern: "solid",
          foreground: { rgb: "BFBFBF" },
          background: { theme: 3, tint: 0.4 },
        },
      });
      column = String.fromCharCode(column.charCodeAt(0) + 1);
    }

    const endOfReportRow = footerRow + 1;
    sheet
      .cell(`A${endOfReportRow}`)
      .value("--- END OF REPORT ---")
      .style("bold", true);

    sheet.column("A").width(50);
    sheet.column("B").width(50);
    sheet.column("C").width(50);
    sheet.column("D").width(50);
    sheet.column("E").width(50);
    sheet.column("F").width(50);
    sheet.column("G").width(50);
    sheet.column("H").width(50);
    sheet.column("I").width(50);
    sheet.column("J").width(50);


    const buffer = await workbook.outputAsync();
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="FVAT_Template.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error) {
    console.error("Error on exporting EWT Report to xlsx", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const exportWPTReport = async (req, res) => {
  try {
    const defaultBorder = { style: "thin", color: "000000" };
    const { reports, totalIncomePayment, totalTaxRate, totalTaxTotal } =
      req.body;

    const templatePath = path.join(
      __dirname,
      "../templates/",
      "WPT_Template.xlsx"
    );
    const workbook = await XlsxPopulate.fromFileAsync(templatePath);
    const sheet = workbook.sheet(0);

    sheet.cell("A3").value(moment().format("YYYY-MM-DD h:mm A"));


    const startRow = 10; 
    let currentRow = startRow;

    reports.forEach((report) => {
      const documentNumber = report.DVNo || report.JVNo || report.CRNo;
      sheet.cell(`A${currentRow}`).value(report.seqNo);
      sheet.cell(`B${currentRow}`).value(documentNumber);
      sheet.cell(`C${currentRow}`).value(report.tin);
      sheet.cell(`D${currentRow}`).value(report.corporation.name);
      sheet.cell(`E${currentRow}`).value(report.individual.name);
      sheet.cell(`F${currentRow}`).value(report.atcCode);
      sheet.cell(`G${currentRow}`).value(report.naturePayment);
      sheet.cell(`H${currentRow}`).value(report.incomePayment);
      sheet.cell(`I${currentRow}`).value(report.taxRate);
      sheet.cell(`J${currentRow}`).value(report.taxTotal);

      currentRow++;
    });

    const footerRow = currentRow;

    sheet.cell(`A${footerRow}`).value("Grand Totals:");
    sheet.cell(`H${footerRow}`).value(totalIncomePayment); 
    sheet.cell(`I${footerRow}`).value(totalTaxRate); 
    sheet.cell(`J${footerRow}`).value(totalTaxTotal); 

    let column = "A";
    while (column <= "K") {
      sheet.cell(`${column}${footerRow}`).style({
        bold: true,
        border: {
          top: defaultBorder,
          bottom: defaultBorder,
        },
        fill: {
          type: "pattern",
          pattern: "solid",
          foreground: { rgb: "BFBFBF" },
          background: { theme: 3, tint: 0.4 },
        },
      });
      column = String.fromCharCode(column.charCodeAt(0) + 1);
    }

    const endOfReportRow = footerRow + 1;
    sheet
      .cell(`A${endOfReportRow}`)
      .value("--- END OF REPORT ---")
      .style("bold", true);

    sheet.column("A").width(50);
    sheet.column("B").width(50);
    sheet.column("C").width(50);
    sheet.column("D").width(50);
    sheet.column("E").width(50);
    sheet.column("F").width(50);
    sheet.column("G").width(50);
    sheet.column("H").width(50);
    sheet.column("I").width(50);
    sheet.column("J").width(50);

    const buffer = await workbook.outputAsync();
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="WPT_Template.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error) {
    console.error("Error on exporting EWT Report to xlsx", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const exportWTCReport = async (req, res) => {
  try {
    const defaultBorder = { style: "thin", color: "000000" };
    const { reports, totalIncomePayment, totalTaxRate, totalTaxTotal } =
      req.body;

    const templatePath = path.join(
      __dirname,
      "../templates/",
      "WTC_Template.xlsx"
    );
    const workbook = await XlsxPopulate.fromFileAsync(templatePath);
    const sheet = workbook.sheet(0);

    sheet.cell("A3").value(moment().format("YYYY-MM-DD h:mm A"));


    const startRow = 10; 
    let currentRow = startRow;

    reports.forEach((report) => {
      const documentNumber = report.DVNo || report.JVNo || report.CRNo;
      sheet.cell(`A${currentRow}`).value(report.seqNo);
      sheet.cell(`B${currentRow}`).value(documentNumber);
      sheet.cell(`C${currentRow}`).value(report.tin);
      sheet.cell(`D${currentRow}`).value(report.corporation.name);
      sheet.cell(`E${currentRow}`).value(report.individual.name);
      sheet.cell(`F${currentRow}`).value(report.atcCode);
      sheet.cell(`G${currentRow}`).value(report.naturePayment);
      sheet.cell(`H${currentRow}`).value(report.incomePayment);
      sheet.cell(`I${currentRow}`).value(report.taxRate);
      sheet.cell(`J${currentRow}`).value(report.taxTotal);

      currentRow++;
    });

    const footerRow = currentRow;

    sheet.cell(`A${footerRow}`).value("Grand Totals:");
    sheet.cell(`H${footerRow}`).value(totalIncomePayment); 
    sheet.cell(`I${footerRow}`).value(totalTaxRate); 
    sheet.cell(`J${footerRow}`).value(totalTaxTotal); 

    let column = "A";
    while (column <= "K") {
      sheet.cell(`${column}${footerRow}`).style({
        bold: true,
        border: {
          top: defaultBorder,
          bottom: defaultBorder,
        },
        fill: {
          type: "pattern",
          pattern: "solid",
          foreground: { rgb: "BFBFBF" },
          background: { theme: 3, tint: 0.4 },
        },
      });
      column = String.fromCharCode(column.charCodeAt(0) + 1);
    }

    const endOfReportRow = footerRow + 1;
    sheet
      .cell(`A${endOfReportRow}`)
      .value("--- END OF REPORT ---")
      .style("bold", true);

    sheet.column("A").width(50);
    sheet.column("B").width(50);
    sheet.column("C").width(50);
    sheet.column("D").width(50);
    sheet.column("E").width(50);
    sheet.column("F").width(50);
    sheet.column("G").width(50);
    sheet.column("H").width(50);
    sheet.column("I").width(50);
    sheet.column("J").width(50);

    const buffer = await workbook.outputAsync();
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="WTC_Template.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error) {
    console.error("Error on exporting EWT Report to xlsx", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const exportDepreciation = async (req, res) => {
  try {
    const defaultBorder = { style: "thin", color: "000000" };
    const { summary, totals } = req.body;

    const templatePath = path.join(
      __dirname,
      "../templates/",
      "Depreciation_Schedule.xlsx"
    );
    const workbook = await XlsxPopulate.fromFileAsync(templatePath);
    const sheet = workbook.sheet(0);

    

    const startRow = 7;
    let currentRow = startRow;

    summary.forEach((summary) => {
      sheet.cell(`A${currentRow}`).value(summary.PropNo);
      sheet.cell(`B${currentRow}`).value(summary.Name);
      sheet.cell(`C${currentRow}`).value(moment(summary.AcquisitionDate).format('YYYY-MM-DD'));
      sheet.cell(`D${currentRow}`).value(summary.AssetDescription);
      sheet.cell(`E${currentRow}`).value(summary.Reference);
      sheet.cell(`F${currentRow}`).value(summary.Quantity);
      sheet.cell(`G${currentRow}`).value(summary.UnitCost);
      sheet.cell(`H${currentRow}`).value(summary.AcquisitionCost);
      sheet.cell(`I${currentRow}`).value(summary.UseFullLife);
      sheet.cell(`J${currentRow}`).value(summary.AccumulatedDepreciation[0].Value);
      sheet.cell(`K${currentRow}`).value(summary.NetBookValue[0].Value);
      sheet.cell(`L${currentRow}`).value(summary.MonthlyDepreciation[0].amount);
      sheet.cell(`M${currentRow}`).value(summary.MonthlyDepreciation[1].amount);
      sheet.cell(`N${currentRow}`).value(summary.MonthlyDepreciation[2].amount);
      sheet.cell(`O${currentRow}`).value(summary.MonthlyDepreciation[3].amount);
      sheet.cell(`P${currentRow}`).value(summary.MonthlyDepreciation[4].amount);
      sheet.cell(`Q${currentRow}`).value(summary.MonthlyDepreciation[5].amount);
      sheet.cell(`R${currentRow}`).value(summary.MonthlyDepreciation[6].amount);
      sheet.cell(`S${currentRow}`).value(summary.MonthlyDepreciation[7].amount);
      sheet.cell(`T${currentRow}`).value(summary.MonthlyDepreciation[8].amount);
      sheet.cell(`U${currentRow}`).value(summary.MonthlyDepreciation[9].amount);
      sheet.cell(`V${currentRow}`).value(summary.MonthlyDepreciation[10].amount);
      sheet.cell(`W${currentRow}`).value(summary.MonthlyDepreciation[11].amount);
      currentRow++;
    });

    const footerRow = currentRow;

    sheet.cell(`A${footerRow}`).value("Totals");
    sheet.cell(`J${footerRow}`).value(totals.totalAccumulatedDepreciation);
    sheet.cell(`K${footerRow}`).value(totals.totalNetBookValue);
    sheet.cell(`L${footerRow}`).value(totals.totalMonthlyDepreciation[0].amount);
    sheet.cell(`M${footerRow}`).value(totals.totalMonthlyDepreciation[1].amount);
    sheet.cell(`N${footerRow}`).value(totals.totalMonthlyDepreciation[2].amount);
    sheet.cell(`O${footerRow}`).value(totals.totalMonthlyDepreciation[3].amount);
    sheet.cell(`P${footerRow}`).value(totals.totalMonthlyDepreciation[4].amount);
    sheet.cell(`Q${footerRow}`).value(totals.totalMonthlyDepreciation[5].amount);
    sheet.cell(`R${footerRow}`).value(totals.totalMonthlyDepreciation[6].amount);
    sheet.cell(`S${footerRow}`).value(totals.totalMonthlyDepreciation[7].amount);
    sheet.cell(`T${footerRow}`).value(totals.totalMonthlyDepreciation[8].amount);
    sheet.cell(`U${footerRow}`).value(totals.totalMonthlyDepreciation[9].amount);
    sheet.cell(`V${footerRow}`).value(totals.totalMonthlyDepreciation[10].amount);
    sheet.cell(`W${footerRow}`).value(totals.totalMonthlyDepreciation[11].amount);
    // sheet.cell(`J${footerRow}`).value();
    let column = "A";
    while (column <= "W") {
      sheet.cell(`${column}${footerRow}`).style({
        bold: true,
        border: {
          top: defaultBorder,
          bottom: defaultBorder,
        },
        fill: {
          type: "pattern",
          pattern: "solid",
          foreground: { rgb: "BFBFBF" },
          background: { theme: 3, tint: 0.4 },
        },
      });
      column = String.fromCharCode(column.charCodeAt(0) + 1);
    }

    const endOfReportRow = footerRow + 1;
    sheet
      .cell(`A${endOfReportRow}`)
      .value("--- END OF REPORT ---")
      .style("bold", true);

    sheet.column("A").width(50);
    sheet.column("B").width(50);
    sheet.column("C").width(20);
    sheet.column("D").width(50);
    sheet.column("E").width(50);
    sheet.column("F").width(20);
    sheet.column("G").width(20);
    sheet.column("H").width(20);
    sheet.column("I").width(20);
    sheet.column("J").width(20);
    sheet.column("K").width(20);


    const buffer = await workbook.outputAsync();
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="EWT_Report.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error) {
    console.error("Error on exporting Depreciation Report to xlsx", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const exportTransactionList = async (req, res) => {
  try{
    const defaultBorder = { style: "thin", color: "000000" };
    const { bankRecon } = req.body;

    const templatePath = path.join(
      __dirname,
      "../templates/",
      "TransactionListBankRecon.xlsx"
    );
    const workbook = await XlsxPopulate.fromFileAsync(templatePath);
    const sheet = workbook.sheet(0);

    const startRow = 7;
    let currentRow = startRow;
    let seqNo = 1;

    sheet.cell("A3").value(moment().format("YYYY-MM-DD h:mm A"));
    sheet.cell("H6").value("BEGINNING BALANCE"); 
    sheet.cell("J6").value(bankRecon.bankStatement.bookBegBalance);
    
    bankRecon.transactions.map((transaction) => {
      sheet.cell(`A${currentRow}`).value(seqNo);  
      sheet.cell(`B${currentRow}`).value(transaction.SLCODE);
      sheet.cell(`C${currentRow}`).value(transaction.ACCTCODE);
      sheet.cell(`D${currentRow}`).value(transaction.ACCOUNTNAME);
      sheet.cell(`E${currentRow}`).value(transaction.SLDATE);
      sheet.cell(`F${currentRow}`).value(transaction.EntryType);
      sheet.cell(`G${currentRow}`).value(transaction.SLDOCNO);
      sheet.cell(`H${currentRow}`).value(transaction.SLDESC);
      sheet.cell(`I${currentRow}`).value(transaction.CheckNo);
      sheet.cell(`J${currentRow}`).value(transaction.SLDEBIT);
      sheet.cell(`K${currentRow}`).value(transaction.SLCREDIT);

      currentRow++;
      seqNo++; 
    });
    const footerRow = currentRow;

    sheet.cell(`A${footerRow}`).value("Totals:");
    sheet.cell(`J${footerRow}`).value(bankRecon.bankReconTotal.debit.totalAmount); 
    sheet.cell(`K${footerRow}`).value(bankRecon.bankReconTotal.credit.totalAmount); 

     const discrepancyTotal = bankRecon.bankReconTotal.debit.totalAmount - bankRecon.bankReconTotal.credit.totalAmount;
    
     sheet.cell(`J${footerRow + 1}`).value(discrepancyTotal);

    let column = "A";
    while (column <= "K") {
      sheet.cell(`${column}${footerRow}`).style({
        bold: true,
        border: {
          top: defaultBorder,
          bottom: defaultBorder,
        },
        fill: {
          type: "pattern",
          pattern: "solid",
          foreground: { rgb: "BFBFBF" },
          background: { theme: 3, tint: 0.4 },
        },
      });
      column = String.fromCharCode(column.charCodeAt(0) + 1);
    }

    const endOfReportRow = footerRow + 2;
    sheet
      .cell(`A${endOfReportRow}`)
      .value("--- END OF REPORT ---")
      .style("bold", true);

    sheet.column("A").width(15);
    sheet.column("B").width(30);
    sheet.column("C").width(30);
    sheet.column("D").width(30);
    sheet.column("E").width(35);
    sheet.column("F").width(35);
    sheet.column("G").width(35);
    sheet.column("H").width(35);
    sheet.column("I").width(25);
    sheet.column("J").width(25);




    const buffer = await workbook.outputAsync();
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Depreciation_Schedule.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);

  }catch (error) {
    console.error("Error on exporting Transaction List Report to xlsx", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}

module.exports = {
  exportAlphaListTaxReport,
  exportAlphaListOutputTaxReport,
  exportEWTReport,
  exportFVATReport,
  exportWPTReport,
  exportWTCReport,
  exportDepreciation,
  exportTransactionList
};
