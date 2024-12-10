const verificationEmailTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    .container { 
      max-width: 600px; 
      margin: auto;
      font-family: Arial, sans-serif;
    }
    .button {
      background: #4CAF50;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 4px;
      display: inline-block;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="${data.logoUrl}" alt="AidCircle Logo" style="max-width: 150px;">
    <h2>Verify Your Email Address</h2>
    <p>Dear ${data.username},</p>
    <p>Thank you for registering with AidCircle. Please click the button below to verify your email address:</p>
    <a href="${data.verificationUrl}" class="button">Verify Email</a>
    <p>This link will expire in 24 hours.</p>
    <p>If you didn't create an account, please ignore this email.</p>
  </div>
</body>
</html>
`;

module.exports = verificationEmailTemplate;
