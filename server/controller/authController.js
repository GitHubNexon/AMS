require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const  { baseModel } = require('../models/baseModel');
const cookieParser = require("cookie-parser");

/**
 * authenticantes user account
 * returns json web token and user info
 */
// server/authController.js

const MAX_FAILED_ATTEMPTS = 3; // Maximum number of failed attempts before lockout
const LOCKOUT_DURATION = 1 * 60 * 1000; // Lockout duration in milliseconds (15 minutes)

async function authenticate(req, res) {
  try {
    const data = req.body;

    let findUser = await User.findOne({ email: data.email }).exec();

    if (!findUser) {
      return res.status(404).json({ error: "Account not found" });
    }
    let userInfo = findUser.toObject();

    // Check if the user is currently locked out
    if (findUser.lockoutUntil && findUser.lockoutUntil > Date.now()) {
      return res.status(403).json({
        error: `Account is locked. Try again after ${new Date(
          findUser.lockoutUntil
        ).toLocaleString()}`,
      });
    }

    // Check if password matches
    if (!(await compareHash(data.password, userInfo.password))) {
      // Increment failed attempts
      findUser.failedAttempts += 1;

      // If failed attempts exceed the maximum allowed, set the lockout time
      if (findUser.failedAttempts >= MAX_FAILED_ATTEMPTS) {
        findUser.lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION);
      }

      await findUser.save(); // Save the changes (failedAttempts and lockoutUntil)
      return res.status(401).json({ error: "Invalid password" });
    }
    // If login is successful, reset failedAttempts and lockoutUntil
    findUser.failedAttempts = 0;
    findUser.lockoutUntil = null;

    await findUser.save(); // Save the changes (failedAttempts and lockoutUntil)

    // get user access
    const getaccess = await baseModel.findOne({'userTypes.user': userInfo.userType});
    const access = getaccess.userTypes.filter(a=>a.user === userInfo.userType)[0].access;

    const token = generateToken({ ...userInfo, profileImage: "", access: access});
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    res.json({
      token,
      name: userInfo.name,
      email: userInfo.email,
      _id: userInfo._id,
      userType: userInfo.userType,
      access: access
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * middeware for token verification in request headers
 * will bind user data to request on successfull verification
 * will terminate and return the request with status code 401 on unsuccessful verification
 */
async function authenticateToken(req, res, next) {
  const token = req.cookies.token; // Get token from cookies
  const base = await baseModel.findOne();
  if (!token) return res.status(401).json({ error: "Access token required" });
  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err)
      return res.status(401).json({ error: "Access token expired or invalid" });
    req.user = user;
    next();
  });
}

/**
 * transfrom an object into jwt token
 * @param {object} payload
 * @returns jwt token
 */
function generateToken(payload) {
  try {
    const token = jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: process.env.TOKEN_EXPIRATION,
    });
    return token;
  } catch (error) {
    throw new Error("Error generating token");
  }
}
// logout

function logoutToken(req, res) {
  //+
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
}

/**
 * validates a jwt token and returns its data
 * @param {jwt token} token
 * @returns object {valid: boolean, decoded jwt/error message}
 */
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * transforms password string to hash
 * @param {string} password
 * @returns hash string
 */
async function generateHash(password) {
  try {
    const hash = await bcrypt.hash(
      password,
      parseInt(process.env.SALT_ROUNDS, 10)
    );
    return hash;
  } catch (error) {
    console.error(error);
    throw new Error("Error generating hash");
  }
}

/**
 * check if given string password matches the given hash
 * @param {string} password
 * @param {string} hash
 * @returns boolean
 */
async function compareHash(password, hash) {
  try {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (error) {
    console.error(error);
    throw new Error("Error comparing hash");
  }
}

// creates default user
async function createDefaultUser() {
  try {
    console.log('creating default user..........');
    const defaultUser = {
      name: "Administrator",
      email: "admin@mail.com",
      password: "P@ssword321",
      userType: "Administrator",
      signatoryType: ["PreparedBy", "CreatedBy", "CertifiedBy", "ReviewedBy", "ApprovedBy1", "ApprovedBy2",]
    };
    // check email duplicate
    const check = await User.find({ email: defaultUser.email });
    if (check.length > 0) {
      return;
    }
    // converts password on request to hash
    defaultUser.password = await generateHash(defaultUser.password);
    const user = new User(defaultUser);
    await user.save();
    console.log("default user created");
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  authenticate,
  generateHash,
  authenticateToken,
  createDefaultUser,
  logoutToken,
  verifyToken,
  compareHash,
  cookieParser,
};
