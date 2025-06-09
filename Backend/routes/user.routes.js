const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const userController = require("../controller/user.controller");
const { authUser } = require("../middleware/auth.middleware");
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("username")
      .isLength({ min: 3 })
      .withMessage("User name must be at least 3 character long."),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 character long."),
    body("role")
      .isLength({ min: 6 })
      .withMessage("Role must be at least 6 character long."),
    body("fullname")
      .isLength({ min: 6 })
      .withMessage("fullname must be at least 6 character long."),
  ],
  userController.registerUser
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 character long."),
  ],
  userController.loginUser
);

router.get("/profile", authUser, userController.getUserProfile);
router.get("/logout", authUser, userController.logoutUser);
router.get("/doctors-list", authUser, userController.doctorsList);

module.exports = router;
