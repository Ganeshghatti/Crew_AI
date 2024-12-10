const { S3Client } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");
const path = require("path");
const process = require("process");

dotenv.config({ path: path.join(__dirname, "..", "api", ".env") });

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION_NAME,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  },
});

console.log("S3 Client created successfully");

module.exports = s3;
