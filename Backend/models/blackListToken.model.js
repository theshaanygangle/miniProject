const mongoose = require("mongoose");
const blsckListTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    defalut: Date.now,
    expires: 86400,
  },
});
module.exports=mongoose.model("BlackListToken",blsckListTokenSchema);
