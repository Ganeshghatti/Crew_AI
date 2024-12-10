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

exports.GetAllCampaigns = async (req, res, next) => {
  try {
    const campaigns = await campaignModel.find(
      { status: "public" }, // Filter for public campaigns
      "title id link beneficiaryName thumbnail amount amountDonated taxBenefit"
    );

    res.status(200).json({ campaigns });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.GetCampaignDetails = async (req, res, next) => {
  const { link } = req.params;

  try {
    // Find the campaign
    const campaign = await campaignModel.findOne({ link, status: "public" });
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found or not public" });
    }

    // Fetch successful non-anonymous donations with valid users
    const donations = await transactionModel
      .find({
        campaignId: campaign._id,
        isAnonymous: false,
        status: "success",  // Only include successful donations
      })
      .populate({
        path: 'userId',
        select: 'username',  // Only select username field
        match: { username: { $exists: true } }  // Only include if username exists
      });

    // Filter out donations with null userId and map to usernames
    const donors = donations
      .filter(donation => donation.userId) // Remove donations with null userId
      .map(donation => ({
        username: donation.userId.username,
        amount: donation.amount,
        date: donation.createdAt
      }));

    return res.status(200).json({ 
      campaign,
      donors,
      totalDonors: donations.length,
      anonymousDonations: await transactionModel.countDocuments({
        campaignId: campaign._id,
        isAnonymous: true,
        status: "success"
      })
    });

  } catch (error) {
    console.error("Error fetching campaign details:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
};
