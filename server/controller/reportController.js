const EntriesModel = require("../models/EntriesModel");
const Account = require("../models/AccountModel");
const ReportingFlatLedgers = require("../models/ReportingFlatLedgers");
const XLSX = require('xlsx');
// defines which accounts are displayed in straight schedule and trial balance
// this will be later refactored to be stored in database as a setup
const levels = [2, 3, 4, 5, 6, 7, 8, 9, 10]; // 2, 3, 4, 5... for ndc 0-100 to show all

// returns all entires from a book
async function getBook(
  entry = "",
  ledger = "",
  subledger = "",
  from = "",
  to = ""
) {
  try {
    const aggre = [];
    // If entry is empty, then return books from all entries (payment, receipt, journal)
    if (entry) {
      aggre.push({
        $match: {
          EntryType: entry,
        },
      });
    }
    const find = [];
    // If both ledger and subledger are given, return books where ledger and subledger match
    // If only ledger, then all books with this ledger
    // If only subledger, then all books with this subledger
    if (ledger) {
      find.push({ $eq: ["$$test.ledger.code", ledger] });
    }
    if (subledger) {
      find.push({ $eq: ["$$test.subledger.slCode", subledger] });
    }
    // Append to aggregation
    aggre.push({
      $project: {
        date: {
          $cond: {
            if: {
              $eq: [{ $type: "$JVDate" }, "string"],
            },
            then: {
              $dateFromString: {
                dateString: {
                  $ifNull: ["$JVDate", { $ifNull: ["$CRDate", "$DVDate"] }],
                },
                format: "%Y-%m-%d",
              },
            },
            else: {
              $ifNull: ["$JVDate", { $ifNull: ["$CRDate", "$DVDate"] }],
            },
          },
        },
        ledgers: {
          $filter: {
            input: "$ledgers",
            as: "test",
            cond: {
              $and: find,
            },
          },
        },
      },
    });
    // Filter out documents where 'ledgers' is empty
    aggre.push({
      $match: {
        ledgers: { $ne: [] },
      },
    });
    // Check if date range is given (inclusive)
    const daterange = {};
    if (!!from) {
      daterange.$gte = new Date(from);
    }
    if (!!to) {
      daterange.$lte = new Date(to);
    }
    if (!!from || !!to) {
      aggre.push({
        $match: {
          date: daterange,
        },
      });
    }
    // Run the aggregation
    const books = await EntriesModel.aggregate(aggre);
    return { books: books };
  } catch (error) {
    console.error(error);
    return { error: error };
  }
}

