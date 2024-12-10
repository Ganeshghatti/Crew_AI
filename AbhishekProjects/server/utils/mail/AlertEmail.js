const axios = require("axios");
const moment = require("moment");
const nodemailer = require("nodemailer");
const express = require("express");

const AlertEmail = async (email, action) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "anikethakur07@gmail.com",
        pass: "jjqq bfhc hmqv uzjc",
      },
    });

    const mailOptions = {
      from: "anikethakur07@gmail.com",
      to: "anikethakur07@gmail.com, ganeshghatti6@gmail.com",
      subject: "Failed Attempt",
      html: `
        <p>Alert</p>
        <p>A user with email ${
          email ? email : "Email not available"
        } attempted to ${action ? action : "No message provided"} </p>
              <p>Please investigate and take necessary actions.</p>
        <p>Warm regards,</p>
        <p>AidCircle Notification System</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return true;
  } catch (error) {
    return false;
  }
};

module.exports = { AlertEmail };
