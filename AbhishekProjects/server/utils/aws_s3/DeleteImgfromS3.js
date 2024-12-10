const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../../config/aws_s3"); // Update the import statement to correctly match the export
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", "..", "api", ".env") });

const DeleteImgfromS3 = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_STORAGE_BUCKET_NAME,
    Key: key,
  });
  try {
    await s3.send(command);
  } catch (err) {
    console.error("Error deleting to S3:", err);
    throw err;
  }
};

module.exports = { DeleteImgfromS3 };
