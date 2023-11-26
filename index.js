const express = require("express");
const cors = require("cors");
// const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.POST || 2737;
const userdb = process.env.USER_DB;
const passdb = process.env.PASS_DB;
const secretToken = process.env.TOKEN;


app.use(express.json());
// app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:2737"],
    credentials: true,
  })
);



app.get("/", (req, res) => {
 res.send("Tour Guide Server is Running...");
});

app.listen(port, () => {
 console.log(`Server Is Running On http://${port}`);
});