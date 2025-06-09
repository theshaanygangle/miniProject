const userModel = require("../models/user.model");

module.exports.createUser = async ({
  username,
  email,
  password,
  role,
  specialization,
  fullname,
}) => {


  if (!username || !email || !password || !role || !fullname) {
    throw new Error("All fields are required");
  }
  const user = userModel.create({
    username,
    fullname,
    role,
    specialization,
    email,
    password,
  });
  return user;
};


module.exports.getDoctors = async () => {
  const doctors = await userModel.find({ role: "doctor" });
  return doctors;
};
