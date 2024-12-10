const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", "..", "api", ".env") });

const s3 = new S3Client({ region: process.env.AWS_S3_REGION_NAME });

const UploadImgToS3 = async (key, fileBuffer, fileName) => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_STORAGE_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: getContentType(fileName),
  });

  try {
    const response = await s3.send(command);
    const url = `https://${process.env.AWS_STORAGE_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION_NAME}.amazonaws.com/${key}`;
    return url;
  } catch (err) {
    console.error("Error uploading to S3:", err);
    throw err;
  }
};

const getContentType = (fileName) => {
  const ext = path.extname(fileName).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    default:
      return "application/octet-stream"; // Default content type
  }
};

module.exports = { UploadImgToS3 };
