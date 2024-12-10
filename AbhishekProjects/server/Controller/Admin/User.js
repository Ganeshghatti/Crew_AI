const adminModel = require("../../models/Admin");
const campaignModel = require("../../models/Campaign");
const specialityModel = require("../../models/Speciality");
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

dotenv.config({ path: path.join(__dirname, "..", "..", "api", ".env") });

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

exports.AdminLogin = async (req, res, next) => {
  const { emailId, password } = req.body;

  try {
    if (!validator.isEmail(emailId)) {
      return res.status(400).json({
        error: "enter a valid email",
      });
    }
    const admin = await adminModel.findOne({ email: emailId });

    if (!admin) {
      return res.status(401).json({
        error: "wrong email or password",
      });
    }
    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      // AlertEmail(emailId, "Login to Admin Panel with wrong credentials");
      return res.status(400).json({
        error: "wrong email or password",
      });
    }

    const token = jwt.sign(
      { userId: admin._id, email: admin.email },
      process.env.ADMINJWTSECRET
    );

    res.status(200).json({
      email: admin.email,
      token: token,
    });
  } catch (error) {
    // ErrorEmail(emailId, "Login as Admin");
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.GetProfile = async (req, res, next) => {
  try {
    const admin = await adminModel.findOne(
      { email: req.admin.email },
      "name about"
    );

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.status(200).json({ admin });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    // sendErrorEmail(req.admin.email, "Error fetching admin profile");
    res.status(500).json({ error: "Failed to fetch data" });
  }
};
exports.UpdateProfile = async (req, res, next) => {
  const { name, email, oldpassword, about, newpassword } =
    req.body;

  try {
    const admin = await adminModel.findOne({ email });

    if (newpassword != oldpassword) {
      const match = await bcrypt.compare(oldpassword, admin.password);
      if (!match) {
        return res.status(400).json({
          error: "Wrong password",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newpassword, salt);

      admin.password = hash;
    }

    admin.name = name;
    admin.about = about;
    await admin.save();
    // sendErrorEmail(email, "Admin Password changed");

    res.status(200).json({
      msg: "Password change successful",
    });
  } catch (error) {
    console.error(error);
    // sendErrorEmail(email, "Someone tried to Change Admin Password");
    res.status(500).json({ error: "Failed to change password" });
  }
};
