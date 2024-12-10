const failureEmailTemplate = (data) => {
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
          background-color: #fff3f3;
          padding: 15px;
          margin: 20px 0;
          border-radius: 5px;
          border: 1px solid #ffcdd2;
        }
        .troubleshooting {
          background-color: #f8f9fa;
          padding: 15px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #dc3545;
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
          <h2 style="color: #dc3545; margin-bottom: 20px;">Payment Unsuccessful</h2>
          
          <p>Dear ${data.name},</p>
          
          <p>We noticed that your recent donation attempt of ₹${data.amount} was unsuccessful.</p>
          
          <div class="transaction-details">
            <h3 style="margin-top: 0; color: #dc3545;">Transaction Details:</h3>
            <p style="margin: 5px 0;"><strong>Amount:</strong> ₹${data.amount}</p>
            <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${data.txnId}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${data.date}</p>
            <p style="margin: 5px 0;"><strong>Error Message:</strong> ${data.errorMessage || 'Payment processing failed'}</p>
          </div>

          <div class="troubleshooting">
            <h3 style="margin-top: 0; color: #495057;">Common Reasons for Payment Failure:</h3>
            <ul style="padding-left: 20px;">
              <li>Insufficient funds in the account</li>
              <li>Incorrect card details entered</li>
              <li>Bank server timeout</li>
              <li>Transaction limits exceeded</li>
            </ul>
            <p>Please try again with a different payment method or contact your bank if the issue persists.</p>
          </div>

          <a href="${data.retryUrl}" class="button">Try Again</a>
        </div>

        <div class="footer">
          <p>Need assistance? Contact our support team at support@aidcircle.in</p>
          <p>© ${new Date().getFullYear()} AidCircle. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = failureEmailTemplate; 