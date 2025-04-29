// for mongoDb Shell

db.entries.updateMany(
    {
      $or: [
        { createdAt: { $type: "string" } },
        { updatedAt: { $type: "string" } },
      ]
    },
    [
      {
        $set: {
          createdAt: {
            $cond: {
              if: { $ifNull: ["$createdAt", false] },
              then: { $toDate: "$createdAt" },
              else: "$createdAt"
            }
          },
          updatedAt: {
            $cond: {
              if: { $ifNull: ["$updatedAt", false] },
              then: { $toDate: "$updatedAt" },
              else: "$updatedAt"
            }
          },
          CRDate: {
            $cond: {
              if: { $ifNull: ["$CRDate", false] },
              then: { $toDate: "$CRDate" },
              else: "$CRDate"
            }
          },
          DVDate: {
            $cond: {
              if: { $ifNull: ["$DVDate", false] },
              then: { $toDate: "$DVDate" },
              else: "$DVDate"
            }
          },
          JVDate: {
            $cond: {
              if: { $ifNull: ["$JVDate", false] },
              then: { $toDate: "$JVDate" },
              else: "$JVDate"
            }
          }
        }
      }
    ]
  );
  

  db.entries.find().forEach(doc => {
    let updatedFields = {};
    
    if (typeof doc._id === "string") {
        updatedFields._id = ObjectId(doc._id);
    }
    
    function convertToObjectId(obj) {
        for (let key in obj) {
            if (obj[key] && typeof obj[key] === "object") {
                convertToObjectId(obj[key]);
            } else if (key === "_id" && typeof obj[key] === "string" && /^[a-f\d]{24}$/i.test(obj[key])) {
                obj[key] = ObjectId(obj[key]);
            }
        }
    }
    
    convertToObjectId(doc);
    
    db.entries.updateOne(
        { _id: doc._id },
        { $set: doc }
    );
});