const {baseModel} = require("../models/baseModel");

const base = {
    "_id": {
      "$oid": "6796de416a399c97a7f4b187"
    },
    "accountCategories": [
      "ASSETS",
      "LIABILITIES",
      "CAPITAL",
      "REVENUES/INCOME",
      "EXPENSES"
    ],
    "taxTypes": [
      {
        "taxCode": "wpt",
        "tax": "PERCENTAGE TAX",
        "percentage": 0,
        "_id": {
          "$oid": "6796de416a399c97a7f4b188"
        }
      },
      {
        "taxCode": "vat-gov",
        "tax": "Government",
        "percentage": 0.12,
        "_id": {
          "$oid": "6796de416a399c97a7f4b189"
        }
      },
      {
        "taxCode": "vat-ts",
        "tax": "Taxable Sales",
        "percentage": 0.12,
        "_id": {
          "$oid": "6796de416a399c97a7f4b18a"
        }
      },
      {
        "taxCode": "vat-zr",
        "tax": "Zero-Rated",
        "percentage": 0,
        "_id": {
          "$oid": "6796de416a399c97a7f4b18b"
        }
      },
      {
        "taxCode": "vat-es",
        "tax": "Exempt Sales",
        "percentage": 0,
        "_id": {
          "$oid": "6796de416a399c97a7f4b18c"
        }
      },
      {
        "taxCode": "vat-cg",
        "tax": "Capital Goods",
        "percentage": 0.12,
        "_id": {
          "$oid": "6796de416a399c97a7f4b18d"
        }
      },
      {
        "taxCode": "vat-g",
        "tax": "Goods",
        "percentage": 0.12,
        "_id": {
          "$oid": "6796de416a399c97a7f4b18e"
        }
      },
      {
        "taxCode": "vat-s",
        "tax": "Service",
        "percentage": 0.12,
        "_id": {
          "$oid": "6796de416a399c97a7f4b18f"
        }
      },
      {
        "taxCode": "wtc",
        "tax": "INCOME TAX WITHHELD FROM EMPLOYEES",
        "percentage": 0.25,
        "_id": {
          "$oid": "6796de416a399c97a7f4b190"
        }
      }
    ],
    "companyTypes": [
      {
        "company": "Private",
        "_id": {
          "$oid": "6796de416a399c97a7f4b191"
        }
      },
      {
        "company": "Public",
        "_id": {
          "$oid": "6796de416a399c97a7f4b192"
        }
      },
      {
        "company": "Non-Profit",
        "_id": {
          "$oid": "6796de416a399c97a7f4b193"
        }
      },
      {
        "company": "Government",
        "_id": {
          "$oid": "6796de416a399c97a7f4b194"
        }
      }
    ],
    "userTypes": [
      {
        "user": "Administrator",
        "access": [
          "ca", "cs", "us", "ss", "rp", "s", "as", "c",
          "i", "e", "ps", "b", "v", "en", "pn", "rn",
          "jn",
          "bm",
          "fd",
          "be",
          "or",
          "orx",
          "fs",
          "br",
          "dp",
          "adv",
          "pr"
        ],
        "_id": {
          "$oid": "6796de416a399c97a7f4b195"
        }
      },
      {
        "user": "Accountant",
        "access": [
          "ca",
          "ss",
          "rp",
          "b",
          "v",
          "en",
          "pn",
          "rn",
          "jn",
          "bm",
          "fd",
          "be",
          "or",
          "orx",
          "fs",
          "br",
          "dp"
        ],
        "_id": {
          "$oid": "67bc359e5ea519ace0fbbecd"
        }
      },
      {
        "user": "Accountant II",
        "access": [
          "ca",
          "ss",
          "rp",
          "b",
          "v",
          "en",
          "pn",
          "rn",
          "jn",
          "bm",
          "fd",
          "be",
          "or",
          "fs",
          "br",
          "dp"
        ],
        "_id": {
          "$oid": "67bc35a25ea519ace0fbbf77"
        }
      },
      {
        "user": "Accountant III",
        "access": [
          "ca",
          "ss",
          "rp",
          "b",
          "v",
          "en",
          "pn",
          "rn",
          "jn",
          "bm",
          "fd",
          "be",
          "or",
          "fs",
          "br",
          "us",
          "cs",
          "orx",
          "s",
          "c",
          "as",
          "i",
          "dp"
        ],
        "_id": {
          "$oid": "67bc35a55ea519ace0fbc021"
        }
      },
      {
        "user": "Accountant IV",
        "access": [
          "ca",
          "ss",
          "rp",
          "b",
          "v",
          "en",
          "pn",
          "rn",
          "jn",
          "bm",
          "fd",
          "be",
          "or",
          "fs",
          "br",
          "dp"
        ],
        "_id": {
          "$oid": "67bc35a85ea519ace0fbc0cb"
        }
      },
      {
        "user": "Accountant V",
        "access": [
          "ca",
          "ss",
          "rp",
          "b",
          "v",
          "en",
          "pn",
          "rn",
          "jn",
          "bm",
          "fd",
          "be",
          "or",
          "fs",
          "br",
          "dp"
        ],
        "_id": {
          "$oid": "67bc35aa5ea519ace0fbc175"
        }
      },
      {
        "user": "OFFICER-IN-CHARGE",
        "access": [
          "ca",
          "ss",
          "rp",
          "b",
          "v",
          "en",
          "pn",
          "rn",
          "jn",
          "bm",
          "fd",
          "be",
          "or",
          "fs",
          "br"
        ],
        "_id": {
          "$oid": "67a16610d69f35ded2aab7f4"
        }
      },
      {
        "user": "OFFICER-IN-CHARGE, FSG",
        "access": [
          "ca",
          "ss",
          "rp",
          "b",
          "v",
          "en",
          "pn",
          "rn",
          "jn",
          "bm",
          "fd",
          "be",
          "or",
          "fs",
          "br"
        ],
        "_id": {
          "$oid": "67a16616d69f35ded2aab9e9"
        }
      },
      {
        "user": "OFFICER-IN-CHARGE, FAD",
        "access": [
          "ca",
          "ss",
          "rp",
          "b",
          "v",
          "en",
          "pn",
          "rn",
          "jn",
          "bm",
          "fd",
          "be",
          "or",
          "fs",
          "br"
        ],
        "_id": {
          "$oid": "67a16615d69f35ded2aab942"
        }
      },
      {
        "user": "ASSISTANT GENERAL MANAGER",
        "access": [
          "ca",
          "cs",
          "us",
          "ss",
          "rp",
          "s",
          "as",
          "c",
          "i",
          "e",
          "ps",
          "b",
          "v",
          "en",
          "pn",
          "rn",
          "jn",
          "bm",
          "fd",
          "be",
          "or",
          "fs",
          "br"
        ],
        "_id": {
          "$oid": "67a16619d69f35ded2aaba90"
        }
      },
      {
        "user": "GENERAL MANAGER",
        "access": [
          "ca",
          "cs",
          "us",
          "ss",
          "rp",
          "s",
          "as",
          "c",
          "i",
          "e",
          "ps",
          "b",
          "v",
          "en",
          "pn",
          "rn",
          "jn",
          "bm",
          "fd",
          "be",
          "or",
          "fs",
          "br"
        ],
        "_id": {
          "$oid": "67a1661dd69f35ded2aabb37"
        }
      },
      {
        "user": "OIC-GENERAL MANAGER",
        "access": [
          "ca",
          "cs",
          "us",
          "ss",
          "rp",
          "s",
          "as",
          "c",
          "i",
          "e",
          "ps",
          "b",
          "v",
          "en",
          "pn",
          "rn",
          "jn",
          "bm",
          "fd",
          "be",
          "or",
          "fs",
          "br"
        ],
        "_id": {
          "$oid": "67a16621d69f35ded2aabbde"
        }
      },
      {
        "user": "DEPARTMENT MANAGER III-LEGAL",
        "access": [
          "ca",
          "cs",
          "us",
          "ss",
          "rp",
          "s",
          "as",
          "c",
          "i",
          "e",
          "ps",
          "b",
          "v",
          "en",
          "pn",
          "rn",
          "jn",
          "bm",
          "fd",
          "be",
          "or",
          "fs",
          "br"
        ],
        "_id": {
          "$oid": "67a16627d69f35ded2aabc85"
        }
      },
      {
        "user": "TREASURER",
        "access": [
          "or"
        ],
        "_id": {
          "$oid": "6796de416a399c97a7f4b1a2"
        }
      },
      {
        "user": "Accounting Specialist",
        "access": [
          "dp",
          "adv",
          "br",
          "fs",
          "orx",
          "fd",
          "or",
          "be",
          "bm",
          "rp",
          "rn",
          "jn",
          "pn",
          "en",
          "b",
          "v",
          "ps",
          "i",
          "as",
          "ss",
          "cs",
          "ca",
          "us",
          "s",
          "c",
          "e"
        ],
        "_id": {
          "$oid": "67ca5d436db6c2b7325a8fb5"
        }
      }
    ],
    "accessTypes": [
      {
        "code": "ca",
        "access": "Chart of Accounts",
        "_id": {
          "$oid": "6796de416a399c97a7f4b1a3"
        }
      },
      {
        "code": "cs",
        "access": "Company Settings",
        "_id": {
          "$oid": "6796de416a399c97a7f4b1a4"
        }
      },
      {
        "code": "us",
        "access": "Users Settings",
        "_id": {
          "$oid": "6796de416a399c97a7f4b1a5"
        }
      },
      {
        "code": "ss",
        "access": "System Setup",
        "_id": {
          "$oid": "6796de416a399c97a7f4b1a6"
        }
      },
      {
        "code": "s",
        "access": "Sales",
        "_id": {
          "$oid": "6796de416a399c97a7f4b1a7"
        }
      },
      {
        "code": "as",
        "access": "All Sales",
        "_id": {
          "$oid": "6796de416a399c97a7f4b1a8"
        }
      },
      {
        "code": "c",
        "access": "Customers",
        "_id": {
          "$oid": "6796de416a399c97a7f4b1a9"
        }
      },
      {
        "code": "i",
        "access": "Invoices",
        "_id": {
          "$oid": "6796de416a399c97a7f4b1aa"
        }
      },
      {
        "code": "e",
        "access": "Expenses",
        "_id": {
          "$oid": "6796de416a399c97a7f4b1ab"
        }
      },
      {
        "code": "ps",
        "access": "Products & Services",
        "_id": {
          "$oid": "6796de416a399c97a7f4b1ac"
        }
      },
      {
        "code": "b",
        "access": "Bills",
        "_id": {
          "$oid": "6796de416a399c97a7f4b1ad"
        }
      },
      {
        "code": "v",
        "access": "Vendors",
        "_id": {
          "$oid": "6796de416a399c97a7f4b1ae"
        }
      },
      {
        "code": "en",
        "access": "Entries",
        "_id": {
          "$oid": "6796de416a399c97a7f4b1af"
        }
      },
      {
        "code": "pn",
        "access": "Payment Entries",
        "_id": {
          "$oid": "6796de416a399c97a7f4b1b0"
        }
      },
      {
        "code": "rn",
        "access": "Receipt Entries",
        "_id": {
          "$oid": "6796de416a399c97a7f4b1b1"
        }
      },
      {
        "code": "jn",
        "access": "Journal Entries",
        "_id": {
          "$oid": "6796de416a399c97a7f4b1b2"
        }
      },
      {
        "code": "rp",
        "access": "Reports",
        "_id": {
          "$oid": "6796de416a399c97a7f4b1b3"
        }
      },
      {
        "code": "bm",
        "access": "Budget Monitoring",
        "_id": {
          "$oid": "6796de416a399c97a7f4b1b4"
        }
      },
      {
        "code": "fd",
        "access": "Funds Data Entry",
        "_id": {
          "$oid": "6796de416a399c97a7f4b1b5"
        }
      },
      {
        "code": "be",
        "access": "Budget Data Entry",
        "_id": {
          "$oid": "6796de416a399c97a7f4b1b6"
        }
      },
      {
        "code": "or",
        "access": "Order of Payment",
        "_id": {
          "$oid": "6796de416a399c97a7f4b1b7"
        }
      },
      {
        "code": "orx",
        "access": "Update General Ledger from Order of Payment",
        "_id": {
          "$oid": "6796de416a399c97a7f4b1b8"
        }
      },
      {
        "code": "fs",
        "access": "Financial Statements",
        "_id": {
          "$oid": "6796de416a399c97a7f4b1b9"
        }
      },
      {
        "access": "Bank Reconciliation",
        "code": "br"
      },
      {
        "access": "Depreciation",
        "code": "dp"
      },
      {
        "access": "Cash Advance",
        "code": "adv"
      },
      {
        "access": "Payroll",
        "code": "pr"
      }
    ],
    "paymentMethods": [
      "Cash",
      "Cheque",
      "Others"
    ],
    "ReceiptEntryType": [
      "Cash Receipt",
      "Deposit Slip"
    ],
    "paymentTerms": [
      {
        "term": "net15",
        "value": 15,
        "_id": {
          "$oid": "6796de416a399c97a7f4b1ba"
        }
      },
      {
        "term": "net30",
        "value": 30,
        "_id": {
          "$oid": "6796de416a399c97a7f4b1bb"
        }
      },
      {
        "term": "net60",
        "value": 60,
        "_id": {
          "$oid": "6796de416a399c97a7f4b1bc"
        }
      }
    ],
    "workGroups": [
      "AMG",
      "Corplan",
      "Corporate",
      "FAD",
      "FMG",
      "Legal",
      "OC",
      "OGM",
      "SPG",
      "BAC",
      "CSG",
      "CCG",
      "Disposal",
      "IAD",
      "IG-BD",
      "DavaoFoodExchangeProject",
      "COA",
      "GAD",
      "NDCISO",
      "PingagProject",
      "BIRInputVAT"
    ],
    "rentalAccrual": {
      "entryType": "Journal",
      "particulars": "RENT ACCRUAL",
      "accrual": {
        "debitTo": {
          "code": "10301010B",
          "name": "RENTAL RECEIVABLE"
        },
        "creditTo": {
          "code": "40202050",
          "name": "RENT/LEASE INCOME"
        }
      },
      "securityDeposit": {
        "debitTo": {
          "code": "10301010E",
          "name": "OTHER NON-INCOME REC.-CURRENT"
        },
        "creditTo": {
          "code": "40603990",
          "name": "MISCELLANEOUS INCOME"
        }
      }
    },
    "__v": 0,
    "expensesAccounts": [
      "501", "50101", "50101010", "50101020", "50102", "50102010", "50102020", "50102030", "50102040", "50102050", "50102060",
      "50102070", "50102080", "50102090",
      "50102100",
      "50102110",
      "50102120",
      "50102130",
      "50102140",
      "50102150",
      "50102990",
      "50103",
      "50103010",
      "50103020",
      "50103030",
      "50103040",
      "50104",
      "50104030",
      "50104990",
      "502",
      "50201",
      "50201010",
      "50201020",
      "50202",
      "50202010",
      "50202020",
      "50203",
      "50203010",
      "50203020",
      "50203090",
      "50203210",
      "50203990",
      "50204",
      "50204010",
      "50204020",
      "50205",
      "50205010",
      "50205020",
      "50205030",
      "50205040",
      "50210",
      "50210030",
      "50210030A",
      "50210030B",
      "50210030C",
      "50210030D",
      "50211",
      "50211010",
      "50211020",
      "50211030",
      "50211990",
      "50212",
      "50212010",
      "50212020",
      "50212030",
      "50212990",
      "50212990A",
      "50212990B",
      "50213",
      "50213010",
      "50213040",
      "50213050",
      "50213060",
      "50213060A",
      "50213060B",
      "50213060C",
      "50213070",
      "50213990",
      "50215",
      "50215010",
      "50215010A",
      "50215010B",
      "50215010C",
      "50215010D",
      "50215010E",
      "50215010F",
      "50215020",
      "50215030",
      "50215030A",
      "50215030B",
      "50215040",
      "50299",
      "50299010",
      "50299020",
      "50299030",
      "50299040",
      "50299050",
      "50299050A",
      "50299050B",
      "50299060",
      "50299070",
      "50299090",
      "50299140",
      "50299180",
      "50299990",
      "503",
      "50301",
      "50301020",
      "50301030",
      "50301040",
      "505",
      "50501",
      "50501010",
      "50501020",
      "50501040",
      "50501050",
      "50501060",
      "50501070",
      "50501090",
      "50501990",
      "50503",
      "50503020",
      "50503060",
      "50503150",
      "50504",
      "50504010",
      "50504030",
      "50504180"
    ],
    "incomeAccounts": [
      "405",
      "40501",
      "40501010",
      "40501020",
      "40501030",
      "40501040",
      "40501050",
      "40501160",
      "40602010",
      "406",
      "40603",
      "40603990",
      "402",
      "40202",
      "40202050",
      "40202200",
      "40202200A",
      "40202200B",
      "40202210",
      "40202210A",
      "40202210B",
      "40202210C",
      "40202210D",
      "40202220",
      "40202280",
      "40202340"
    ],
    "retainedEarningAccount": {
      "_id": "674fd3cd627b5efa3f6d3841",
      "category": "CAPITAL",
      "code": "30701010",
      "name": "RETAINED EARNINGS/(DEFICIT)",
      "description": "THIS ACCOUNT IS USED TO RECOGNIZE THE CUMULATIVE RESULTS OF NORMAL AND CONTINUOUS OPERATIONS OF A GBE INCLUDING PRIOR PERIOD ADJUSTMENTS, EFFECT OF CHANGES IN ACCOUNTING POLICY AND OTHER CAPITAL ADJUSTMENTS.  THIS MAY ALSO INCLUDE FUNDS SET ASIDE FOR VARIOUS PURPOSES IN ACCORDANCE WITH EXISTING LAWS, RULES  & REGULATIONS. THIS ACCOUNT USED TO CLOSE THE REVENUE/INCOME & EXPENSE SUMMARY ACCOUNT.",
      "archived": false,
      "isSubAccount": true,
      "parentAccount": {
        "_id": "674fd3cd627b5efa3f6d3840",
        "category": "CAPITAL",
        "code": "30701",
        "name": "RETAINED EARNINGS/(DEFICIT)",
        "archived": false,
        "isSubAccount": true,
        "parentAccount": "307",
        "dateAdded": "2024-12-04T04:00:13.048Z",
        "__v": 0
      },
      "dateAdded": "2024-12-04T04:00:13.049Z",
      "subAccount": []
    }
};

async function  updateBase(){
    await baseModel.deleteMany();
    const nb = new baseModel(base);
    await nb.save();
}

updateBase();