// retuns only summarized debit and credit of a book
// async function getBookSummary(
//   entry = "",
//   ledger = "",
//   subledger = "",
//   from = "",
//   to = ""
// ) {
//   try {
//     const aggre = [];
//     // If entry is empty, then return books from all entries (payment, receipt, journal)
//     if (entry) {
//       aggre.push({
//         $match: {
//           EntryType: entry,
//         },
//       });
//     }
//     const find = [];
//     // If both ledger and subledger are given, return books where ledger and subledger match
//     // If only ledger, then all books with this ledger
//     // If only subledger, then all books with this subledger
//     if (ledger) {
//       find.push({ $eq: ["$$test.ledger.code", ledger] });
//     }
//     if (subledger) {
//       find.push({ $eq: ["$$test.subledger.slCode", subledger] });
//     }
//     // Append to aggregation
//     aggre.push({
//       $project: {
//         date: {
//           $cond: {
//             if: {
//               $eq: [{ $type: "$JVDate" }, "string"],
//             },
//             then: {
//               $dateFromString: {
//                 dateString: {
//                   $ifNull: ["$JVDate", { $ifNull: ["$CRDate", "$DVDate"] }],
//                 },
//                 format: "%Y-%m-%d",
//               },
//             },
//             else: {
//               $ifNull: ["$JVDate", { $ifNull: ["$CRDate", "$DVDate"] }],
//             },
//           },
//         },
//         ledgers: {
//           $filter: {
//             input: "$ledgers",
//             as: "test",
//             cond: {
//               $and: find,
//             },
//           },
//         },
//       },
//     });
//     // Filter out documents where 'ledgers' is empty
//     aggre.push({
//       $match: {
//         ledgers: { $ne: [] },
//       },
//     });
//     // Check if date range is given (inclusive)
//     const daterange = {};
//     if (!!from) {
//       daterange.$gte = new Date(from);
//     }
//     if (!!to) {
//       daterange.$lte = new Date(to);
//     }
//     if (!!from || !!to) {
//       aggre.push({
//         $match: {
//           date: daterange,
//         },
//       });
//     }
//     aggre.push(
//       {
//         $unwind: {
//           path: "$ledgers",
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           credit: {
//             $sum: {
//               $ifNull: ["$ledgers.cr", 0],
//             },
//           },
//           debit: {
//             $sum: {
//               $ifNull: ["$ledgers.dr", 0],
//             },
//           },
//         },
//       }
//     );
//     // Run the aggregation
//     const books = await EntriesModel.aggregate(aggre);
//     return books[0] ? { credit: books[0].credit, debit: books[0].debit } : { credit: 0, debit: 0 };
//   } catch (error) {
//     console.error(error);
//     return { error: error };
//   }
// }

// get book transactions but summarized debit and credit per subledgers
async function getBookTransactionSummary(
  entry = "",
  ledger = "",
  subledger = "",
  from = "",
  to = ""
) {
  try {
    const aggre = [];
    // If entry is empty, then return books from all entries (payment, receipt, journal)
    if (entry) {
      aggre.push({
        $match: {
          EntryType: entry,
        },
      });
    }
    const find = [];
    // If both ledger and subledger are given, return books where ledger and subledger match
    // If only ledger, then all books with this ledger
    // If only subledger, then all books with this subledger
    if (ledger) {
      find.push({ $eq: ["$$test.ledger.code", ledger] });
    }
    if (subledger) {
      find.push({ $eq: ["$$test.subledger.slCode", subledger] });
    }
    // Append to aggregation
    aggre.push({
      $project: {
        date: {
          $cond: {
            if: {
              $eq: [{ $type: "$JVDate" }, "string"],
            },
            then: {
              $dateFromString: {
                dateString: {
                  $ifNull: ["$JVDate", { $ifNull: ["$CRDate", "$DVDate"] }],
                },
                format: "%Y-%m-%d",
              },
            },
            else: {
              $ifNull: ["$JVDate", { $ifNull: ["$CRDate", "$DVDate"] }],
            },
          },
        },
        ledgers: {
          $filter: {
            input: "$ledgers",
            as: "test",
            cond: {
              $and: find,
            },
          },
        },
      },
    });
    // Filter out documents where 'ledgers' is empty
    aggre.push({
      $match: {
        ledgers: { $ne: [] },
      },
    });
    // Check if date range is given (inclusive)
    const daterange = {};
    if (!!from) {
      daterange.$gte = new Date(from);
    }
    if (!!to) {
      daterange.$lte = new Date(to);
    }
    if (!!from || !!to) {
      aggre.push({
        $match: {
          date: daterange,
        },
      });
    }
    aggre.push({
      $unwind: "$ledgers",
    });
    aggre.push({
      $group: {
        _id: {
          subledgerName: "$ledgers.subledger.name",
          subledgerCode: "$ledgers.subledger.slCode",
        },
        dr: { $sum: "$ledgers.dr" },
        cr: { $sum: "$ledgers.cr" },
      },
    });
    aggre.push({
      $project: {
        subledger: "$_id.subledgerName",
        code: "$_id.subledgerCode",
        dr: "$dr",
        cr: "$cr",
        _id: 0,
      },
    });
    const books = await EntriesModel.aggregate(aggre);
    return books;
  } catch (error) {
    console.error(error);
  }
}

// OLD FUNCTION
// to be rafactored: this function should be the straight schedule report with modification to include subledgers
// async function getTrialBalance(req, res){
//     try{
//         const {date} = req.params;
//         // Get all root accounts
//         const accounts = await getAccountsTree(); // returns an array of trees as root nodes
//         const modified = []; // holds modified accounts tree (with transactions info)
//         // process each root nodes
//         for(let i = 0; i < accounts.length; i++){
//             // traverses entire tree executing a function that modifies each branch and retuns entire ree
//             const t = await traverseTreeBFS(accounts[i], async (a)=>{
//                 // !!!!!!!!!!! TODO:: TRANSACTIONS HERE DOES NOT INCLUDE LEDGER CHILD ACCOUNT
//                 // check if this ledger has child then get the book summary of those child to add to the parent account
//                 const transactions = await getBookSummary("", a.code, "", "", date);
//                 a.transactions = transactions;
//             });
//             modified.push(t);
//         }
//         res.json(modified)
//     }catch(error){
//         console.error(error);
//         res.status(500).json({ message: error.message });
//     }
// }


async function getTrialBalance(req, res) {
  try {
    const { startDate, endDate } = req.query;
    // const startDate = '2024-10-01';
    // const endDate = '2024-10-31';

    // console.log(startDate, endDate);

    const accounts = await getAccountsTree();

    const modifiedAccounts = await Promise.all(
      accounts.map(async (rootAccount) => {
        // Traverse the tree and fetch transactions in parallel
        await traverseTreeBFS(rootAccount, async (accountNode) => {
          // Fetch transactions for the current node
          const transactions = await getBookSummary(
            "",
            accountNode.code,
            "",
            startDate,
            endDate
          );
          accountNode.transactions = transactions;
        });
        return rootAccount;
      })
    );

    res.json(modifiedAccounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}

// AAAAAAAAAAA
function getFirstDayOfMonth(dateString) {
    // Parse the input string into a Date object
    const date = new Date(dateString);
    
    // Check if the input string is a valid date
    if (isNaN(date)) {
        throw new Error("Invalid date format. Please provide a date in 'YYYY-MM-DD' format.");
    }

    // Create a new date representing the first day of the month
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);

    // Format the date as YYYY-MM-DD
    const year = firstDay.getFullYear();
    const month = String(firstDay.getMonth() + 1).padStart(2, '0'); // Add leading zero if needed
    const day = String(firstDay.getDate()).padStart(2, '0'); // Always '01' here

    return `${year}-${month}-${day}`;
}

function getFirstAndLastDateOfMonth(date) {
    // Create a new Date object to avoid mutating the original date
    const inputDate = new Date(date);

    // Get the first day of the month
    const firstDate = new Date(inputDate.getFullYear(), inputDate.getMonth(), 1);

    // Get the last day of the month
    const lastDate = new Date(inputDate.getFullYear(), inputDate.getMonth() + 1, 0);

    // Format the dates as YYYY-MM-DD
    const formatDate = (date) => date.toISOString().split('T')[0];

    return [formatDate(firstDate), formatDate(lastDate)];
}

function getLastYearSameMonthDates(dateString) {

    // deduct 1 year to this date

    // Parse the input date to extract the year and month
    const [year, month] = dateString.split('-').map(Number);

    // Calculate the previous year
    const lastYear = year - 1;

    // First day of the same month in the previous year
    const firstDate = `${lastYear}-${String(month).padStart(2, '0')}-01`;

    // Last day of the same month in the previous year
    // Create a Date object for the first day of the next month, then subtract 1 day
    const lastDate = new Date(lastYear, month, 0);  // Corrected lastDate calculation

    // Format the lastDate as YYYY-MM-DD
    const formatDate = (date) => date.toISOString().split('T')[0];

    return [firstDate, formatDate(lastDate)];
}

function getFirstAndLastDateOfMonth(date) {
    // Create a new Date object for the given date
    const inputDate = new Date(date);

    // Get the first day of the month (same year and month, day = 1)
    const firstDate = new Date(inputDate.getFullYear(), inputDate.getMonth(), 1);

    // Get the last day of the month (by setting the day to 0 of the next month)
    const lastDate = new Date(inputDate.getFullYear(), inputDate.getMonth() + 1, 0);

    // Format the dates as YYYY-MM-DD (without UTC effect)
    const formatDate = (date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    return [formatDate(firstDate), formatDate(lastDate)];
}

async function getStraighSchedule(req, res){
    try{
        console.log('begin straight schedule report ', new Date().toLocaleTimeString());
        // get range of date passed as parameter
        const {start, end} = req.params;

        // beggining balance date is start date - 1 day
        const begbaldate = new Date(start);
        begbaldate.setDate(begbaldate.getDate() - 1);
        const sbegbaldate = begbaldate.toISOString().split('T')[0];

        const ebegbaldate = getFirstDayOfMonth(sbegbaldate);

        // also get last month report
        // const lastyear = getLastYearSameMonthDates(start);

        let ly = new Date(start);
        ly = new Date(ly.setFullYear(ly.getFullYear() - 1));
        // console.log(ly, getFirstAndLastDateOfMonth(ly));
        const lyd = getFirstAndLastDateOfMonth(ly);

        // console.log("beggining balance is up to ", sbegbaldate, ' get records from ', start, ' to ', end);

        // console.log(start, lastyear);

        // Get all root accounts
        const accounts = await getAccountsTree(); // returns an array of trees as root nodes
        const modified = []; // holds modified accounts tree (with transactions info)
        // process each root nodes
        for(let i = 0; i < accounts.length; i++){
            console.log("tree#", i, ' ', accounts[i].name)
            // traverses entire tree executing a function that modifies each branch and retuns entire ree
            const t = await traverseTreeBFS(accounts[i], async (a)=>{
                // get summarized transactions within the start and end date (inclusive)
                const transactions = await getBookTransactionSummary("", a.code, "", start, end);
                // get all summarized transactions before start date
                const begbal = await getBookTransactionSummary("", a.code, "", ebegbaldate, sbegbaldate);

                const prev = await getBookTransactionSummary("", a.code, "", lyd[0], lyd[1]);

                // align subledgers beggining balance and transaction in one row with ending balance
                const mergedTransac = mergeAndAlignBalances(begbal, transactions, prev);
                a.transactions = mergedTransac;
            });
            modified.push(t);
        }
        console.log('end straight schedule report ', new Date().toLocaleTimeString())
        res.send(modified);
    }catch(error){
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

// async function getStraighSchedule(req, res){
//     try{
//         // get range of date passed as parameter
//         const {start, end} = req.params;
//         // beggining balance date is start date - 1 day
//         const begbaldate = new Date(start);
//         begbaldate.setDate(begbaldate.getDate() - 1);
//         const sbegbaldate = begbaldate.toISOString().split('T')[0];
//         // Get all root accounts
//         const accounts = await getAccountsTree(); // returns an array of trees as root nodes
//         const modified = []; // holds modified accounts tree (with transactions info)

//         const test = [];

//         // process each root nodes
//         for(let i = 0; i < accounts.length; i++){
//             // traverses entire tree executing a function that modifies each branch and retuns entire ree

//             // console.log(accounts[i]);

//             const allacc = [];

//             const t = await traverseTreeBFS(accounts[i], (e)=>{
//                 allacc.push(e);
//                 // console.log(e);
//             });

//             console.log(allacc.length);
//             // parrallel process all

//             test.push(allacc);

//             // const t = await traverseTreeBFS(accounts[i], async (a)=>{
//             //     // get summarized transactions within the start and end date (inclusive)
//             //     const transactions = await getBookTransactionSummary("", a.code, "", start, end);
//             //     // get all summarized transactions before start date
//             //     const begbal = await getBookTransactionSummary("", a.code, "", "", sbegbaldate);
//             //     // align subledgers beggining balance and transaction in one row with ending balance
//             //     const mergedTransac = mergeAndAlignBalances(begbal, transactions);
//             //     a.transactions = mergedTransac;
//             // });
//             // modified.push(t);
//         }
//         res.send(test);
//         // res.send(modified);
//     }catch(error){
//         console.error(error);
//         res.status(500).json({ message: error.message });
//     }
// }

// async function getStraighSchedule(req, res) {
//     try {
//         // Get range of dates passed as parameters
//         const { start, end } = req.params;
//         // Beginning balance date is start date - 1 day
//         const begbaldate = new Date(start);
//         begbaldate.setDate(begbaldate.getDate() - 1);
//         const sbegbaldate = begbaldate.toISOString().split('T')[0];

//         // Get all root accounts
//         const accounts = await getAccountsTree(); // Returns an array of trees as root nodes
//         // console.log("Accounts fetched:", accounts);

//         // Process all accounts in parallel
//         const modified = await Promise.all(accounts.map(async (account) => {
//             // Fetch all transactions for the account in parallel
//             const transactionsPromise = await getBookTransactionSummary("", account.code, "", start, end);
//             const begbalPromise = await getBookTransactionSummary("", account.code, "", "", sbegbaldate);

//             // Wait for all transaction data to be fetched
//             const [transactions, begbal] = await Promise.all([transactionsPromise, begbalPromise]);

//             // Debugging the fetched data
//             // console.log(`Fetched transactions for account ${account.code}:`, transactions);
//             // console.log(`Fetched beginning balance for account ${account.code}:`, begbal);

//             // If no transactions or beginning balance were found, handle this scenario
//             if (!transactions || !begbal) {
//                 // console.error(`Missing data for account ${account.code}`);
//                 return account; // or some default value
//             }

//             // Align subledgers' beginning balance and transactions into one row with the ending balance
//             const mergedTransac = mergeAndAlignBalances(begbal, transactions);
//             account.transactions = mergedTransac;

//             // Traverse the tree (or modify it if needed) after data is fetched
//             const modifiedTree = await traverseTreeBFS(account, async (a) => {
//                 a.transactions = mergedTransac; // Modify the tree nodes with the transactions
//             });
//             return modifiedTree;
//         }));

//         console.log(modified)
//         res.send(modified);
//     } catch (error) {
//         console.error("Error in processing:", error);
//         res.status(500).json({ message: error.message });
//     }
// }

// format transactions for straigh schedule report
function mergeAndAlignBalances(begbal, transactions, prev) {
  const result = [];

  // Create a map for quick lookups for begbal and transactions
  const begbalMap = new Map();
  begbal.forEach((item) => {
    begbalMap.set(item.code, {
      subledger: item.subledger,
      code: item.code,
      begbal: item.dr - item.cr,
      dr: 0,
      cr: 0,
    });
  });

  const transactionMap = new Map();
  transactions.forEach((item) => {
    transactionMap.set(item.code, {
      subledger: item.subledger,
      code: item.code,
      dr: item.dr,
      cr: item.cr,
    });
  });

  const prevMap = new Map();
  prev.forEach((item) => {
    prevMap.set(item.code, {
        subledger: item.subledger,
        code: item.code,
        dr: item.dr,
        cr: item.cr,
    });
  });

  // Merge begbal and transactions data
  const allCodes = new Set([...begbalMap.keys(), ...transactionMap.keys()]);
  allCodes.forEach((code) => {
    const begbalEntry = begbalMap.get(code) || {
      begbal: 0,
      subledger: "",
      dr: 0,
      cr: 0,
    };
    const transactionEntry = transactionMap.get(code) || { dr: 0, cr: 0 };
    const prevEntry = prevMap.get(code) || {dr: 0, cr: 0};

    const mergedEntry = {
      subledger: begbalEntry.subledger || transactionEntry.subledger,
      code: code,
      begbal: begbalEntry.begbal,
      dr: transactionEntry.dr,
      cr: transactionEntry.cr,
      ending: begbalEntry.begbal + (transactionEntry.dr - transactionEntry.cr),
      prev: prevEntry.dr - prevEntry.cr
    };

    result.push(mergedEntry);
  });

  return result;
}

async function exportStraighSchedule(req, res) {
  try {
    console.log(req.body);

    const defaultBorder = { style: "thin", color: "000000" };
    const entrydata = req.body;
    // open excel template and append data
    const templatePath = path.join(
      __dirname,
      "../helper/",
      "straightscheduletemplate.xlsx"
    );

    res.json({ test: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// returns flat array of ledgers tree in proper order
function flattenTree(tree) {
  let result = [];
  result.push({ code: tree.code, name: tree.name });
  if (tree.branch && tree.branch.length > 0) {
    for (const branch of tree.branch) {
      result = result.concat(flattenTree(branch));
    }
  }
  return result;
}

// breadth-first traversal for ledgers tree (will return the same tree with any modification done by passed action)
// async function traverseTreeBFS(tree, action){
//     const queue = [tree];
//     while(queue.length > 0){
//         const node = queue.shift();
//         await action(node);
//         if(node.branch && node.branch.length > 0){
//             for(const branch of node.branch){
//                 queue.push(branch);
//             }
//         }
//     }
//     return tree;
// }

// with batch processing
async function traverseTreeBFS(tree, action) {
  const queue = [tree];
  const actions = []; // To store all action promises

  while (queue.length > 0) {
    const node = queue.shift();
    // Push the action for each node into the actions array
    actions.push(action(node));

        // Enqueue all branches for further processing
        if (node.branch && node.branch.length > 0) {
            for (const branch of node.branch) {
                // console.log(branch.name)
                queue.push(branch);
            }
        }
    }

    // Wait for all actions to be completed in parallel
    console.log("begining parralel processing for ", actions.length, ' items ', new Date().toLocaleTimeString());
    await Promise.all(actions);
    console.log("processed ", actions.length, ' items ', new Date().toLocaleTimeString());


  // Return the modified tree after all actions are applied
  return tree;
}

// get all accounts as tree (will return multiple trees)
async function getAccountsTree() {
  const rootAccounts = await Account.find(
    { archived: false, isSubAccount: false },
    { code: 1, name: 1 }
  )
    .sort({ code: 1 })
    .lean();
  // Fetch branches for each root account
  for (let i = 0; i < rootAccounts.length; i++) {
    rootAccounts[i].branch = await fetchBranches(rootAccounts[i].code);
  }
  return rootAccounts;
}

// used to recursively get all branches of a parent account
async function fetchBranches(parentCode) {
  // Find immediate branches of the parent account
  const branches = await Account.find(
    { archived: false, parentAccount: parentCode },
    { code: 1, name: 1 }
  )
    .sort({ code: 1 })
    .lean();
  // For each branch, fetch its sub-branches recursively
  for (let i = 0; i < branches.length; i++) {
    branches[i].branch = await fetchBranches(branches[i].code);
  }
  return branches;
}

// !!!!!!!!!!!!!!!!!!!!!!!! REFACTORED OPTIMIZED new functions !!!!!!!!!!!!!!!!!!!!!!!!!!!
// need further testing before deleting functions above

async function getAllAccountsWithTotalTransactions(start, end) {
  if (!start || !end || isNaN(new Date(start)) || isNaN(new Date(end))) {
      throw new Error('Invalid date range');
  }

  try {
      const result = await Account.aggregate([
          {
              '$lookup': {
                  'from': 'reportingflatledgers',
                  'localField': 'code',
                  'foreignField': 'code',
                  'as': 'entries',
                  'pipeline': [
                      {
                          '$match': {
                              '$expr': {
                                  '$and': [
                                      { '$gte': ['$entryDate', new Date(start)] },
                                      { '$lte': ['$entryDate', new Date(end)] }
                                  ]
                              }
                          }
                      }
                  ]
              }
          },
          {
              '$project': {
                  'code': 1,
                  'name': 1,
                  'parentAccount': 1,
                  'entries': 1
              }
          },
          {
              '$unwind': {
                  'path': '$entries',
                  'preserveNullAndEmptyArrays': true
              }
          },
          {
              '$group': {
                  '_id': '$_id',
                  'code': { '$first': '$code' },
                  'name': { '$first': '$name' },
                  'parentAccount': { '$first': '$parentAccount' },
                  'totalDr': { '$sum': '$entries.dr' },
                  'totalCr': { '$sum': '$entries.cr' }
              }
          }
      ]);

      return result;
  } catch (error) {
      console.error('Error fetching accounts with total transactions:', error);
      throw new Error('Failed to fetch accounts with total transactions');
  }
}

// last stable function !DO NOT DELETE
// // all grouped subledger transactions per account filtered by date
// async function getAllAccountsWithGroupedSubledgersTransaction(start, end){
//   console.log("transactions for ", new Date(start), " - ", new Date(end));
//     const result = await Account.aggregate([
//         {
//             '$lookup': {
//               'from': 'reportingflatledgers',
//               'localField': 'code',
//               'foreignField': 'code',
//               'as': 'entries',
//               'pipeline': [
//                 {
//                   '$match': {
//                     '$expr': {
//                       '$and': [
//                         {
//                           '$gte': ['$entryDate', new Date(start)]
//                         },
//                         {
//                           '$lte': ['$entryDate', new Date(end)]
//                         }
//                       ]
//                     }
//                   }
//                 }
//               ]
//             }
//           },
//           {
//             '$project': {
//               'code': 1,
//               'name': 1,
//               'parentAccount': 1,
//               'entries': 1  // Keep the entries field, even if it's empty
//             }
//           },
//           {
//             '$unwind': {
//               'path': '$entries',
//               'preserveNullAndEmptyArrays': true // Ensure that we preserve the document even if entries is empty
//             }
//           },
//           {
//             '$group': {
//               '_id': {
//                 'accountId': '$_id',
//                 'slCode': '$entries.slCode'
//               },
//               'code': {
//                 '$first': '$code'
//               },
//               'parentAccount': {
//                 '$first': '$parentAccount'
//               },
//               'totalDr': {
//                 '$sum': '$entries.dr'
//               },
//               'totalCr': {
//                 '$sum': '$entries.cr'
//               },
//               'name': {
//                 '$first': '$name'
//               },
//               'subledger': {
//                 '$first': '$entries.subledger'
//               }
//             }
//           },
//           {
//             '$group': {
//               '_id': '$_id.accountId',
//               'code': {
//                 '$first': '$code'
//               },
//               'name': {
//                 '$first': '$name'
//               },
//               'parentAccount': {
//                 '$first': '$parentAccount'
//               },
//               'entries': {
//                 '$push': {
//                   'slCode': '$_id.slCode',
//                   'subledger': '$subledger',
//                   'dr': '$totalDr',
//                   'cr': '$totalCr'
//                 }
//               }
//             }
//         }    
//     ]);
//     return result;
// }

// async function fullStraightSchedule(req, res) {
//   const { ranges } = req.body;  // Array of date ranges
//   // Create an array of promises to fetch data for each date range
//   const promises = ranges.map(range => getAllAccountsWithGroupedSubledgersTransaction(range[0], range[1])
//     .then(result => {
//       // minor issue! mongodb aggregation results to all accounts which has no transaction found have 1 item on entry with null subledger
//       // this is filtered in here, may add a second to server load
//       result.forEach(m => {
//         if(!m.entries[0]?.subledger){
//           m.entries = [];
//         }
//       });
//       return result;
//     })
//   );
//   try {
//     // Wait for all promises to resolve in parallel
//     console.log("branch data fetch for 3 reports ", new Date().toLocaleTimeString());
//     const results = await Promise.all(promises);
//     console.log("data fetched ", new Date().toLocaleTimeString());
//     // seperate results
//     const prevM = results[0];
//     const cur = results[1];
//     const prevY = results[2];
//     // build main array
//     console.log("begin arranging data ", new Date().toLocaleTimeString());
//     let trueArray = prevM.map(m=>({
//       _id: m._id,
//       code: m.code,
//       name: m.name,
//       parentAccount: m.parentAccount,
//       previous: m.entries
//     }));
//     // append entries
//     console.log("appending entries ", new Date().toLocaleTimeString());
//     for(let i = 0; i < cur.length; i++){
//       const item = trueArray.find(f=>f.code === cur[i].code);
//       if(item){
//         item.current = cur[i].entries;
//       }
//     }
//     for(let i = 0; i < prevY.length; i++){
//       const item = trueArray.find(f=>f.code === prevY[i].code);
//       if(item){
//         item.lastYear = prevY[i].entries;
//       }
//     }
//     // flatten entries into transactions
//     console.log("combining 3 entry reports ", new Date().toLocaleTimeString());
//     let withTransactions = lineUpTransactionsForAccounts(trueArray);
//     // reprocess transactions into formatted rows
//     console.log("formatting transactions ", new Date().toLocaleTimeString());
//     // each account
//     for(let i = 0; i < withTransactions.length; i++){
//       // each transaction
//       for(let j = 0; j < withTransactions[i].transactions.length; j++){
//         // each transaction is array of 3 objects
//         const pre = withTransactions[i].transactions[j][0];
//         const now = withTransactions[i].transactions[j][1];
//         const ly = withTransactions[i].transactions[j][2];
//         let slCode = '';
//         let subledger = '';
//         // find name and slCode
//         if(!isEmptyObject(pre)){
//           slCode = pre.slCode;
//           subledger = pre.subledger;
//         }else if(!isEmptyObject(now)){
//           slCode = now.slCode;
//           subledger = now.subledger;
//         }else if(!isEmptyObject(ly)){
//           slCode = ly.slCode;
//           subledger = ly.subledger;
//         }
//         withTransactions[i].transactions[j] = {
//           slCode: slCode,
//           subledger: subledger,
//           lastMonth: isEmptyObject(pre) ? 0 : pre.dr - pre.cr,
//           debit: isEmptyObject(now) ? 0 : now.dr,
//           credit: isEmptyObject(now) ? 0 : now.cr,
//           asOf: (isEmptyObject(pre) ? 0 : pre.dr - pre.cr) + (isEmptyObject(now) ? 0 : now.dr - now.cr),
//           lastYear: isEmptyObject(ly) ? 0 : ly.dr - ly.cr
//         };
//       }
//     }
//     // make it a tree to see layout of totals per level
//     console.log("building trees ", new Date().toLocaleTimeString());
//     withTransactions = buildAccountTree(withTransactions);
//     // calculate totals
//     console.log("calculating totals per node ", new Date().toLocaleTimeString());
//     withTransactions = updateTreeWithTotals(withTransactions);
//     // flatten tree
//     console.log("flatten tree ", new Date().toLocaleTimeString());
//     withTransactions = flattenAccountTree(withTransactions);
//     // console.log(withTransactions.length, " flat");
//     console.log("done! ", new Date().toLocaleTimeString());
//     return res.json(withTransactions);
//   } catch (error) {
//     // Handle any errors that occur during the parallel fetch
//     console.error('Error fetching data:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// }

// from chatgpt (same commented function above but with mapping on filters, merge, and append)
async function getAllAccountsWithGroupedSubledgersTransaction(start, end) {
  console.log("Fetching transactions for:", new Date(start), "-", new Date(end));

  return await Account.aggregate([
    {
      $lookup: {
        from: "reportingflatledgers",
        localField: "code",
        foreignField: "code",
        as: "entries",
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $gte: ["$entryDate", new Date(start)] },
                  { $lte: ["$entryDate", new Date(end)] }
                ]
              }
            }
          }
        ]
      }
    },
    {
      $unwind: {
        path: "$entries",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $group: {
        _id: { accountId: "$_id", slCode: "$entries.slCode" },
        code: { $first: "$code" },
        parentAccount: { $first: "$parentAccount" },
        totalDr: { $sum: "$entries.dr" },
        totalCr: { $sum: "$entries.cr" },
        name: { $first: "$name" },
        subledger: { $first: "$entries.subledger" }
      }
    },
    {
      $group: {
        _id: "$_id.accountId",
        code: { $first: "$code" },
        name: { $first: "$name" },
        parentAccount: { $first: "$parentAccount" },
        entries: {
          $push: {
            slCode: "$_id.slCode",
            subledger: "$subledger",
            dr: "$totalDr",
            cr: "$totalCr"
          }
        }
      }
    }
  ]);
}

async function fullStraightSchedule(req, res) {
  const { ranges } = req.body;

  try {
    console.log("Fetching data for reports at:", new Date().toLocaleTimeString());

    const results = await Promise.all(
      ranges.map(async ([start, end]) => {
        const result = await getAllAccountsWithGroupedSubledgersTransaction(start, end);
        // Filter out empty entries
        return result.map(account => ({
          ...account,
          entries: account.entries.filter(e => e.subledger)
        }));
      })
    );

    console.log("Data fetched. Processing entries:", new Date().toLocaleTimeString());

    // Destructure the results
    const [prevM, cur, prevY] = results;

    // Merge data
    const accountsMap = new Map();

    for (const group of [prevM, cur, prevY]) {
      for (const account of group) {
        if (!accountsMap.has(account.code)) {
          accountsMap.set(account.code, {
            ...account,
            previous: [],
            current: [],
            lastYear: []
          });
        }
        const target = accountsMap.get(account.code);
        if (group === prevM) target.previous = account.entries;
        if (group === cur) target.current = account.entries;
        if (group === prevY) target.lastYear = account.entries;
      }
    }

    const mergedAccounts = Array.from(accountsMap.values());

    console.log("Combining transactions:", new Date().toLocaleTimeString());

    const withTransactions = lineUpTransactionsForAccounts(mergedAccounts);

    console.log("Formatting transactions:", new Date().toLocaleTimeString());

    for (const account of withTransactions) {
      account.transactions = account.transactions.map(([pre, now, ly]) => {
        const slCode = pre?.slCode || now?.slCode || ly?.slCode || "";
        const subledger = pre?.subledger || now?.subledger || ly?.subledger || "";
        return {
          slCode,
          subledger,
          lastMonth: (pre?.dr || 0) - (pre?.cr || 0),
          debit: now?.dr || 0,
          credit: now?.cr || 0,
          asOf: ((pre?.dr || 0) - (pre?.cr || 0)) + ((now?.dr || 0) - (now?.cr || 0)),
          lastYear: (ly?.dr || 0) - (ly?.cr || 0)
        };
      });
    }

    console.log("Building tree structure:", new Date().toLocaleTimeString());

    const tree = buildAccountTree(withTransactions);

    console.log("Calculating totals and flattening tree:", new Date().toLocaleTimeString());

    const flatTree = flattenAccountTree(updateTreeWithTotals(tree));

    console.log("Processing complete:", new Date().toLocaleTimeString());

    return res.json(flatTree);
  } catch (error) {
    console.error("Error processing schedule:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}


// special function for debugging this will find missing nodes
// function findMissingNodes(originalAccounts, flattenedTree) {
//   const originalSet = new Set(originalAccounts.map(acc => acc.code));
//   const flattenedSet = new Set(flattenedTree.map(node => node.code));
//   const missingNodes = Array.from(originalSet).filter(code => !flattenedSet.has(code));
//   console.log("Missing nodes:", missingNodes);
//   return missingNodes;
// }
// function isEmptyObject(obj) {
//   return Object.keys(obj).length === 0 && obj.constructor === Object;
// }

function updateTreeWithTotals(tree) { 
  // Recursive function to calculate the total for each node and its branches
  function calculateTotalTransactions(node) {
    // Initialize the total values
    let total = {
      lastMonth: 0,
      debit: 0,
      credit: 0,
      asOf: 0,
      lastYear: 0
    };
    // Sum the transactions for the current node
    if (node.transactions) {
      node.transactions.forEach(transaction => {
        total.lastMonth += transaction.lastMonth || 0;
        total.debit += transaction.debit || 0;
        total.credit += transaction.credit || 0;
        total.asOf += transaction.asOf || 0;
        total.lastYear += transaction.lastYear || 0;
      });
    }
    // Recursively sum the totals from the branches
    if (node.branches) {
      node.branches.forEach(branch => {
        const branchTotal = calculateTotalTransactions(branch);
        total.lastMonth += branchTotal.lastMonth;
        total.debit += branchTotal.debit;
        total.credit += branchTotal.credit;
        total.asOf += branchTotal.asOf;
        total.lastYear += branchTotal.lastYear;
      });
    }
    // Assign the calculated totals back to the node
    node.total = total;
    return total;
  }
  // Traverse and calculate totals for each node in the tree
  tree.forEach(rootNode => {
      calculateTotalTransactions(rootNode);
  });
  return tree;
}

// FOR STRAIGHT SCHEDULE
function lineUpTransactionsForAccounts(accounts) {
  return accounts.map(account => {
    // Extract the arrays for the current account
    const array1 = account.previous || [];
    const array2 = account.current || [];
    const array3 = account.lastYear || [];
    // Collect all unique slCodes across the three arrays
    const allSlCodes = Array.from(
      new Set([...array1, ...array2, ...array3].map(item => item.slCode))
    );
    // Line up the transactions per slCode
    const transactions = allSlCodes.map(slCode => [
      array1.find(item => item.slCode === slCode) || {}, // Find in previous (array1), or empty object
      array2.find(item => item.slCode === slCode) || {}, // Find in current (array2), or empty object
      array3.find(item => item.slCode === slCode) || {}  // Find in last year (array3), or empty object
    ]);
    // Return the updated account object with only transactions
    return {
      _id: account._id,
      code: account.code,
      name: account.name,
      parentAccount: account.parentAccount,
      transactions: transactions,
      level: account.level
    };
  });
}

// this is experimental function that structures trial balance based on given excel file instead of hierarchy in tree
async function fixedTrialBalance(req, res){
  const {start, end} = req.params;
  const s = new Date(start);
  const e = new Date(end);
  const structure = [
    "10101010",
    "10101020",
    "10103030",
    "10103030",
    "10105020",
    "10105030",
    "10206010",
    "10206011",
    "10210111A",
    "10206014",
    "10210010",
    "10210011",
    "10210111B",
    "10210111D",
    "10210111C",
    "10299990A",
    "10299011",
    "10301010C",
    "10301010D",
    "10301010E",
    "10301011",
    "10301050A",
    "10301050B",
    "10301050B",
    "10301051",
    "10301051",
    "10301070A",
    "10301990A",
    "10301071A",
    "10301071B",
    "10301990C",
    "10301990B",
    "10301990C",
    "10301990F",
    "10301990D",
    "10301011B",
    "10301070B",
    "10301071B",
    "10301010B",
    "10301011D",
    "10303060A",
    "10303060B",
    "10303010A",
    "10303010B",
    "10404010",
    "10404020",
    "10501020",
    "10501020",
    "10501010",
    "10602990",
    "10602991",
    "10604010",
    "10604011",
    "10604990",
    "10604991",
    "19999020",
    "10604991",
    "10605020",
    "10605021",
    "10605030",
    "10605031",
    "10605130",
    "10605131",
    "10606010",
    "10606011",
    "10607010",
    "10607011",
    "10609020",
    "10609021",
    "10609990",
    "10609991",
    "10698990",
    "10698991",
    "10599010",
    "10801020",
    "19999991",
    "19901040",
    "19902010",
    "19902010",
    "19902050",
    "19902060",
    "19902070",
    "19902080",
    "19902990",
    "19903020",
    "19903990",
    "19999990A",
    "19999990B",
    "19999990C",
    "19999990D",
    "19999991",
    "29999990A",
    "29999990B",
    "20101020",
    "20201030",
    "20201030",
    "20101050",
    "20102040",
    "202010101",
    "202010104",
    "202010101",
    "202010103",
    "20201020",
    "20201030",
    "20201040",
    "5053",
    "20201120",
    "20201130",
    "20401010A",
    "20401010B",
    "20401040A",
    "20401040",
    "20502010",
    "20601020",
    "20601990",
    "20901010A",
    "30101020",
    "30701010",
    "31001010",
    "40202050",
    "40202200A",
    "40202200B",
    "40202210A",
    "40202210B",
    "40202210C",
    "40202210D",
    "40202220",
    "40202280",
    "40202340",
    "40501010",
    "40501020",
    "40501040",
    "40501160",
    "40501050",
    "40602010",
    "40603990",
    "50101010",
    "50102010",
    "50102020",
    "50102030",
    "50102040",
    "50102080",
    "50102110",
    "50102120",
    "50102130",
    "50102140",
    "50102150",
    "50102990",
    "50103010",
    "50103020",
    "50103030",
    "50103040",
    "50104030",
    "50104990",
    "50201010",
    "50201020",
    "50202010",
    "50203010",
    "50203020",
    "50203090",
    "50203990",
    "50204010",
    "50204020",
    "50205010",
    "50205020",
    "50205030",
    "50210030A",
    "50210030",
    "50210030B",
    "50210030D",
    "50211010",
    "50211020",
    "50211030",
    "50211990",
    "50212010",
    "50212030",
    "50212020",
    "50212990A",
    "50212990B",
    "50213010",
    "50213040",
    "50213050",
    "50213060",
    "50213060",
    "50213070",
    "50213990",
    "50215010D",
    "50215040",
    "50215040",
    "50215010E",
    "50215010F",
    "50215010A",
    "50215010B",
    "50215010C",
    "50215020",
    "50215030",
    "50215030B",
    "50299010",
    "50299020",
    "50299040",
    "50299050A",
    "50299050",
    "50299060",
    "50299070",
    "50299990",
    "50299140",
    "50299090",
    "50299180",
    "50301020",
    "50301040",
    "50501020",
    "50501040",
    "50501050",
    "50501060",
    "50501070",
    "50501990",
    "50503020",
    "50503060",
    "50503150",
    "50504010",
    "50504030"
  ];
  let tdr = 0, tcr = 0;
  const rows = [];
  for(let i = 0; i < structure.length; i++){
    const aggr = [
      {
        '$match': {
          'code': structure[i],
          'entryDate': {
            '$gte': s,
            '$lte': e
          }
        }
      },
      {
        '$group': {
          '_id': { code: '$code', name: '$name' },
          dr: { '$sum': '$dr' },
          cr: { '$sum': '$cr' }
        }
      },
      {
        '$project': {
          _id: 0,
          code: '$_id.code',
          name: '$_id.name',
          totalDr: '$dr',
          totalCr: '$cr'
        }
      }
    ];
    const balance = await ReportingFlatLedgers.aggregate(aggr);
    if(balance.length > 0){
      rows.push(balance[0]);
      tdr += balance[0].totalDr;
      tcr += balance[0].totalCr;
    }else{
      const acc = await Account.findOne({code: structure[i]});
      rows.push({
        code: structure[i],
        name: acc.name,
        totalDr: 0,
        totalCr: 0
      });
    }
  }
  // calculate total
  // const totalDr = rows.map(m=>+m.totalDr).reduce((pre,cur)=>pre+cur,0);
  // const totalCr = rows.map(m=>+m.totalCr).reduce((pre,cur)=>pre+cur,0);
  rows.push({
    code: "",
    name: "TOTAL",
    totalDr: tdr,
    totalCr: tcr
  });
  res.json(rows);
}

async function fullTrialBalance(req, res){
  const {start, end} = req.params;
  const response = await getAllAccountsWithTotalTransactions(start, end);
  // builds tree of accounts then flatten it to reveal proper hierarchy
  const tree = buildAccountTree(response);
  let flatTree = flattenAccountTree(tree);
  const totalDebit = flatTree.map(m=>m.totalDr).reduce((pre,cur)=>pre+cur,0);
  const totalCredit = flatTree.map(m=>m.totalCr).reduce((pre,cur)=>pre+cur,0);
  // console.log(flatTree)
  // some levels removed
  flatTree = flatTree.filter(f=>f.level >= 2);
  // add total in end of array
  flatTree.push({
    _id: "",
    code: "",
    name: "TOTAL",
    parentAccount: "",
    totalDr: totalDebit,
    totalCr: totalCredit,
    level: 0
  })
  return res.json(flatTree);
}

async function fetchTree(req, res) {
  res.json(await accountsTree())
}

function buildAccountTree(accounts) {
  // Helper function to build the tree recursively and add levels
  function buildNodeTree(account, parentLevel = 0) {
    // Create the node with the level
    const node = {
      ...account,
      level: parentLevel, // Set the level for the current node
      branches: [] // Initialize the branches
    };
    // If the account has subaccounts (children), process them
    const children = accounts.filter(a => a.parentAccount === account.code);
    children.forEach(child => {
      const branchNode = buildNodeTree(child, parentLevel + 1);
      node.branches.push(branchNode); // Add the child as a branch
    });
    return node;
  }
  // Start with all the root nodes (those without a parent)
  const rootNodes = accounts.filter(account => !account.parentAccount);
  // Build the tree for each root node
  const tree = rootNodes.map(root => buildNodeTree(root));
  return tree;
}

function flattenAccountTree(tree) {
  const result = [];
  function traverse(node, level = 0) {
    // Add the current node to the result, excluding the branches field
    const { branches, ...rest } = node;
    result.push({ ...rest, level });
    // Recursively process each branch, sorted by code
    branches.sort((a, b) => a.code.localeCompare(b.code)).forEach(branch => traverse(branch, level + 1));
  }
  // Sort root nodes by code and traverse them
  tree.sort((a, b) => a.code.localeCompare(b.code)).forEach(root => traverse(root));
  return result;
}

// another refactor !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// filter level of account hierarchy to show
async function trialBalance(req, res){
  const {start, end} = req.params;
  console.log(end);
  // build and flatten account trees with level indicator
  const tree = await accountsTree();
  const newTree = await traverseAndUpdateTreeAsync(
    tree,
    async (node)=>{
      // console.log(node.code, start, end)
      const total = await getAccountTotalDRCR(node.code, null, end);
      const typ = node.code.charAt(0);
      if(total.length > 0){
      // //   console.log(typ);
        if(['1', '5'].includes(typ)){
          // node.totalCr = 0;
          node.totalDr = total[0].totalDr - total[0].totalCr;
          node.totalCr = 0;
          // if dr is negative move it to cr
          if(node.totalDr < 0){
            node.totalCr = Math.abs(node.totalDr);
            node.totalDr = 0;
          }
        }else if(['2', '3', '4'].includes(typ)){
          // node.totalDr = 0;
          // console.log(Math.abs(total[0].totalDr - total[0].totalCr));
          node.totalCr = Math.abs(total[0].totalDr - total[0].totalCr);
          node.totalDr = 0;
          // this will produce accurate result
          if(node.code === "202010103"){
            node.totalDr = node.totalCr;
            node.totalCr = 0;
          }
        }
        // not this
        // node.totalDr = total[0].totalDr;
        // node.totalCr = total[0].totalCr;
      }else{
        node.totalDr = 0;
        node.totalCr = 0;
      }
      return node;
    },
  );
  const flatTree = toFlatTree(newTree);
  const filtered = flatTree
  .filter(f => levels.includes(f.level) || (f.totalDr != 0 || f.totalCr != 0))
  .map(m=>({
    code: m.code,
    name: m.name,
    totalDr: parseFloat(m.totalDr.toFixed(2)),
    totalCr: parseFloat(m.totalCr.toFixed(2)),
    level: m.level
  }));
  const totalDr = filtered.map(m=>m.totalDr ? m.totalDr : 0).reduce((pre,cur)=>pre+cur,0);
  const totalCr = filtered.map(m=>m.totalCr ? m.totalCr : 0).reduce((pre,cur)=>pre+cur,0);
  // const totalDr = filtered.reduce((pre, cur) => pre + (typeof cur.totalDr === 'number' ? cur.totalDr : 0), 0);
  // const totalCr = filtered.reduce((pre, cur) => pre + (typeof cur.totalCr === 'number' ? cur.totalCr : 0), 0);

  // console.log(totalDr, totalCr);
  // const test = filtered.map(m=>m.totalDr);
  // console.log(test.length);
  // for(let i = 0; i < test.length; i++){
  //   console.log(test[i])
  // }
  // console.log(filtered.map(m=>m.totalDr))
  filtered.push({
    code: "",
    name: "TOTAL",
    totalDr: parseFloat(totalDr.toFixed(2)),
    totalCr: parseFloat(totalCr.toFixed(2)),
    level: 1
  })
  res.json(filtered);
}

async function straightschedule(req, res) {
  // const { start, end } = req.params;
  const { ranges } = req.body;

  // ???
  // const upto = new Date(new Date(start).setDate(new Date(start).getDate() - 1)).toISOString().split("T")[0];
  const currentDate = new Date(ranges[0][0]); // Current date
  const newDate = new Date(currentDate); // Create a copy to modify
  newDate.setMonth(currentDate.getMonth() - 1); // Subtract 1 month
  // Format the new date as 'YYYY-MM-DD'
  const formattedDate = newDate.toISOString().split('T')[0];
  // ???

  // will follow accounts tree original hierarchy with most parent account hidden
  let tree = await accountsTree();
  
  // Traverse tree and get data concurrently for each node
  const newTree = await traverseAndUpdateTreeAsync(
    tree,
    async (node) => {
      // Run both requests concurrently
      // const [asof, current] = await Promise.all([
        // change this to get the last month ending balance

        /**
         * code breaking changes here:
         * 
         * data looks like this
         *   ranges: [
         *     [prevM.firstDay, prevM.lastDay],
         *     [cur.firstDay, cur.lastDay],
         *     [prevY.firstDay, prevY.lastDay]  // not really used here
         *   ]
         */

      const asof = await getAccountGroupedTransactions(node.code, ranges[0][0], ranges[0][1]);
      const current = await getAccountGroupedTransactions(node.code, ranges[1][0], ranges[1][1]);
      const compare = await getAccountGroupedTransactions(node.code, ranges[2][0], ranges[2][1]);
      // ]);
      const transactions = [];
      
      // Create a map from the asof array for quick lookup by slCode
      const asofMap = asof.reduce((acc, entry) => {
        acc[entry.slCode] = entry;
        return acc;
      }, {});
      const compareMap = compare.reduce((acc, entry)=>{
        acc[entry.slCode] = entry;
        return acc;
      }, {});
      const typ = node.code.charAt(0);


      

      // Add all current entries and merge with asof if it exists
      current.forEach(currentEntry => {
        // bug when current sl code is not found in asof map showing negative asof values
        const asofEntry = asofMap[currentEntry.slCode];

        let comp = 0;
        const compareEntry = compareMap[currentEntry.slCode];
        
        if (compareEntry) {
          if (["1", "5"].includes(typ)) {
            comp = (compareEntry.totalDr ?? 0) - (compareEntry.totalCr ?? 0);
          } else if (["2", "3", "4"].includes(typ)) {
            comp = (compareEntry.totalCr ?? 0) - (asofEntry?.totalDr ?? 0); // Added safe check for asofEntry
            const discrepancy = ["202010104", "20601020"];
            if (discrepancy.includes(node.code)) {
              comp = compareEntry.totalDr = compareEntry.totalCr; // Possible mistake here?
            }
          }
        }
        
 
        // const lastYEntry = asofMap[currentEntry.slCode];
        // if(!asofEntry){
        //   console.log(currentEntry.slCode);
        // }
        /**
         * findings on report mismatch
         * 202010104: 
         *  tweak on values on begining balance to make it negative
         *  has to set special condition in here to reverse the calculation despite account code
         * 20601020:
         *  tweak on values on september import to produce same result for october report
         * 
         */
        
        
        if (asofEntry) {
          // If asof entry exists, calculate values
        
          let asOf = 0;
          if(['1', '5'].includes(typ)){
            asOf = asofEntry.totalDr - asofEntry.totalCr;

            // if(node.code === "202010104"){
            //   asOf = asofEntry.totalCr - asofEntry.totalDr;
            // }
      
          }else if(['2', '3', '4'].includes(typ)){

            asOf = asofEntry.totalCr - asofEntry.totalDr;
       

            /**
             * 40602010 REVERSAL OF IMPAIRMENT LOSS
             * 202010104 WITHHOLDING TAX ON GMP - VALUE ADDED TAXES (GVAT)
             * 20601020
             * unsolved discrepancy: result for this specific account doesnt match the report given
             * workaround: flip computation order, seems like begining balance in this part is flipped
             * from dr-cr to cr-dr and does not follow the rule where accounts starting with 4 and 2 should be credits
             * the issue is since we don't have dr and cr values from begining balance (august) the august
             * straight schedule report will appear invalid on these discrepancy account
             */
       
            const discrepancy = ["202010104", "20601020"];
            if(discrepancy.includes(node.code)){
              asOf = asofEntry.totalDr - asofEntry.totalCr;
            }

          }
          // const asOf = asofEntry.totalDr - asofEntry.totalCr;
          // const asOf = asofEntry.totalDr;
          const currentDr = currentEntry.totalDr;
          const currentCr = currentEntry.totalCr;
          // console.log(node.code);
          let endingBalance = 0;
          // console.log(typ);
          if(['1', '5'].includes(typ)){
            endingBalance = asOf + (currentDr - currentCr);
           
          }else if(['2', '3', '4'].includes(typ)){
            endingBalance = asOf + (currentCr - currentDr);
            // const discrepancy = ["202010104", "20601020", "40602010"];
            // if(discrepancy.includes(node.code)){
            //   // console.log("reverse ending balance here", node.code);
            //   // asOf = asofEntry.totalDr - asofEntry.totalCr;
            //   endingBalance = asOf + (currentDr - currentCr);
            // }
          }
        
          // const endingBalance = asOf + currentDr - currentCr;
          transactions.push({
            _id: currentEntry.slCode,
            asOf: asOf,
            currentDr: currentDr,
            currentCr: currentCr,
            endingBalance: endingBalance,
            compareBalance: comp,
            prevY: '',
            name: currentEntry.name,
            slCode: currentEntry.slCode
          });
        } else {
          // If no asof entry, use zero for asof fields
          const currentDr = currentEntry.totalDr;
          const currentCr = currentEntry.totalCr;

          let endingBalance = 0;
          // console.log(typ);
          if(['1', '5'].includes(typ)){
            endingBalance = currentDr - currentCr;
          }else if(['2', '3', '4'].includes(typ)){
            endingBalance = currentCr - currentDr;
          }
          transactions.push({
            _id: currentEntry.slCode,
            asOf: 0,
            currentDr: currentDr,
            currentCr: currentCr,
            endingBalance: endingBalance,
            compareBalance: comp,
            name: currentEntry.name,
            slCode: currentEntry.slCode
          });
        }

      });

      // Add asof entries that don't exist in current
      asof.forEach(asofEntry => {
        const currentEntry = current.find(entry => entry.slCode === asofEntry.slCode);
        let comp = 0;
   
        if (!currentEntry) {

          const compareEntry = compareMap[asofEntry.slCode];
          let asOf =  0;

          if(['1', '5'].includes(typ)){
            asOf =  asofEntry.totalDr - asofEntry.totalCr;
            if(compareEntry) comp = compareEntry.totalDr - compareEntry.totalCr;
          }else if(['2', '3', '4'].includes(typ)){
            asOf =  asofEntry.totalCr - asofEntry.totalDr;
            if(compareEntry) comp = compareEntry.totalCr - asofEntry.totalDr;
          }

          transactions.push({
            _id: asofEntry.slCode,
            asOf: asOf,
            currentDr: 0,
            currentCr: 0,
            endingBalance: asOf,
            compareBalance: comp,
            name: asofEntry.name,
            slCode: asofEntry.slCode,
            glCode: node.code
          });
        }
      });

      if(transactions.length > 0){
        const tas = transactions.map(m=>m.asOf).reduce((pre,cur)=>pre+cur,0);
        const tdr = transactions.map(m=>m.currentDr).reduce((pre,cur)=>pre+cur,0);
        const tcr = transactions.map(m=>m.currentCr).reduce((pre,cur)=>pre+cur,0);
        const teb = transactions.map(m=>m.endingBalance).reduce((pre,cur)=>pre+cur,0);
        const tcp = transactions.map(m=>m.compareBalance).reduce((pre,cur)=>pre+cur,0);
        transactions.sort((a, b) => {
          // Compare the 'slCode' field lexicographically (alphabetically)
          if (a.slCode < b.slCode) return -1;
          if (a.slCode > b.slCode) return 1;
          return 0; // If slCode values are equal
        });
        transactions.push({
          _id: "",
          asOf: tas,
          currentDr: tdr,
          currentCr: tcr,
          endingBalance: teb,
          compareBalance: tcp,
          name: "TOTAL",
          slCode: "",
        });
      }
      node.transactions = transactions; // Attach transactions to node
      return node;
    }
  );
  let flatTree = toFlatTree(newTree); 
  flatTree = flatTree.filter(f=>levels.includes(f.level) || (f.transactions.map(m=>m.currentDr + m.currentCr).reduce((pre,cur)=>pre+cur,0) != 0));
  res.json(flatTree); // Return the updated tree
}

function toFlatTree(tree) {
  const result = [];
  function traverse(node, level = 0) {
    // Add the current node to the result, excluding the branches field
    const { nodes, ...rest } = node;
    result.push({ ...rest, level });
    // Recursively process each branch, sorted by code
    nodes.sort((a, b) => a.code.localeCompare(b.code)).forEach(branch => traverse(branch, level + 1));
  }
  // Sort root nodes by code and traverse them
  tree.sort((a, b) => a.code.localeCompare(b.code)).forEach(root => traverse(root));
  return result;
}

// get sum of records per book
async function getAccountTotalDRCR(code, start=null, end=null){
  const date = {};
  if(start) date.$gte = new Date(start);
  if(end) date.$lte = new Date(end);
  const records = await EntriesModel.aggregate(
    [
      {
        $addFields: {
          date: {
            $ifNull: ["$JVDate", {
              $ifNull: ["$DVDate", "$CRDate"]
            }]
          },
          no: {
            $ifNull: ["$JVNo", {
              $ifNull: ["$DVNo", "$CRNo"]
            }]
          }
        }
      },
      {
        $project: {
          date: 1,
          no: 1,
          ledgers: 1
        }
      },
      {
        $match: {
          'ledgers.ledger.code': code,
          date: date
        }
      },
      {
        $unwind: {
          path: "$ledgers"
        }
      },
      {
        $match: {
          'ledgers.ledger.code': code
        }
      },
      {
        $project: {
          date: 1,
          no: 1,
          type: "$ledgers.type",
          dr: "$ledgers.dr",
          cr: "$ledgers.cr",
          code: "$ledgers.ledger.code",
          ledger: "$ledgers.ledger.name",
          slCode: "$ledgers.subledger.slCode",
          subledger: "$ledgers.subledger.name"
        }
      },
       {
        $group: {
          _id: null,
          totalDr: {$sum: "$dr"},
          totalCr: {$sum: "$cr"}
        }
      }
    ]
  );
  return records;
}

// get records of a book grouped by subledgers
async function getAccountGroupedTransactions(code, start=null, end=null){
  const date = {};
  if(start) date.$gte = new Date(start);
  if(end) date.$lte = new Date(end);
  const records = await EntriesModel.aggregate(
    [
      {
        $addFields: {
          date: { $ifNull: ["$JVDate", { $ifNull: ["$DVDate", "$CRDate"] }] },
          no: { $ifNull: ["$JVNo", { $ifNull: ["$DVNo", "$CRNo"] }] }
        }
      },
      {
        $project: { date: 1, no: 1, ledgers: 1 }
      },
      {
        $match: {
          'ledgers.ledger.code': code,
          date: date
        }
      },
      { $unwind: { path: "$ledgers" } },
      {
        $match: {
          'ledgers.ledger.code': code
        }
      },
      {
        $project: {
          date: 1,
          no: 1,
          type: "$ledgers.type",
          dr: "$ledgers.dr",
          cr: "$ledgers.cr",
          code: "$ledgers.ledger.code",
          ledger: "$ledgers.ledger.name",
          slCode: "$ledgers.subledger.slCode",
          subledger: "$ledgers.subledger.name"
        }
      },
      {
        $group: {
          _id: "$slCode",
          totalDr: {$sum: "$dr"},
          totalCr: {$sum: "$cr"},
          name: {$first: "$subledger"},
          slCode: {$first: "$slCode"}
        }
      }
    ]
  );
  return records;
}

/**
 * traverses tree and calls the callback function on each node 
 * @param {array of trees} tree 
 * @param {(node)=>node} callback updates the current node
 * @returns new updated tree
 */
async function traverseAndUpdateTreeAsync(tree, callback) {
  async function traverse(nodes) {
    return Promise.all(
      nodes.map(async (node) => {
        // Apply the async callback function to the current node
        const updatedNode = await callback(node);
        // Recursively process child nodes if they exist
        if (updatedNode.nodes && updatedNode.nodes.length > 0) {
          updatedNode.nodes = await traverse(updatedNode.nodes);
        }
        return updatedNode;
      })
    );
  }
  // Start traversal from the root level
  return traverse(tree);
}

// returns all accounts in tree format
async function accountsTree(){
  const accounts = await Account.find().lean(); // Use lean() to get plain objects
  // Step 1: Create a map of accounts by their parentAccount, sorting by 'code'
  const accountsByParent = accounts.reduce((acc, account) => {
    const parent = account.parentAccount || null; // Treat empty parentAccount as root
    if (!acc[parent]) {
      acc[parent] = [];
    }
    acc[parent].push({ ...account, nodes: [] }); // Add nodes field to each account
    return acc;
  }, {});
  // Step 2: Recursively build nodes for each account and add the parent field
  function buildNodes(account) {
    // Get children of the current account and sort them by 'code'
    const children = (accountsByParent[account.code] || []).sort((a, b) => a.code.localeCompare(b.code));
    account.nodes = children.map(buildNodes); // Recursively build child nodes
    // Add the parent information if a parent exists
    if (account.parentAccount) {
      const parentAccount = accounts.find(acc => acc.code === account.parentAccount);
      account.parent = parentAccount ? { ...parentAccount } : null; // Add parent field
    } else {
      account.parent = null; // Root account has no parent
    }

    return account;
  }
  // Step 3: Get the root accounts (those with no parentAccount) and build the full tree
  const rootAccounts = accountsByParent[null] || [];
  // Sort the root accounts by 'code' as well
  const sortedRootAccounts = rootAccounts.sort((a, b) => a.code.localeCompare(b.code));
  // Build the tree for the root accounts
  const tree = sortedRootAccounts.map(buildNodes);
  return tree;
}

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! new functions added (still used)
// do not delete
async function exportEntries(req, res){
  try{
    const { from, to, p = 'true', r = 'true', j = 'true', acc = '', sl = '', ret='', c='false' } = req.query;

    if (isNaN(new Date(from)) || isNaN(new Date(to))) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    let filter = {
      date: {
        $gte: new Date(from),
        $lte: new Date(to),
      },
    };

    const types = [];
    if (p === 'true') types.push('Payment');
    if (r === 'true') types.push('Receipt');
    if (j === 'true') types.push('Journal');
    if (types.length > 0) {
      filter.docCode = { $in: types };
    }
    if(c === 'false'){
      filter.cancelledDate = {$eq: null}
    }
    let searchacc = {};
    if (acc) {
      searchacc.ACCTCODE = acc;
    }
    if (sl) {
      searchacc.SLCODE = sl;
    }
    if(ret){
      if(ret === 'cash'){
        filter.ReceiptEntryType = "Cash Receipt";
      }else if(ret === 'deposit'){
        filter.ReceiptEntryType = "Deposit Slip";
      }
    }

    const transactions = await EntriesModel.aggregate([
      {
        $unionWith: {
          coll: "entriescancelleds", // Name of the second collection
        },
      },
      {
        $addFields: {
          date: {
            $ifNull: [
              "$JVDate",
              { $ifNull: ["$DVDate", { $ifNull: ["$CRDate", new Date("1970-01-01")] }] },
            ],
          },
          no: { $ifNull: ["$JVNo", { $ifNull: ["$DVNo", "$CRNo"] }] },
        },
      },
      {
        $project: {
          date: 1,
          docNo: "$no",
          ledgers: 1,
          desc: "$Particulars",
          docCode: "$EntryType",
          ReceiptEntryType: 1,
          checkNo: "$CheckNo",
          cancelledDate: 1,
          paymentEntity: "$PaymentEntity.name"
        },
      },
      { $match: filter },
      { $sort: { date: -1, docNo: -1 } },
      { $unwind: { path: "$ledgers" } },
      {
        $project: {
          _id: 0,
          SLCODE: "$ledgers.subledger.slCode",
          SLNAME: "$ledgers.subledger.name",
          ACCTCODE: "$ledgers.ledger.code",
          ["ACCOUNT NAME"]: "$ledgers.ledger.name",
          SLDATE: {
            $dateToString: {
              format: "%Y/%m/%d",
              date: "$date",
            },
          },
          SLDOCCODE: "$docCode",
          SLDOCNO: "$docNo",
          SLDESC: {
            $cond: {
              if: { 
                $or: [
                  { $eq: ["$ledgers.description", null] }, 
                  { $eq: ["$ledgers.description", ""] }
                ] 
              },
              then: "$desc", // Replace with your fallback field
              else: "$ledgers.description"
            }
          },
          // particulars: "$desc",
          ["Receipt Entry Type"]: "$ReceiptEntryType",
          ["Check No,"]: "$checkNo",
          SLDEBIT: { $ifNull: ["$ledgers.dr", 0] },
          SLCREDIT: { $ifNull: ["$ledgers.cr", 0] },
          status: {
            $cond: {
              if: { $or: [
                { $eq: [{ $ifNull: ["$cancelledDate", null] }, null] }, // Check if cancelledDate is null or does not exist
                { $eq: ["$cancelledDate", ""] }  // Also check if it's an empty string
              ] },
              then: "", // If cancelledDate is null or missing, set status as empty string
              else: "cancelled"  // Otherwise, set status as "cancelled"
            }
          },
          ["PAYMENT ENTITY"]: "$paymentEntity",
        }
      },
      { $match: searchacc },
    ]);

    // Create an empty worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([]); // Empty worksheet

    // Define headers
    const headers1 = [["NATIONAL DEVELOPMENT COMPANY"]]; // Title row
    const headers2 = [["TRANSACTION LIST"]];
    const headers3 = [[new Date().toLocaleString("en-US", { hour12: true })]];
    const blankRow = [[]]; // Empty row for spacing

    // Insert headers at the top
    XLSX.utils.sheet_add_aoa(worksheet, headers1, { origin: "A1" });
    XLSX.utils.sheet_add_aoa(worksheet, headers2, { origin: "A2" });
    XLSX.utils.sheet_add_aoa(worksheet, headers3, { origin: "A3" });
    XLSX.utils.sheet_add_aoa(worksheet, blankRow, { origin: "A4" });

    const columnHeaders = [
      ["SLCODE", "SLNAME", "ACCTCODE", "ACCOUNT NAME", "SLDATE", "SLDOCCODE", 
      "SLDOCNO", "SLDESC", "Check No,", "Receipt Entry Type", "SLDEBIT", "SLCREDIT", 
      "Status", "PAYMENT ENTITY"]
    ];

    XLSX.utils.sheet_add_aoa(worksheet, columnHeaders, { origin: "A5" });

    // Add JSON data starting at A3 (to preserve headers)
    XLSX.utils.sheet_add_json(worksheet, transactions, { origin: "A6", skipHeader: true, header: columnHeaders[0] });

    // Create a workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "TRANSACTION LIST");

    // Write workbook to a buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Set headers and send the Excel file
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  }catch(error){  
    console.error(error);
    return res.status(500).json({message: "Internal server error"});
  }
}

async function searchEntries(req, res) {
  try {
    const { from='', to='', p = 'true', r = 'true', j = 'true', acc = '', sl = '', ret='', page=1, limit=10, c='false', query='' } = req.query;
    let filter = {
      date: {
        $gte: from ? new Date(from) : new Date("1970-01-01"), // Default to 1970-01-01 if from is empty
        $lte: to ? new Date(to) : new Date(), // Default to today's date if to is empty
      },
    };
    const types = [];
    if (p === 'true') types.push('Payment');
    if (r === 'true') types.push('Receipt');
    if (j === 'true') types.push('Journal');
    if (types.length > 0) {
      filter.docCode = { $in: types };
    }
    if(c === 'false'){
      filter.cancelledDate = {$eq: null}
    }
    let searchacc = {};
    if (acc) {
      searchacc.ACCTCODE = acc;
    }
    if (sl) {
      searchacc.SLCODE = sl;
    }
    if(ret){
      if(ret === 'cash'){
        filter.ReceiptEntryType = "Cash Receipt";
      }else if(ret === 'deposit'){
        filter.ReceiptEntryType = "Deposit Slip";
      }
    }
    if (query) {
      searchacc.SLDESC = new RegExp(query, "i"); // Wildcard search in SLDESC
    }
    // First, fetch the total count of records (for pagination)
    const totalCount = await EntriesModel.aggregate([
      {
        $unionWith: {
          coll: "entriescancelleds", // Name of the second collection
        },
      },
      {
        $addFields: {
          date: {
            $ifNull: [
              "$JVDate",
              { $ifNull: ["$DVDate", { $ifNull: ["$CRDate", new Date("1970-01-01")] }] },
            ],
          },
          no: { $ifNull: ["$JVNo", { $ifNull: ["$DVNo", "$CRNo"] }] },
        },
      },
      {
        $project: {
          date: 1,
          docNo: "$no",
          ledgers: 1,
          desc: "$Particulars",
          docCode: "$EntryType",
          checkNo: "$CheckNo",
          ReceiptEntryType: 1,
          cancelledDate: 1
        },
      },
      { $match: filter },
      { $sort: { date: -1, no: -1 } },
      { $unwind: { path: "$ledgers" } },
      {
        $project: {
          _id: 0,
          SLCODE: "$ledgers.subledger.slCode",
          SLNAME: "$ledgers.subledger.name",
          ACCTCODE: "$ledgers.ledger.code",
          "ACCOUNT NAME": "$ledgers.ledger.name",
          SLDATE: {
            $dateToString: {
              format: "%Y/%m/%d",
              date: "$date",
            },
          },
          SLDOCCODE: "$docCode",
          SLDOCNO: "$docNo",
          particulars: "$desc",
          SLDESC: {
            $cond: {
              if: { 
                $or: [
                  { $eq: ["$ledgers.description", null] }, 
                  { $eq: ["$ledgers.description", ""] }
                ] 
              },
              then: "$desc", // Replace with your fallback field
              else: "$ledgers.description"
            }
          },
          "Check No,": "$checkNo",
          "Receipt Entry Type": "$ReceiptEntryType",
          SLDEBIT: "$ledgers.dr",
          SLCREDIT: "$ledgers.cr",
          cancelledDate: 1
        }
      },
      { $match: searchacc },
    ]);
    const totalRecords = totalCount.length;
    const totalPages = Math.ceil(totalRecords / limit);
    // Fetch the paginated data
    const transactions = await EntriesModel.aggregate([
      {
        $unionWith: {
          coll: "entriescancelleds", // Name of the second collection
        },
      },
      {
        $addFields: {
          date: {
            $ifNull: [
              "$JVDate",
              { $ifNull: ["$DVDate", { $ifNull: ["$CRDate", new Date("1970-01-01")] }] },
            ],
          },
          no: { $ifNull: ["$JVNo", { $ifNull: ["$DVNo", "$CRNo"] }] },
        },
      },
      {
        $project: {
          date: 1,
          docNo: "$no",
          ledgers: 1,
          desc: "$Particulars",
          docCode: "$EntryType",
          checkNo: "$CheckNo",
          ReceiptEntryType: 1,
          cancelledDate: 1,
          paymentEntity: "$PaymentEntity.name"
        },
      },
      { $match: filter },
      { $sort: { date: -1, docNo: -1 } },
      { $unwind: { path: "$ledgers" } },
      {
        $project: {
          SLCODE: "$ledgers.subledger.slCode",
          SLNAME: "$ledgers.subledger.name",
          ACCTCODE: "$ledgers.ledger.code",
          ["ACCOUNT NAME"]: "$ledgers.ledger.name",
          paymentEntity: 1,
          SLDATE: {
            $dateToString: {
              format: "%Y/%m/%d",
              date: "$date",
            },
          },
          SLDOCCODE: "$docCode",
          SLDOCNO: "$docNo",
          SLDESC: {
            $cond: {
              if: { 
                $or: [
                  { $eq: ["$ledgers.description", null] }, 
                  { $eq: ["$ledgers.description", ""] }
                ] 
              },
              then: "$desc", // Replace with your fallback field
              else: "$ledgers.description"
            }
          },
          ["Check No,"]: "$checkNo",
          ["Receipt Entry Type"]: "$ReceiptEntryType",
          SLDEBIT: "$ledgers.dr",
          SLCREDIT: "$ledgers.cr",
          status: {
            $cond: {
              if: { $or: [
                { $eq: [{ $ifNull: ["$cancelledDate", null] }, null] }, // Check if cancelledDate is null or does not exist
                { $eq: ["$cancelledDate", ""] }  // Also check if it's an empty string
              ] },
              then: "", // If cancelledDate is null or missing, set status as empty string
              else: "cancelled"  // Otherwise, set status as "cancelled"
            }
          }
        }
      },
      { $match: searchacc },
      { $skip: (page - 1) * limit },  // Skip documents for pagination
      { $limit: parseInt(limit) }      // Limit the number of documents returned
    ]);
    res.json({ entries: transactions, totalCount: totalRecords, totalPages: totalPages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}

// functions for closing periods
async function getEntryYears(req, res){
  try{
    const years = await EntriesModel.aggregate([
      {
        $project: {
          year: { "$year": "$createdAt"}
        }
      },
      {
        $group: {
          _id: null,
          years: { $addToSet: "$year"}
        }
      },
      {
        $project: {
          _id: 0,
          years: { "$sortArray": { "input": "$years", "sortBy": -1 } }
        }
      }
    ]);
    console.log(years[0].years);
    res.json(years.length > 0 ? years[0].years : []);
  }catch(error){
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function bookBalance(req, res){
  try{
    const { gl, sl, from, to, type='all' } = req.query;
    const match = {};
    const date = {};
    if(gl) match.gl = gl;
    if(sl) match.sl = sl;
    if(from) date.$gte = new Date(from);
    if(to) date.$lte = new Date(to);
    if(from || to) match.date = date;
    const book = await EntriesModel.aggregate([
      {
        $addFields: {
          date: {
            $ifNull: [
              "$JVDate",
              { $ifNull: ["$DVDate", { $ifNull: ["$CRDate", new Date("1970-01-01")] }] },
            ],
          },
          no: { $ifNull: ["$JVNo", { $ifNull: ["$DVNo", "$CRNo"] }] },
        },
      },
      {
        $unwind: '$ledgers'
      },
      {
        $project: {
          date: 1,
          ledgers: 1,
          gl: "$ledgers.ledger.code",
          glName: "$ledgers.ledger.name",
          sl: "$ledgers.subledger.slCode",
          slname: "$ledgers.subledger.slName",
          dr: "$ledgers.dr",
          cr: "$ledgers.cr"
        }
      },
      {
        $match: match
      },
      {
        $group: {
          _id: null,
          debit: { $sum: "$dr" },
          credit: { $sum: "$cr" }
        }
      }
    ]);
    if(book.length > 0){
      return res.json({ debit: parseFloat(book[0].debit.toFixed(2)), credit: parseFloat(book[0].credit.toFixed(2)) });
    }
    res.json({ debit: 0, credit: 0 });
  }catch(error){
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// to internally use function above
async function findBookBalance(gl='', sl='', from='', to='', type='all'){
  try{
    const match = {};
    const date = {};
    if(gl) match.gl = gl;
    if(sl) match.sl = sl;
    if(from) date.$gte = new Date(from);
    if(to) date.$lte = new Date(to);
    if(from || to) match.date = date;
    const book = await EntriesModel.aggregate([
      {
        $addFields: {
          date: {
            $ifNull: [
              "$JVDate",
              { $ifNull: ["$DVDate", { $ifNull: ["$CRDate", new Date("1970-01-01")] }] },
            ],
          },
          no: { $ifNull: ["$JVNo", { $ifNull: ["$DVNo", "$CRNo"] }] },
        },
      },
      {
        $unwind: '$ledgers'
      },
      {
        $project: {
          date: 1,
          ledgers: 1,
          gl: "$ledgers.ledger.code",
          glName: "$ledgers.ledger.name",
          sl: "$ledgers.subledger.slCode",
          slname: "$ledgers.subledger.slName",
          dr: "$ledgers.dr",
          cr: "$ledgers.cr"
        }
      },
      {
        $match: match
      },
      {
        $group: {
          _id: null,
          debit: { $sum: "$dr" },
          credit: { $sum: "$cr" }
        }
      }
    ]);
    if(book.length > 0){
      return { debit: parseFloat(book[0].debit.toFixed(2)), credit: parseFloat(book[0].credit.toFixed(2)) };
    }
    return { debit: 0, credit: 0 };
  }catch(error){
    console.error(error);
    return { debit: 0, credit: 0 };
  }
}

async function findBookBalanceSLFiltered(gl='', sl=[], from='', to='', type='all'){
  try{
    const match = {};
    const date = {};
    if(gl) match.gl = gl;
    if (sl.length > 0) match.sl = { $in: sl };
    if(from) date.$gte = new Date(from);
    if(to) date.$lte = new Date(to);
    if(from || to) match.date = date;
    const book = await EntriesModel.aggregate([
      {
        $addFields: {
          date: {
            $ifNull: [
              "$JVDate",
              { $ifNull: ["$DVDate", { $ifNull: ["$CRDate", new Date("1970-01-01")] }] },
            ],
          },
          no: { $ifNull: ["$JVNo", { $ifNull: ["$DVNo", "$CRNo"] }] },
        },
      },
      {
        $unwind: '$ledgers'
      },
      {
        $project: {
          date: 1,
          ledgers: 1,
          gl: "$ledgers.ledger.code",
          glName: "$ledgers.ledger.name",
          sl: "$ledgers.subledger.slCode",
          slname: "$ledgers.subledger.slName",
          dr: "$ledgers.dr",
          cr: "$ledgers.cr"
        }
      },
      {
        $match: match
      },
      {
        $group: {
          _id: null,
          debit: { $sum: "$dr" },
          credit: { $sum: "$cr" }
        }
      }
    ]);
    if(book.length > 0){
      return { debit: parseFloat(book[0].debit.toFixed(2)), credit: parseFloat(book[0].credit.toFixed(2)) };
    }
    return { debit: 0, credit: 0 };
  }catch(error){
    console.error(error);
    return { debit: 0, credit: 0 };
  }
}


module.exports = {

  // another refactor (working: no longer using flat entries collection)
  // latest stable functions
  trialBalance,
  straightschedule,
  fetchTree,
  exportEntries,
  searchEntries,
  fullTrialBalance,
  getEntryYears,
  bookBalance, // to be consumed by api users
  findBookBalance,  // to be consumed internally
  findBookBalanceSLFiltered,

  // these functions will be deleted on next refactor
  // getSimpleInvoiceStatusReport,
  getBook,
  // getBookSummary,
  getTrialBalance,
  getStraighSchedule,
  exportStraighSchedule,
  getBook, // all entries on a book
  // getBookSummary, // summarized all credit and debit on a book
  getBookTransactionSummary, // summarized credit and debit per subledgers on a book

  // refactored(failed)
  fullStraightSchedule,
  getAllAccountsWithTotalTransactions,

  // experimental
  fixedTrialBalance,
};