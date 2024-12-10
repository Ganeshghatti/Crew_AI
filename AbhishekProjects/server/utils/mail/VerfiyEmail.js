const nodemailer = require("nodemailer");
const verificationEmailTemplate = require('./templates/verificationEmail');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "anikethakur07@gmail.com",
    pass: "jjqq bfhc hmqv uzjc",
  },
});

const sendVerificationEmail = async (userData) => {
  try {
    const { email, username, verificationToken } = userData;
    console.log(process.env.FRONTEND_URL);
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    const mailOptions = {
      from: '"AidCircle" <anikethakur07@gmail.com>',
      to: email,
      subject: "Verify Your Email - AidCircle",
      html: verificationEmailTemplate({
        username,
        verificationUrl,
        logoUrl: "https://mediways-v2.vercel.app/logo.png"
      })
    };

    await transporter.sendMail(mailOptions).then(() => {
      console.log("Email sent successfully");
    });
    return true;
  } catch (error) {
    console.error("Email verification error:", error);
    return false;
  }
};

module.exports = { sendVerificationEmail };