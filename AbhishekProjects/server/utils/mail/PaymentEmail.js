const nodemailer = require("nodemailer");
const successEmailTemplate = require("./templates/successEmail");
const failureEmailTemplate = require("./templates/failureEmail");

const sendPaymentEmail = async (emailData) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "anikethakur07@gmail.com",
        pass: "jjqq bfhc hmqv uzjc",
      },
    });

    const templateData = {
      ...emailData,
      logoUrl: "https://mediways-v2.vercel.app/logo.png",
      campaignUrl: `${process.env.FRONTEND_URL}/campaigns/${emailData.campaignLink}`,
      retryUrl: `${process.env.FRONTEND_URL}/campaigns/${emailData.campaignLink}`,
    };

    const mailOptions = {
      from: `"AidCircle" <${process.env.EMAIL_USER}>`,
      to: emailData.email,
      subject: emailData.status === 'success' 
        ? `Thank You for Your Donation of ₹${emailData.amount} - AidCircle` 
        : 'Payment Failed - AidCircle',
      html: emailData.status === 'success' 
        ? successEmailTemplate(templateData)
        : failureEmailTemplate(templateData)
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
    return true;
  } catch (error) {
    console.error('Payment email error:', error);
    return false;
  }
};

module.exports = { sendPaymentEmail }; 