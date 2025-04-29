const  { baseModel, insertDefaultValues } = require('../models/baseModel');
const Account = require('../models/AccountModel');
const mongoose = require("mongoose");

async function readBase(req, res){
    try{
        const base = await baseModel.findOne();
        if(!base) return res.status(404).json({message: 'base data not found'});
        res.status(200).json(base);
    }catch(error){
        res.status(500).json({error: 'Internal server error'});
    }
}

async function getBase(){
    try{
        const base = await baseModel.findOne();
        return base;
    }catch(error){
        console.error('Error trying to read base data');
        res.status(500).json({error: 'Internal server error'});
    }
}

// account category
async function createAccountCategory(req, res){
    try{
        await baseModel.updateMany({}, req.body, { runValidators: true });
        res.json({message: 'Account created'});
    }catch(error){
        console.error(error);
        res.status(500).json({error: 'Internal server error'});
    }
}

async function updateAccountCategory(req, res){
    try{
        await baseModel.updateOne(
            {'accountCategories': req.params._id}, 
            {$set: {'accountCategories.$': req.body.change}}, 
            {runValidators: true}
        );
        await baseModel.updateMany(
            {'accountTypes.type': req.params._id}, 
            {$set: {'accountTypes.$[elem].type': req.body.change}}, 
            { arrayFilters: [{ 'elem.type': req.params._id }], runValidators: true}
        );
        /**
         * IMPORTANT!
         * apply account category changes to all other documents that may reference it
         */
        // updating all accounts
        await Account.updateMany(
            {'account.type': req.params._id},
            {
                $set: {
                    'account.type': req.body.change
                }
            },
            { runValidators: true }
        );
        res.json({message: 'Category updated!'});
    }catch(error){
        console.error(error);
        res.status(500).json({error: 'Internal server error'});
    }
}

async function deleteAccountCategory(req, res){
    try{      
        await baseModel.updateMany({}, {
            $pull: {
                accountCategories: req.params.cat
            }
        });
        await baseModel.updateMany({}, {
            $pull: {
                accountTypes: {type: req.params.cat}
            }
        });
        res.json({message: 'Category deleted'});
    }catch(error){
        console.error(error);
        res.status(500).json({error: 'Internal server error'});
    }
}

// tax types
async function createTaxType(req, res){
    try{
        await baseModel.updateMany({}, {
            $push: {
                taxTypes: req.body
            }
        }, {new: true});

        res.json({message: 'Tax created'});
    }catch(error){
        console.error(error);
        res.status(500).json({error: 'Internal server error'});
    }
}

async function updateTaxType(req, res){
    try{
        await baseModel.updateMany({'taxTypes._id': req.params._id}, {$set: {'taxTypes.$': req.body}});
         /**
         * IMPORTANT!
         * updated all documents that reference to this
         */
        // updating all accounts
        await Account.updateMany(
            {},
            {
              $set: {
                'taxes.$[elem].taxCode': req.body.taxCode,
                'taxes.$[elem].percentage': req.body.percentage
              }
            },
            { arrayFilters: [{ 'elem._id': req.params._id }], runValidators: true }
        );
        res.json({message: 'Tax updated'});
    }catch(error){
        console.error(error);
        res.status(500).json({error: 'Internal server error'});
    }
}

async function deleteTaxType(req, res){
    try{
        await baseModel.updateMany({}, {
            $pull: {
                taxTypes: req.params
            }
        });
        res.json({message: 'Category deleted'});
    }catch(error){
        console.error('Error on inserting tax type');
    }
}

// company types
async function createCompanyType(req, res){
    try{
        await baseModel.updateMany({}, {$push: {companyTypes: req.body}}, {new: true});
        res.json({message: 'Company type created'});
    }catch(error){
        console.error('Error on inserting company type');
        res.status(500).json({error: 'Internal server error'});
    }
}

async function updateCompanyType(req, res){
    try{
        const _id = mongoose.Types.ObjectId.createFromHexString(req.params._id);
        await baseModel.updateMany({'companyTypes._id': _id}, {$set: {'companyTypes.$': req.body}});
        res.json({message: 'Company type created'});
    }catch(error){
        console.error('Error on inserting company type');
        res.status(500).json({error: 'Internal server error'});
    }
}

async function deleteCompanyType(req, res){
    try{
        await baseModel.updateMany({}, {
            $pull: {companyTypes: req.params}
        });
        res.json({message: 'Company type deleted'});
    }catch(error){
        console.error('Error on deleting company type');
        res.status(500).json({error: 'Internal server error'});
    }
}

// user types
async function createUserType(req, res){
    try{
        await baseModel.updateMany({}, {$push: {userTypes: req.body}}, {new: true});
        res.json({message: 'User type created'});
    }catch(error){
        console.error('Error on inserting new user type');
        res.status(500).json({error: 'Internal server error'});
    }
}

async function updateUserType(req, res){
    try{
        const _id = mongoose.Types.ObjectId.createFromHexString(req.params._id);
        await baseModel.updateMany({'userTypes._id': _id}, {$set: {'userTypes.$': req.body}});
        res.json({message: 'User type updated'});
    }catch(error){
        console.error(error);
        res.status(500).json({error: 'Internal server error'});
    }
}

async function deleteUserType(req, res){
    try{
        await baseModel.updateMany({}, {
            $pull: {userTypes: req.params}
        });
        res.json({message: 'Company type deleted'});
    }catch(error){
        console.error(error);
        res.status(500).json({error: 'Internal server error'});
    }
}

// access types

// accounting specific
async function getBaseAccouting(req, res){
    try{
        const base = await baseModel.findOne({}, {_id: 0, incomeAccounts: 1, expensesAccounts: 1, retainedEarningAccount: 1});
        res.json(base);
    }catch(error){
        console.error(error);
        res.status(500).json({error: 'Internal server error'});
    }
}

async function updateBaseAccounting(req, res){
    try{
        await baseModel.updateMany({}, req.body);
        res.json({message: 'saved'});
    }catch(error){
        console.error(error);
        res.status(500).json({error: 'Internal server error'});
    }
}

module.exports = {
    readBase,
    getBase,
    createAccountCategory, updateAccountCategory, deleteAccountCategory,
    // createAccountType, updateAccountType, deleteAccountType, // or sub category
    createTaxType, updateTaxType, deleteTaxType,
    createCompanyType, updateCompanyType, deleteCompanyType,
    createUserType, updateUserType, deleteUserType,
    getBaseAccouting, updateBaseAccounting
};