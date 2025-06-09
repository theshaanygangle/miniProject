const userModel = require("../models/user.model");
const userService = require("../services/user.service");
const { validationResult } = require("express-validator");
const blackListTokenModel = require("../models/blackListToken.model");
module.exports.registerUser = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(500).json({ error: errors.array() });
  }
  const { username, email, password, role, specialization, fullname } =
    req.body;
  console.log(req.body);

  const hashPassword = await userModel.hashPassword(password);
  const user = await userService.createUser({
    fullname: fullname,
    email: email,
    password: hashPassword,
    role: role,
    specialization: specialization,
    username: username,
  });
  const token = user.generateAuthToken();
  res.status(201).json({ token, user });
};

module.exports.loginUser = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(500).json({ error: errors.array() });
  }

  const { email, password } = req.body;

  let user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  await userModel.findOne({ email }).updateOne({ isAvailable: true });
  user = await userModel.findOne({ email }).select("+password");
  const token = user.generateAuthToken();
  res.cookie("token", token);
  res.status(200).json({ token, user });
};

module.exports.getUserProfile = async function (req, res, next) {
  res.status(200).json({ user: req.user });
};

module.exports.logoutUser = async function (req, res, next) {
  console.log("logout",req.user.email);
   const email =req.user.email;
  res.clearCookie("toekn");
  const token = req.cookies.token || req.headers.authorization.split(" ")[1];
  await blackListTokenModel.create({ token });
  await userModel.findOne({email }).updateOne({ isAvailable: false });
  res.status(200).json({ message: "Logout successfully!!" });
};

module.exports.doctorsList = async function (req, res, next) {
  const errors = validationResult(req);
  console.log("dbfhjkwf");

  if (!errors.isEmpty()) {
    return res.status(500).json({ error: errors.array() });
  }

  const doctors = await userService.getDoctors();
  res.status(200).json({ doctors });
};
