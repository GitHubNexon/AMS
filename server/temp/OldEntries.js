require("dotenv").config();
const mongoose = require("mongoose");
const EntriesModel = require("./models/EntriesModel");
const ReportingFlatLedgers = require("./models/ReportingFlatLedgers");
const Account = require("./models/AccountModel");
const SubledgerReference = require("./models/subledgerReferenceModel");


const fs = require('fs');


const xlsx = require("xlsx");
const { constants } = require("buffer");

// const filepath = "./older.xlsx";

// const workbook = xlsx.readFile(filepath);

// const sheetNames = workbook.SheetNames;

// // console.log("Sheet Names: ", sheetNames);

// const firstSheetName = sheetNames[0];

// const firstSheet = workbook.Sheets[firstSheetName];

// // console.log("First Sheet Content:", firstSheet);

// const jsonData = xlsx.utils.sheet_to_json(firstSheet);
// console.log("Parsed JSON Data:", jsonData);

// const filtered = jsonData.filter(f => f.credit !== 0 || f.debit !== 0);

// // console.log(filtered.length);

// const remapped = filtered.map(m=>({
//     code: m.account,
//     slCode: m.subledger.split(' ')[0],
//     dr: m.debit,
//     cr: m.credit
// }));

// console.log(remapped);

async function start() {
  console.log(process.env.MONGODB_URI);
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
    // Ensure idfy completes before starting populateReporting
    // await octRe();
    willfixbeg();
    console.log("done");
  } catch (error) {
    console.error(error);
  }
}

async function willfixbeg(){
  console.log("reading old entries");
  const jsonString = await fs.promises.readFile('begentryre.json', 'utf8');
  const jsonData = JSON.parse(jsonString);
  const ledgers = jsonData[0].ledgers;
  for(let i = 0; i < ledgers.length; i++){
    const typ = ledgers[i].ledger.code.charAt(0);
    if(['1', '5'].includes(typ)){
      // value should be dr
      // console.log(ledgers[i]);
      // asOf = asofEntry.totalDr - asofEntry.totalCr;
    }else if(['2', '3', '4'].includes(typ)){
      ledgers[i].cr = ledgers[i].dr;
      ledgers[i].dr = null;
      
      
      // value should be cr
      // asOf = asofEntry.totalCr - asofEntry.totalDr;
    }
    // console.log(ledgers[i]);
  }
  jsonData[0].ledgers = ledgers;
  console.log(jsonData)
  // write
  await fs.promises.writeFile('begfixedagain.json', JSON.stringify(jsonData, null, 2));
  console.log("JSON file updated successfully");
}

async function findcodes(id){
  const data = await Account.find({code: id});
  if (data.length === 0) {
    // console.log(`No data found for code: ${id}`);
    return null; // Or return a default value, depending on your use case
  }
  return data[0].name;
}

async function findsl(id){
  const data = await SubledgerReference.find({slCode: id});
  if (data.length === 0) {
    // console.log(`No data found for slCode: ${id}`);
    return null; // Or return a default value, depending on your use case
  }
  return data[0].name;
}

