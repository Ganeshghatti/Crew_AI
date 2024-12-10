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
const verificationEmailTemplate = require("../../utils/mail/templates/verificationEmail");
const nodemailer = require("nodemailer");
const { sendVerificationEmail } = require("../../utils/mail/VerfiyEmail");

dotenv.config({ path: path.join(__dirname, "..", "..", "api", ".env") });

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

exports.Register = async (req, res, next) => {
  const userdata = req.body;

  try {
    if (!validator.isEmail(userdata.email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }
    if (!validator.isStrongPassword(userdata.password)) {
      return res.status(400).json({
        error:
          "Weak password. Must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    const existingUser = await userModel.findOne({ email: userdata.email });

    // If user exists in draft mode, update it
    if (existingUser && existingUser.status === "not-created") {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(userdata.password, salt);
      const verificationToken = crypto.randomBytes(32).toString("hex");

      existingUser.username = userdata.username;
      existingUser.password = hash;
      existingUser.phone = userdata.phone;
      existingUser.status = "pending";
      existingUser.verificationToken = verificationToken;
      existingUser.verificationExpires = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      );
      existingUser.createdAt = moment().format("MMMM Do YYYY, h:mm:ss a");

      await existingUser.save();
      await sendVerificationEmail({
        email: existingUser.email,
        username: existingUser.username,
        verificationToken,
      });

      return res.status(200).json({
        message:
          "Registration successful. Please check your email to verify your account.",
        email: existingUser.email,
        username: existingUser.username,
      });
    }

    // If user exists and not in draft mode
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Create new user
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(userdata.password, salt);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = new userModel({
      username: userdata.username,
      email: userdata.email,
      phone: userdata.phone,
      password: hash,
      status: "pending",
      verificationToken,
      verificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: moment().format("MMMM Do YYYY, h:mm:ss a"),
    });

    const newUser = await user.save();
    await sendVerificationEmail({
      email: newUser.email,
      username: newUser.username,
      verificationToken,
    });

    res.status(200).json({
      message:
        "Registration successful. Please check your email to verify your account.",
      email: newUser.email,
      username: newUser.username,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
};

exports.VerifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    console.log(token);
    const user = await userModel.findOne({
      verificationToken: token,
      verificationExpires: { $gt: Date.now() },
    });
    console.log(user);
    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired verification token",
      });
    }

    user.status = "verified";
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    res.status(200).json({
      message: "Verified successfully",
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ error: "Failed to verify email" });
  }
};

exports.Login = async (req, res, next) => {
  const userdata = req.body;

  try {
    const existingUser = await userModel.findOne({ email: userdata.email });

    if (!existingUser || existingUser.status === "not-created") {
      return res.status(400).json({ error: "Wrong email or password" });
    }

    if (existingUser.status === "pending") {
      return res.status(403).json({
        error: "Please verify your email before logging in",
        isVerified: false,
      });
    }

    const match = await bcrypt.compare(
      userdata.password,
      existingUser.password
    );
    if (!match) {
      return res.status(400).json({ error: "Wrong email or password" });
    }

    const token = jwt.sign(
      {
        userId: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
      },
      process.env.USERJWTSECRET
    );

    res.status(200).json({
      email: existingUser.email,
      username: existingUser.username,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

exports.GetMyAccount = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id).select("-password");

    // Get user's transactions with only essential fields
    const transactions = await transactionModel
      .find({ userId: req.user._id })
      .select("amount status txnid paymentDetails createdAt")
      .populate("campaignId", "title link")
      .sort({ createdAt: -1 });

    res.status(200).json({
      user,
      transactions,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
