const mongoose = require("mongoose");
function connectToDb() {
  return mongoose
    .connect(process.env.DB_CONNECT)
    .then(() => {
      console.log("Connected to DB");
    })
    .catch((err) => {
      console.error("DB connection error:", err);
    });
}

module.exports = connectToDb;