async function octRe(){
  const filepath = "./oct.xlsx";
  const workbook = xlsx.readFile(filepath);
  const sheetNames = workbook.SheetNames;
  const firstSheetName = sheetNames[0];
  const firstSheet = workbook.Sheets[firstSheetName];
  let jsonData = xlsx.utils.sheet_to_json(firstSheet);


  const pre = [];

  

  for(let i = 0; i < jsonData.length; i++){
    console.log(jsonData[i])
    if(jsonData[i].debit === undefined) continue;
    const name = await findcodes(jsonData[i].code);
    // console.log('looking for', jsonData[i].sl.split(' ')[0])
    const sl = await findsl(jsonData[i].subledger.split(' ')[0]);
    // console.log(sl);
    pre.push({
      ledger: {
        code: String(jsonData[i].code),
        name: name
      },
      subledger: {
        slCode: String(jsonData[i].subledger.split(' ')[0]),
        name: sl
      },
      type: "CR",
      dr: jsonData[i].debit,
      cr: jsonData[i].credit,
      description: "begining balance import"
    })
  }

  const final = {
    EntryType: "Journal",
    JVNo: "00-00-0001",
    JVDate: "2024-10-30",
    Particulars: "october import",
    PreparedBy: {
      name: "Administrator",
      position: "Administrator",
      _id: "6764d2ed48b975deebb779d4"
    },
    CertifiedBy: {
      name: "Administrator",
      position: "Administrator",
      _id: "6764d2ed48b975deebb779d4"
    },
    ReceivedBy: "Administrator",
    ApprovedBy: "Administrator",
    attachments: [],
    ledgers: pre,
    DisbursementTransaction: [],
    PaymentEntity: ""
  };

  console.log(final);

  const filePath = './oct.json';
  const jsonString = JSON.stringify(final, null, 2);
  fs.writeFile(filePath, jsonString, (err) => {
    if (err) {
      console.error("Error writing file:", err);
    } else {
      console.log(`JSON data saved to ${filePath}`);
    }
  });





  console.log(pre);

  
}

async function gg(){

  const jsonString = await fs.promises.readFile('beg.json', 'utf8');
  const jsonData = JSON.parse(jsonString);

  console.log(jsonData.ledgers.length);
  // let drs = 0;
  // let crs = 0;

  for(let i = 0; i < jsonData.ledgers.length; i++){
    // drs += jsonData.ledgers[i].dr ? jsonData.ledgers[i].dr : 0;
    // crs += jsonData.ledgers[i].cr ? jsonData.ledgers[i].cr : 0;
    if(!jsonData.ledgers[i].dr){
      jsonData.ledgers[i].dr = jsonData.ledgers[i].cr; 
      jsonData.ledgers[i].cr = null;
    }
  }
  // console.log(drs, crs);

  await fs.promises.writeFile('beg.json', JSON.stringify(jsonData, null, 2));
  console.log("JSON file updated successfully");


  // const pre = [];

  // for(let i = 0; i < jsonData.length; i++){
  //   const name = await findcodes(jsonData[i].code);
  //   // console.log('looking for', jsonData[i].sl.split(' ')[0])
  //   const sl = await findsl(jsonData[i].sl.split(' ')[0]);
  //   // console.log(sl);
  //   pre.push({
  //     ledger: {
  //       code: String(jsonData[i].code),
  //       name: name
  //     },
  //     subledger: {
  //       slCode: String(jsonData[i].sl.split(' ')[0]),
  //       name: sl
  //     },
  //     type: "CR",
  //     dr: null,
  //     cr: jsonData[i].credit,
  //     description: "begining balance import"
  //   })
  // }

  // const final = {
  //   EntryType: "Journal",
  //   JVNo: "00-00-0000",
  //   JVDate: "2024-12-09",
  //   Particulars: "begining balance import",
  //   PreparedBy: {
  //     name: "Administrator",
  //     position: "Administrator",
  //     _id: "6764d2ed48b975deebb779d4"
  //   },
  //   CertifiedBy: {
  //     name: "Administrator",
  //     position: "Administrator",
  //     _id: "6764d2ed48b975deebb779d4"
  //   },
  //   ReceivedBy: "Administrator",
  //   ApprovedBy: "Administrator",
  //   attachments: [],
  //   ledgers: pre,
  //   DisbursementTransaction: [],
  //   PaymentEntity: ""
  // };

  // console.log(final);

  // const filePath = './beg.json';
  // const jsonString = JSON.stringify(final, null, 2);
  // fs.writeFile(filePath, jsonString, (err) => {
  //   if (err) {
  //     console.error("Error writing file:", err);
  //   } else {
  //     console.log(`JSON data saved to ${filePath}`);
  //   }
  // });

  // for(let i = 0; i < notfound.length; i++){
  //   const slCode = notfound[i].split(' ')[0];
  //   const name = notfound[i].split(' ').slice(1).join(' ');
  //   console.log(slCode, name);
  //   const ins = new SubledgerReference({
  //     slCode: slCode,
  //     name: name,
  //     isLessee: false
  //   });
  //   const aaaaa = await ins.save();
  //   console.log(aaaaa);
  // }
  
  // console.log(jsonData)

  // const testdr = jsonData.map(m=>m.debit).reduce((pre,cur)=>pre+cur,0);
  // const testcr = jsonData.map(m=>m.credit).reduce((pre,cur)=>pre+cur,0);
  // console.log(testdr)
  // console.log(testcr)

  // for(let i = 0; i < remapped.length; i++){
  //   const name = await findcodes(remapped[i].code);
  //   const sl = await findsl(remapped[i].slCode);
  //   remapped[i].name = name;
  //   remapped[i].sl = sl; 
  // }

  // console.log(remapped);
  // const testdr = remapped.map(m=>m.dr).reduce((pre,cur)=>pre+cur,0);
  // const testcr = remapped.map(m=>m.cr).reduce((pre,cur)=>pre+cur,0);
  // console.log(testdr)
  // console.log(testcr)
  
  // const ws = xlsx.utils.json_to_sheet(remapped);
  // const wb = xlsx.utils.book_new();
  // xlsx.utils.book_append_sheet(wb, ws, "Sheet1");
  // const filePath = "./older.xlsx";  // Path to save the file
  // xlsx.writeFile(wb, filePath);

}

