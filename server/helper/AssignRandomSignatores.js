const randomUsers = [
  {
    name: "John Doe",
    position: "Accountant III",
    _id: ObjectId("672c42d8589208b9fa88c0e5"),
  },
  {
    name: "SpongeBob",
    position: "ASSISTANT GENERAL MANAGER",
    _id: ObjectId("672c432e589208b9fa88c146"),
  },
  {
    name: "Carol",
    position: "GENERAL MANAGER",
    _id: ObjectId("672c4390589208b9fa88c1a7"),
  },
  {
    name: "Joyce Anne N. Alimon",
    position: "ASSISTANT GENERAL MANAGER",
    _id: ObjectId("6762332f478273c469c47c96"),
  },
  {
    name: "GOLDAMAIR B. VILLANUEVA",
    position: "Accountant",
    _id: ObjectId("676233c6478273c469c47cff"),
  },
];

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

db.entries.find({}).forEach(function (entry) {
  shuffleArray(randomUsers);

  db.entries.updateOne(
    { _id: entry._id },
    {
      $set: {
        PreparedBy: { name: "Administrator", position: "Administrator", _id: ObjectId("66fb72404d472dab59e66d1a") },
        CertifiedBy: randomUsers[1],
        ReviewedBy: randomUsers[2],
        ApprovedBy1: randomUsers[3],
        ApprovedBy2: randomUsers[4],
        CreatedBy: { name: "Administrator", position: "Administrator", _id: ObjectId("66fb72404d472dab59e66d1a") },
      },
      $unset: {
        ApprovedBy: "", 
        ReceivedBy: "", 
      },
    }
  );
});

//   Directly mongoDb Shell

// List of users with their respective details
// var randomUsers = [
//     { name: "John Doe", position: "Accountant III", _id: ObjectId("672c42d8589208b9fa88c0e5") },
//     { name: "SpongeBob", position: "ASSISTANT GENERAL MANAGER", _id: ObjectId("672c432e589208b9fa88c146") },
//     { name: "Carol", position: "GENERAL MANAGER", _id: ObjectId("672c4390589208b9fa88c1a7") },
//     { name: "Joyce Anne N. Alimon", position: "ASSISTANT GENERAL MANAGER", _id: ObjectId("6762332f478273c469c47c96") },
//     { name: "GOLDAMAIR B. VILLANUEVA", position: "Accountant", _id: ObjectId("676233c6478273c469c47cff") }
//   ];

//   // Function to shuffle the array for randomness
//   function shuffleArray(array) {
//     for (var i = array.length - 1; i > 0; i--) {
//       var j = Math.floor(Math.random() * (i + 1));
//       var temp = array[i];
//       array[i] = array[j];
//       array[j] = temp;
//     }
//   }

//   // Loop through all documents and apply random users to each field
//   db.entries.find({}).forEach(function(entry) {
//     shuffleArray(randomUsers); // Shuffle the user list for each document

//     db.entries.updateOne(
//       { _id: entry._id },
//       {
//         $set: {
//           "PreparedBy": { name: "Administrator", position: "Administrator", _id: ObjectId("66fb72404d472dab59e66d1a") },
//           "CertifiedBy": randomUsers[1],
//           "ReviewedBy": randomUsers[2],
//           "ApprovedBy1": randomUsers[3],
//           "ApprovedBy2": randomUsers[4],
//           "CreatedBy": { name: "Administrator", position: "Administrator", _id: ObjectId("66fb72404d472dab59e66d1a") }, // Or use another user for CreatedBy, e.g., randomUsers[1]
//         },
//       }
//     );
//   });
