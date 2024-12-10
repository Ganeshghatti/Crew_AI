const successEmailTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .container {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        .header {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          padding: 30px 20px;
          background-color: #ffffff;
          border: 1px solid #e9ecef;
          border-radius: 0 0 8px 8px;
        }
        .transaction-details {
          background-color: #f8f9fa;
          padding: 15px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #0066cc;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #6c757d;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${data.logoUrl}" alt="AidCircle Logo" style="max-width: 150px;">
        </div>
        
        <div class="content">
          <h2 style="color: #28a745; margin-bottom: 20px;">Thank You for Your Donation!</h2>
          
          <p>Dear ${data.name},</p>
          
          <p>We are grateful for your generous contribution of ₹${data.amount}.</p>
          
          <div class="transaction-details">
            <h3 style="margin-top: 0; color: #495057;">Transaction Details:</h3>
            <p style="margin: 5px 0;"><strong>Amount:</strong> ₹${data.amount}</p>
            <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${data.txnId}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${data.date}</p>
            <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${data.paymentMethod}</p>
          </div>

          ${data.taxBenefit ? `
            <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #2e7d32;">Tax Benefit Information</h3>
              <p style="margin: 5px 0;">Your donation is eligible for tax benefits. We will send you the tax exemption certificate separately.</p>
            </div>
          ` : ''}

          <a href="${data.campaignUrl}" class="button">View Campaign</a>
        </div>

        <div class="footer">
          <p>If you have any questions about your donation, please contact us at support@aidcircle.in</p>
          <p>© ${new Date().getFullYear()} AidCircle. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = successEmailTemplate; 