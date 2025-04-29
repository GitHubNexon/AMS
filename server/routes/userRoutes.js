const express = require("express");
const router = express.Router();
const {
  createUser,
  updateUser,
  deleteUser,
  readUsers,
  getProfile,
  unlockUser,
  getAllEntriesByUser,
} = require("../controller/userController");
const { authenticateToken } = require("../controller/authController");
const { checkBody, asyncHandler } = require("../helper/helper");
const User = require("../models/userModel"); // Make sure this path is correct
  
/**
 * reads user collection
 * has 3 params
 * id: search for user id
 * keyword: performs regex on user's name or email
 * type: search for user with the userType
 * empty params will return all users
 */
router.get(
  "/",
  authenticateToken,
  asyncHandler(async (req, res) => {
    await readUsers(req, res);
  })
);

/**
 * creates new user
 * add Authorization in header with Bearer <token>
 * request body: {
        "name": "<string>",
        "email": "<string>",
        "password": "<string>",
        "userType": "<string>"
    }
 */
router.post(
  "/",
  authenticateToken,
  asyncHandler(async (req, res) => {
    checkBody(["name", "email", "password", "userType"], req, res);
    await createUser(req, res);
  })
);

/**
 * update user info
 * :d = mongodb id
 * request body: {
 *      "name": "<string>",
 *      "email": "<string>",
 *      "password": "<string>",
 *      "userType": "<string>"
 * }
 * request body fields are optional but will check for duplicate email
 */
router.patch(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => await updateUser(req, res))
);

router.delete(
  "/:id",
  authenticateToken,
  asyncHandler(async (req, res) => await deleteUser(req, res))
);

router.get(
  "/email",
  authenticateToken,
  asyncHandler(async (req, res) => res.json(req.user.email))
);

router.get("/profile", authenticateToken, async (req, res) => {
  try {
    await getProfile(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Unlock user
router.patch(
  "/:id/unlock",
  authenticateToken,
  asyncHandler(async (req, res) => await unlockUser(req, res))
); 

//get all entries by signatories Type
router.get(
  "/entries/signatories",
  authenticateToken,
  asyncHandler(async (req, res) => {
    await getAllEntriesByUser(req, res);
  })
);

module.exports = router;
