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

exports.GetAllSpecialities = async (req, res, next) => {
  try {
    const specialities = await specialityModel.find(
      {},
      "title icon id desc link"
    );

    res.status(200).json({ specialities });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.GetSpecialityDetails = async (req, res, next) => {
  const { link } = req.params;

  try {
    const speciality = await specialityModel.findOne({ link });
    if (!speciality) {
      return res.status(404).json({ message: "Speciality not found" });
    }
    return res.status(200).json({
      speciality,
    });
  } catch (error) {
    console.log("Error fetching speciality details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
