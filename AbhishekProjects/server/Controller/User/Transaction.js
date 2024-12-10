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

exports.InitiatePayment = async (req, res, next) => {
  const {
    username,
    email,
    amount,
    amountTip,
    campaignId,
    phone,
    taxExemption,
    isAnonymous,
  } = req.body;

  console.log("Initiating payment with data:", req.body);

  try {
    let user = email ? await userModel.findOne({ email }) : null;

    if (!user) {
      user = new userModel({
        username,
        email,
        phone,
        status: "not-created",
      });
      await user.save();
      console.log("New user created:", user);
    } else {
      console.log("Existing user found:", user);
    }

    const txnid = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const key = process.env.PAYU_MERCHANT_KEY;
    const salt = process.env.PAYU_SALT;
    const productinfo = "Donation";
    const firstname = username;
    const totalAmount = parseInt(amount) + parseInt(amountTip || 0);
    const surl = `${process.env.BACKEND_URL}/user/payment-success`;
    const furl = `${process.env.BACKEND_URL}/user/payment-failure`;

    // PayU hash sequence: key|txnid|amount|productinfo|firstname|email|||||||||||salt
    const hashString = `${key}|${txnid}|${totalAmount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    console.log("Generated hash for payment:", hash);

    // Save transaction
    const transaction = new transactionModel({
      userId: user._id,
      campaignId,
      amount,
      amountTip,
      totalAmount,
      status: "pending",
      txnid,
      taxExemption,
      isAnonymous,
    });
    await transaction.save();
    console.log("Transaction saved:", transaction);

    // Return only required fields
    res.status(200).json({
      key,
      txnid,
      amount: totalAmount,
      productinfo,
      firstname,
      email,
      phone,
      surl,
      furl,
      hash,
    });
  } catch (error) {
    console.error("Error initiating payment:", error);
    res.status(500).json({ error: "Payment initiation failed" });
  }
};

exports.PaymentSuccess = async (req, res) => {
  try {
    const { txnid, mihpayid, mode, bankcode, cardnum, error_Message, amount } =
      req.body;
    console.log("Payment success data received:", req.body);

    // Find and update transaction with essential info only
    const transaction = await transactionModel.findOneAndUpdate(
      { txnid, status: "pending" },
      {
        status: "success",
        paymentDetails: {
          paymentId: mihpayid,
          mode: mode,
          bankName: bankcode || undefined,
          cardLastDigits: cardnum ? cardnum.slice(-4) : undefined,
          failureReason: error_Message,
          timestamp: new Date(),
        },
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!transaction) {
      console.error("Transaction not found or already processed:", txnid);
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failure`);
    }

    console.log("Transaction updated to success:", transaction);

    // Update campaign amount
    const campaign = await campaignModel.findById(transaction.campaignId);
    if (campaign) {
      await campaignModel.findOneAndUpdate(
        { _id: transaction.campaignId },
        {
          $inc: { amountDonated: Number(amount) },
          $set: { lastUpdate: new Date() },
        }
      );
      console.log(
        "Campaign amount updated for campaign link:",
        campaign.link
      );
    }

    // Fetch user details from the transaction
    const user = await userModel.findById(transaction.userId);
    console.log("User details fetched for payment success:", user);

    await sendPaymentEmail({
      status: "success",
      name: user.username,
      email: user.email,
      amount: amount,
      txnId: txnid,
      date: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      paymentMethod: mode,
      campaignLink: campaign.link, // Use campaign link instead of ID
      taxBenefit: campaign.taxBenefit?.isTaxBenefit,
    });

    res.redirect(`${process.env.FRONTEND_URL}/payment-success`);
  } catch (error) {
    console.error("Payment success error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/payment-failure`);
  }
};

exports.PaymentFailure = async (req, res) => {
  try {
    const {
      txnid,
      mihpayid,
      status,
      mode,
      bankcode,
      bank_ref_num,
      error,
      error_Message,
      cardnum,
    } = req.body;

    console.log("Payment failure data received:", req.body);

    // Update transaction status
    const transaction = await transactionModel.findOneAndUpdate(
      { txnid },
      {
        status: "failed",
        paymentId: mihpayid,
        mode: mode,
        bankcode: bankcode,
        bankref: bank_ref_num,
        cardMask: cardnum,
        error: error,
        errorMessage: error_Message,
        payuResponse: req.body,
        updatedAt: new Date(),
      }
    );

    if (!transaction) {
      console.error("Transaction not found for failure:", txnid);
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failure`);
    }

    // Fetch user details from the transaction
    const user = await userModel.findById(transaction.userId);
    console.log("User details fetched for payment failure:", user);

    const campaign = await campaignModel.findById(transaction.campaignId);

    await sendPaymentEmail({
      status: "failed",
      name: user.username,
      email: user.email,
      amount: transaction.amount,
      txnId: txnid,
      date: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      errorMessage: error_Message,
      campaignLink: campaign.link, // Use campaign link instead of ID
    });

    res.redirect(`${process.env.FRONTEND_URL}/payment-failure`);
  } catch (error) {
    console.error("Payment failure error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/payment-failure`);
  }
};
