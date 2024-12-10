const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3 = require("../../config/aws_s3"); // Update the import statement to correctly match the export
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", "..", "api", ".env") });

const GetSignedUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_STORAGE_BUCKET_NAME,
    Key: key,
  });

  try {
    const url = await getSignedUrl(s3, command, { expiresIn: 60 });
    return url;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw error;
  }
};

module.exports = { GetSignedUrl };
