const axios = require("axios");
const moment = require("moment");
const nodemailer = require("nodemailer");
const express = require("express");

const ErrorEmail = async (email, action) => {
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
      subject: "Action Failed",
      html: `
        <p><b>Alert!!</b></p>
        <p>A user with <br/> email : ${
          email ? email : "Email not available"
        } attempted to ${action ? action : "No message provided"} </p>
        <p>But action Failed because of internal server error</p>
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

module.exports = { ErrorEmail };
