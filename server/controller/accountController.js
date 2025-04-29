const Account = require('../models/AccountModel');
const EntriesModel = require("../models/EntriesModel");

async function addNewAccount(req, res){
    try{
        const account = {
            category: req.body.category,
            code: req.body.code,
            description: req.body.description,
            name: req.body.name,
            // taxes: req.body.taxes,
            isSubAccount: req.body.isSubAccount,
            // openingBalance: req.body.openingBalance,
            // openingBalanceAsOf: req.body.openingBalanceAsOf
        };
        if(req.body.isSubAccount){
            account.parentAccount = req.body.parentAccount;
        }
        const newAccount = new Account(account);
        const savedAccount = await newAccount.save();
        res.json({message: 'Account saved', _id: savedAccount._id});
    }catch(error){
        if(error.code === 11000){
            return res.status(409).json({message: "Code already exist"});
        }
        console.log(error);
        return res.status(500).json({message: "internal server error"});
    }
}

async function getAccounts(req, res){
    try{
        // const accounts = await Account.find().populate('parentAccount');
        const accounts = await Account.aggregate([
            {
                $lookup: {
                    from: 'accounts',               // Self-lookup for sub-accounts
                    localField: 'code',               // Current document's _id
                    foreignField: 'parentAccount',   // Field in other documents referencing this _id
                    as: 'subAccount'                 // Resulting field for sub-accounts
                }
            },
            {
                $lookup: {
                    from: 'accounts',                // Lookup for parent account
                    localField: 'parentAccount',     // Field in current document referencing a parent
                    foreignField: 'code',             // _id of the parent account
                    as: 'parentAccount'              // Name it `parentAccount` to match `populate` behavior
                }
            },
            {
                $unwind: {
                    path: "$parentAccount",          // Unwind to get a single object instead of array
                    preserveNullAndEmptyArrays: true // Keep documents without a parent account
                }
            }
        ]);
        res.json(accounts);
    }catch(error){
        console.error(error);
        return res.status(500).json({message: "internal server error"});
    }
}

async function updateAccount(req, res){
    try{
        const account = {
            category: req.body.category,
            code: req.body.code,
            description: req.body.description,
            name: req.body.name,
            isSubAccount: req.body.isSubAccount,
        };
        if(req.body.isSubAccount){
            account.parentAccount = req.body.parentAccount.code;
        }else{
            account.parentAccount = '';
        }
        const upaccount = await Account.findByIdAndUpdate(req.params.id, account, {new: true, runValidators: true});

        await EntriesModel.updateMany(
            { "ledgers.ledger.code": req.body.code }, // Match documents where ledgers contain this code
            {
                $set: {
                "ledgers.$[elem].ledger.name": req.body.name // Update ledger name
                }
            },
            {
                arrayFilters: [{ "elem.ledger.code": req.body.code }] // Apply update only to matching ledger entries
            }
        );

        res.json({message: 'Acocunt saved', _id: upaccount._id});
    }catch(error){
        console.error(error);
        if(error.code === 11000){
            return res.status(409).json({message: "Code already exist"});
        }
        return res.status(500).json({message: "internal server error"});
    }
}

async function archiveAccount(req, res){
    try{
        const account = await Account.findByIdAndUpdate(req.params.id, {archived: true, archivedDate: new Date()}, {new: true, runValidators: true});
        res.json({message: 'Account archived', _id: account._id});
    }catch(error){
        console.error(error);
        return res.status(500).json({message: 'internal server error'});
    }
}

module.exports = {
    getAccounts,
    addNewAccount,
    updateAccount,
    archiveAccount
};