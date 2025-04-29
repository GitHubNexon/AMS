require('dotenv').config();
const mongoose = require("mongoose");
const { insertDefaultValues } = require('./baseModel');
const { createDefaultUser } = require('../controller/authController');
const fs = require('fs');
const path = require('path'); // To handle file paths
const Account = require('./AccountModel');
const SubledgerReference = require('./subledgerReferenceModel');

// Will reset the database !! include address database here
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  // .then(()=>insertDefaultValues())
  // .then(createDefaultUser)
  // .then(() => {
  //   // Delete all documents in the Account collection
  //   return Account.deleteMany({});
  // })
  // .then(() => {
  //   console.log('Existing accounts deleted. Inserting default accounts...');
    
  //   // Use absolute path to avoid path issues
  //   const filePath = path.join(__dirname, '../helper/accounts_updated.json');
  //   const filePath2 = path.join(__dirname, '../helper/subaccounts_updated.json');
    
  //   return new Promise((resolve, reject) => {
  //     fs.readFile(filePath, 'utf-8', (err, data) => {
  //       if (err) {
  //         console.error("Failed to read file");
  //         return reject(err);
  //       }
  //       const jsonData = JSON.parse(data);
  //       // const formattedData = jsonData.map(doc => ({
  //       //   ...doc,
  //       //   _id: new mongoose.Types.ObjectId(doc._id.$oid),
  //       //   parentAccount: doc.parentAccount ? new mongoose.Types.ObjectId(doc.parentAccount.$oid) : null,
  //       //   dateAdded: new Date(doc.dateAdded.$date),
  //       // }));
  //       // Insert accounts
  //       Account.deleteMany({})
  //       .then(()=>{
  //         Account.insertMany(jsonData)
  //         .then(() => {
  //           console.log("Default accounts imported");
  //           fs.readFile(filePath2, 'utf-8', (err, data)=>{
  //             if(err){
  //               console.error("Failed to read file");
  //               return reject(err);
  //             }
  //             SubledgerReference.deleteMany({})
  //             .then(()=>{
  //               const jsonData = JSON.parse(data);
  //               SubledgerReference.insertMany(jsonData)
  //               .then(()=>{
  //                 console.log("Default subledgers imported");
  //                 resolve();
  //               })
  //               .catch((err)=>{
  //                 console.error('Error inserting subledgers: ', err);
  //                 reject(err);
  //               });
  //             })
  //             .catch((err)=>{
  //               console.error("Error deleting subledbers: ", err);
  //             });
  //           });
  //         })
  //         .catch((err) => {
  //           console.error('Error inserting accounts: ', err);
  //           reject(err);
  //         });
  //       })
  //       .catch((err)=>{
  //         console.error('Error on deleting accounts', err);
  //         reject(err);
  //       });
        
  //     });
  //   });
  // })
  .then(() => {
    console.log('Seed complete!');
  })
  .catch((error) => {
    console.error("something's wrong");
  })
  .finally(() => {
    mongoose.connection.close();
    process.exit();
  });
