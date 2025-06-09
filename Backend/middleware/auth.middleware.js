const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const blackListTokenModel = require("../models/blackListToken.model");

module.exports.authUser = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const isBlackListed = await blackListTokenModel.findOne({ token: token });
  if (isBlackListed) {
    return res.status(401).json({ message: "Unauthorised" });
  }
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decode._id);
    req.user = user;
    return next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};


