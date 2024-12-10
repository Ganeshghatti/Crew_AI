const adminModel = require("../../models/Admin");
const campaignModel = require("../../models/Campaign");
const specialityModel = require("../../models/Speciality");
const serviceModel = require("../../models/Services");
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
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

dotenv.config({ path: path.join(__dirname, "..", "..", "api", ".env") });

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

exports.ServiceNew = async (req, res, next) => {
  try {
    const { title, desc } = req.body;
    // Generate a proper ID from the title
    const link = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .substring(0, 50);
    const prefix = "SERVICE";
    const uniquePart = uuidv4().replace(/-/g, "").substr(0, 6);
    const id = `${prefix}${uniquePart}`;

    // Handle icon upload
    let iconUrl = null;
    if (req.files["icon"]) {
      const iconFile = req.files["icon"][0];
      const iconKey = `services/${id}/icon/icon${path.extname(
        iconFile.originalname
      )}`;
      iconUrl = await UploadImgToS3(
        iconKey,
        iconFile.buffer,
        iconFile.originalname
      );
    }

    // Create a new Service document
    const newService = new serviceModel({
      title,
      id,
      link,
      desc,
      icon: iconUrl,
      createdAt: moment().format("MMMM Do YYYY, h:mm:ss a"),
      lastUpdate: moment().format("MMMM Do YYYY, h:mm:ss a"),
    });

    // Save the new service document to the database
    await newService.save();

    // Send response back to client
    res.status(200).json({
      message: "Service created successfully",
      data: {
        title,
        id,
        link,
        desc,
        icon: iconUrl,
      },
    });
  } catch (error) {
    console.error("Error processing form data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetAllServices = async (req, res, next) => {
  try {
    const services = await serviceModel.find(
      {},
      "title icon id desc createdAt lastUpdate link"
    );

    res.status(200).json({ services });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.UpdateServiceDetails = async (req, res) => {
  let { id } = req.params;
  const { title, desc } = req.body;

  try {
    const service = await serviceModel.findOne({ id });

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    link = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .substring(0, 50);

    // Update text fields
    service.link = link;
    service.title = title;
    service.desc = desc;
    service.lastUpdate = moment().format("MMMM Do YYYY, h:mm:ss a");

    // Update icon if present
    if (req.files.icon) {
      // Delete the old icon from S3
      if (service.icon) {
        const oldiconKey = service.icon.split(".com/")[1];
        await DeleteImgfromS3(oldiconKey);
      }
      const icon = req.files.icon[0];
      const iconKey = `services/${service.id}/icon/icon${path.extname(
        icon.originalname
      )}`;
      const IconUrl = await UploadImgToS3(
        iconKey,
        icon.buffer,
        icon.originalname
      );
      service.icon = IconUrl;
    }
    await service.save();

    res
      .status(200)
      .json({ message: "Service updated successfully", service });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.DeleteService = async (req, res) => {
  const { id } = req.params; // Ensure this matches the route parameter name

  try {
    const service = await serviceModel.findOne({ id });

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Delete icon from S3
    if (service.icon) {
      const IconKey = service.icon.split(".com/")[1];
      await DeleteImgfromS3(IconKey);
    }

    // Delete the service from the database
    await serviceModel.findOneAndDelete({ id });

    res
      .status(200)
      .json({ message: "Service Deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ error: "Failed to delete service" });
  }
};