start();




// // add id to existing entry ledgers !execute only once, this will not delet existing records in reportingflatledgers collection
// async function idfy() {
//   const entries = await EntriesModel.find({ "ledgers": { $exists: true, $not: { $size: 0 } } });
//   for (let entry of entries) {
//     for (let ledger of entry.ledgers) {
//       const id = new mongoose.Types.ObjectId();
//       ledger._id = id;
//     }
//     // Update other fields in the entry
//     entry.CreatedBy = { name: "Administrator", position: "Administrator" };
//     entry.PreparedBy = { name: "Administrator", position: "Administrator" };
//     entry.CertifiedBy = { name: "Administrator", position: "Administrator" };
//     entry.ReviewedBy = { name: "Administrator", position: "Administrator" };
//     entry.ApprovedBy1 = { name: "Administrator", position: "Administrator" };
//     entry.ApprovedBy2 = { name: "Administrator", position: "Administrator" };
//     entry.PaymentEntity = "250 - REYES, MARITA R.";
//     entry.createdAt = new Date(entry.createdAt);
//     // Save the updated entry
//     await entry.save();
//   }
//   console.log("DONE!");
// }

// async function populateReporting(){
//   const entries = await EntriesModel.find({ "ledgers": { $exists: true, $not: { $size: 0 } } });
//   for(let i = 0; i < entries.length; i++){
//     let no = '';
//     let d = '';
//     let t = '';
//     if (entries[i].JVNo) {
//       no = entries[i].JVNo;
//       d = new Date(entries[i].JVDate);
//       t = 'Journal';
//     } else if (entries[i].DVNo) {
//       no = entries[i].DVNo;
//       d = new Date(entries[i].DVDate);
//       t = 'Payment';
//     } else if (entries[i].CRNo) {
//       no = entries[i].CRNo;
//       d = new Date(entries[i].CRDate);
//       t = 'Receipt';
//     }
//     for(let j = 0; j < entries[i].ledgers.length; j++){
//       const r = new ReportingFlatLedgers({
//         entryId: entries[i]._id,
//         ledgerId: entries[i].ledgers[j]._id,
//         no: no,
//         entryType: t,
//         entryDate: d,
//         code: entries[i].ledgers[j].ledger.code,
//         name: entries[i].ledgers[j].ledger.name,
//         slCode: entries[i].ledgers[j].subledger.slCode,
//         subledger: entries[i].ledgers[j].subledger.name,
//         cr: entries[i].ledgers[j].cr,
//         dr: entries[i].ledgers[j].dr
//       });
//       await r.save();
//     }
//   }
//   console.log(entries.length);
// }

// // run
