const dotenv = require("dotenv");
// import dotenv from "dotenv"
dotenv.config();
const express = require("express");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
const connectToDb = require("./db/db");
const userRoutes = require("./routes/user.routes");
const chats = require("./routes/chat.routes");


connectToDb();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/users", userRoutes);
app.use("/chat", chats);

module.exports = app;
