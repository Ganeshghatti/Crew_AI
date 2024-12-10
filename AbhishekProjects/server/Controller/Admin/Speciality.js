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
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

dotenv.config({ path: path.join(__dirname, "..", "..", "api", ".env") });

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

exports.SpecialityNew = async (req, res, next) => {
  try {
    const { title, desc } = req.body;
    // Generate a proper ID from the title
    const link = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .substring(0, 50);
    const prefix = "SPECIALITY";
    const uniquePart = uuidv4().replace(/-/g, "").substr(0, 6);
    const id = `${prefix}${uniquePart}`;

    // Handle icon upload
    let iconUrl = null;
    if (req.files["icon"]) {
      const iconFile = req.files["icon"][0];
      const iconKey = `specialities/${id}/icon/icon${path.extname(
        iconFile.originalname
      )}`;
      iconUrl = await UploadImgToS3(
        iconKey,
        iconFile.buffer,
        iconFile.originalname
      );
    }

    let wallpaperimgUrl = null;
    if (req.files["wallpaperimg"]) {
      const wallpaperimgFile = req.files["wallpaperimg"][0];
      const wallpaperimgKey = `specialities/${id}/wallpaperimg/wallpaperimg${path.extname(
        wallpaperimgFile.originalname
      )}`;
      wallpaperimgUrl = await UploadImgToS3(
        wallpaperimgKey,
        wallpaperimgFile.buffer,
        wallpaperimgFile.originalname
      );
    }

    // Create a new Speciality document
    const newSpeciality = new specialityModel({
      title,
      id,
      link,
      desc,
      icon: iconUrl,
      wallpaperimg: wallpaperimgUrl,
      content: "",
      createdAt: moment().format("MMMM Do YYYY, h:mm:ss a"),
      lastUpdate: moment().format("MMMM Do YYYY, h:mm:ss a"),
    });

    // Save the new Speciality document to the database
    await newSpeciality.save();

    // Send response back to client
    res.status(200).json({
      message: "Speciality created successfully",
      data: {
        title,
        id,
        desc,
        link,
        icon: iconUrl,
        wallpaperimg: wallpaperimgUrl,
        content: "",
      },
    });
  } catch (error) {
    console.error("Error processing form data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetAllSpecialities = async (req, res, next) => {
  try {
    const specialities = await specialityModel.find(
      {},
      "title icon id desc createdAt lastUpdate link"
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
    console.error("Error fetching speciality details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.UpdateSpecialityDetails = async (req, res) => {
  let { link } = req.params;
  const { title, desc, content, imagesToDelete } = req.body;

  try {
    const speciality = await specialityModel.findOne({ link });

    if (!speciality) {
      return res.status(404).json({ error: "Speciality not found" });
    }
    link = title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .substring(0, 50);

    // Update text fields
    speciality.link = link;
    speciality.title = title;
    speciality.desc = desc;
    speciality.content = content;
    speciality.lastUpdate = moment().format("MMMM Do YYYY, h:mm:ss a");

    // Update icon if present
    if (req.files.icon) {
      // Delete the old icon from S3
      if (speciality.icon) {
        const oldiconKey = speciality.icon.split(".com/")[1];
        await DeleteImgfromS3(oldiconKey);
      }
      const icon = req.files.icon[0];
      const iconKey = `specialities/${speciality.id}/icon/icon${path.extname(
        icon.originalname
      )}`;
      const IconUrl = await UploadImgToS3(
        iconKey,
        icon.buffer,
        icon.originalname
      );
      speciality.icon = IconUrl;
    }

    // Update WallPaper if present
    if (req.files.wallpaperimg) {
      // Delete the old icon from S3
      if (speciality.wallpaperimg) {
        const oldwallpaperimgKey = speciality.wallpaperimg.split(".com/")[1];
        await DeleteImgfromS3(oldwallpaperimgKey);
      }
      const wallpaperimg = req.files.wallpaperimg[0];
      const wallpaperimgKey = `specialities/${
        speciality.id
      }/wallpaperimg/wallpaperimg${path.extname(wallpaperimg.originalname)}`;
      const wallpaperimgUrl = await UploadImgToS3(
        wallpaperimgKey,
        wallpaperimg.buffer,
        wallpaperimg.originalname
      );
      speciality.wallpaperimg = wallpaperimgUrl;
    }

    // Delete images from content
    if (imagesToDelete) {
      const parsedImagesToDelete = JSON.parse(imagesToDelete || "[]");
      for (const imageUrl of parsedImagesToDelete) {
        try {
          const key = new URL(imageUrl).pathname.substring(1);
          await DeleteImgfromS3(key);
        } catch (error) {
          console.error(`Failed to parse URL: ${imageUrl}`, error);
        }
      }
    }

    await speciality.save();

    res
      .status(200)
      .json({ message: "Speciality updated successfully", speciality });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.UploadSpecialityImgtoS3 = async (req, res) => {
  const { link } = req.params;
  try {
    const speciality = await specialityModel.findOne({ link });

    if (!speciality) {
      return res.status(404).json({ error: "Speciality not found" });
    }
    if (req.files.image) {
      const image = req.files.image[0];
      const originalname = image.originalname
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .substring(0, 50);
      const specialityImageKey = `specialities/${speciality.id}/specialityImages/${originalname}`;

      const specialityImageUrl = await UploadImgToS3(
        specialityImageKey,
        image.buffer,
        image.originalname
      );

      speciality.content =
        speciality.content + `<img src="${specialityImageUrl}" />`;
      await speciality.save();

      res
        .status(200)
        .json({ message: "Image uploaded successfully", specialityImageUrl });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.DeleteSpeciality = async (req, res) => {
  const { link } = req.params; // Ensure this matches the route parameter name
  const { password } = req.body;

  try {
    const admin = await adminModel.findOne({ email: req.admin.email });
    if (!admin) {
      return res.status(401).json({ error: "User not found" });
    }
    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      // AlertEmail(emailId, "Login to Admin Panel with wrong credentials");
      return res.status(400).json({
        error: "wrong password",
      });
    }

    const speciality = await specialityModel.findOne({ link });

    if (!speciality) {
      return res.status(404).json({ error: "Speciality not found" });
    }

    // Parse the speciality content to extract image URLs
    const { content } = speciality;
    const dom = new JSDOM(content);
    const images = dom.window.document.getElementsByTagName("img");

    // Delete each image from S3
    for (let img of images) {
      const imgUrl = img.src;
      const Key = imgUrl.split(".com/")[1];
      await DeleteImgfromS3(Key);
    }

    // Delete icon from S3
    if (speciality.icon) {
      const IconKey = speciality.icon.split(".com/")[1];
      await DeleteImgfromS3(IconKey);
    }

    // Delete wallpaper image from S3
    if (speciality.wallpaperimg) {
      const WallPaperImgKey = speciality.wallpaperimg.split(".com/")[1];
      await DeleteImgfromS3(WallPaperImgKey);
    }

    // Delete the speciality from the database
    await specialityModel.findOneAndDelete({ link });

    res
      .status(200)
      .json({ message: "Speciality Deleted successfully", speciality });
  } catch (error) {
    console.error("Error deleting speciality:", error);
    res.status(500).json({ error: "Failed to delete speciality" });
  }
};
