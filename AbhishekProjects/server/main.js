const express = require("express");
const connectdatabase = require("./config/database");
const cors = require("cors");
const bodyParser = require("body-parser");
const adminroutes = require("./routes/Admin");
const userroutes = require("./routes/User");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "api", ".env") });
const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(adminroutes);
app.use(userroutes);

connectdatabase();

module.exports = app;
