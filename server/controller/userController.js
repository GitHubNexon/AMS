const User = require("../models/userModel");
const EntriesModel = require("../models/EntriesModel");
const { generateHash } = require("../controller/authController");
const { checkBody } = require("../helper/helper");
const { default: mongoose } = require("mongoose");

async function createUser(req, res) {
  try {
    checkBody(["name", "email", "password", "userType"], req, res);

    // Check if the user already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Hash the password and create a new user
    req.body.password = await generateHash(req.body.password);
    const user = new User(req.body);
    await user.save();

    // Respond with the newly created user
    res.status(201).json({ name: user.name, email: user.email, _id: user._id });
  } catch (error) {
    // Handle errors
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function checkEmail(req, res) {
  try {
    const email = req.query.email;
    if (!email) {
      return res
        .status(400)
        .json({ error: "Email query parameter is required" });
    }

    const user = await User.findOne({ email });
    res.json({ exists: !!user });
  } catch (error) {
    console.error("Error checking email existence:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function readUsers(req, res) {
  try {
    const params = {};
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const keyword = req.query.keyword || "";

    if (keyword) {
      params.$or = [
        { name: { $regex: req.query.keyword, $options: "i" } },
        { email: { $regex: req.query.keyword, $options: "i" } },
      ];
    }

    if (req.query.id) {
      if (req.query.id.length !== 24) {
        return res.status(400).json({ error: "Invalid ID format" });
      }
      params._id = req.query.id;
    }

    if (req.query.type) {
      params.userType = req.query.type;
    }

     // ✅ Add filtering for signatoryType
     if (req.query.signatoryType) {
      params.signatoryType = req.query.signatoryType;
    }

    const totalItems = await User.countDocuments(params);
    const users = await User.find(params)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      users,
    });
  } catch (error) {
    console.error("Error reading users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function updateUser(req, res) {
  try {
    // Find the existing user first
    const existingUser = await User.findById(req.params.id);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const updateData = { ...req.body, dateUpdated: new Date() };

    // Handle password separately
    if (updateData.password) {
      // Hash the new password
      updateData.password = await generateHash(updateData.password);
    } else {
      // Remove password from updateData if not provided
      delete updateData.password;
    }

    const allowedUpdates = [
      "name",
      "firstName",
      "middleName",
      "lastName",
      "gender",
      "contactNumber",
      "address",
      "email",
      "tin",
      "userType",
      "password",
      "profileImage",
      "dateUpdated",
      "signatoryType",
    ];
    const updates = Object.keys(updateData);
    const isValidUpdate = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidUpdate) {
      return res.status(400).json({ error: "Invalid updates!" });
    }

    // Update the user with the new data
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser); // Send back the updated user data
  } catch (error) {
    console.error("Error updating user:", error);
    if (error.code === 11000) {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function deleteUser(req, res) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getProfile(req, res) {
  try {
    // Fetch the currently authenticated user from the request
    // const user = await User.findById(req.user._id);

    const userquery = await User.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId.createFromHexString(req.user._id),
        },
      },
      {
        $lookup: {
          from: "bases",
          let: { userType: "$userType" },
          pipeline: [
            { $unwind: "$userTypes" },
            { $match: { $expr: { $eq: ["$userTypes.user", "$$userType"] } } },
            { $project: { _id: 0, access: "$userTypes.access" } },
          ],
          as: "access",
        },
      },
    ]);
    const user = userquery[0];

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Respond with user data including the additional fields, excluding the password
    res.json({
      name: user.name,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      gender: user.gender,
      contactNumber: user.contactNumber,
      address: user.address,
      email: user.email,
      tin: user.tin,
      profileImage: user.profileImage,
      userType: user.userType,
      signatoryType: user.signatoryType,
      access: user.access[0].access, // access are array of codes related to front end routing
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function unlockUser(req, res) {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.lockoutUntil) {
      return res.status(400).json({ error: "User is not locked" });
    }

    user.lockoutUntil = null; // Clear the lockout time
    user.failedAttempts = 0; // Optionally reset failed attempts
    await user.save();

    res.status(200).json({ message: "User unlocked successfully" });
  } catch (error) {
    console.error("Error unlocking user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getAllEntriesByUser(req, res) {
  try {
    const params = {};
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const keyword = req.query.keyword || "";
    const signatoryType = req.query.signatoryType || "";
    const userName = req.query.name || "";

    // Add keyword filter
    if (keyword) {
      params.$or = [
        { EntryType: { $regex: keyword, $options: "i" } },
        { JVNo: { $regex: keyword, $options: "i" } },
        { DVNo: { $regex: keyword, $options: "i" } },
        { CRNo: { $regex: keyword, $options: "i" } },
        { "CertifiedBy.name": { $regex: keyword, $options: "i" } },
        { "PreparedBy.name": { $regex: keyword, $options: "i" } },
        { "CertifiedBy.name": { $regex: keyword, $options: "i" } },
        { "ReviewedBy.name": { $regex: keyword, $options: "i" } },
        { "ApprovedBy1.name": { $regex: keyword, $options: "i" } },
        { "ApprovedBy2.name": { $regex: keyword, $options: "i" } },
      ];
    }

    if (signatoryType && userName) {
      const matchingUsers = await User.find({
        name: { $regex: userName, $options: "i" },
      });

      const matchingUserIds = matchingUsers.map((user) => user._id.toString());

      // Build dynamic filter for signatoryType (e.g., CreatedBy, PreparedBy, etc.)
      params[`${signatoryType}._id`] = { $in: matchingUserIds };
    }

    const totalItems = await EntriesModel.countDocuments(params);
    const entries = await EntriesModel.find(params)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      entries,
    });
  } catch (error) {
    console.error("Error fetching entries:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  createUser,
  updateUser,
  readUsers,
  deleteUser,
  checkEmail,
  getProfile,
  unlockUser,
  getAllEntriesByUser,
};
