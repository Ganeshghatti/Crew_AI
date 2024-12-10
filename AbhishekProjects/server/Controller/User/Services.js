const adminModel = require("../../models/Admin");
const campaignModel = require("../../models/Campaign");
const specialityModel = require("../../models/Speciality");
const serviceModel = require("../../models/Services");
const userModel = require("../../models/User");
const transactionModel = require("../../models/Transactions");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const moment = require("moment");
const { AlertEmail } = require("../../utils/mail/AlertEmail");
const { ErrorEmail } = require("../../utils/mail/ErrorEmail");
const { UploadImgToS3 } = require("../../utils/aws_s3/UploadImgToS3");
const { DeleteImgfromS3 } = require("../../utils/aws_s3/DeleteImgfromS3");
const { GetSignedUrl } = require("../../utils/aws_s3/GetSignedUrl");
const { v4: uuidv4 } = require("uuid");
const dotenv = require("dotenv");
const process = require("process");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const s3 = require("../../config/aws_s3");
const crypto = require("crypto");
const { sendPaymentEmail } = require("../../utils/mail/PaymentEmail");

dotenv.config({ path: path.join(__dirname, "..", "..", "api", ".env") });

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

exports.GetAllServices = async (req, res, next) => {
    try {
      const services = await serviceModel.find({}, "title icon id desc link");
  
      res.status(200).json({ services });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  };