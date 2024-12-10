const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/Admin");

const {
  AdminLogin,
  GetProfile,
  UpdateProfile,
} = require("../Controller/Admin/User");
const {
  CampaignNew,
  GetAllCampaigns,
  GetCampaignDetails,
  UpdateCampaignDetails,
  UploadCampaignImgtoS3,
  GetCampaignImgPresignedUrl,
  DeleteCampaign,
  GetAllTimeTransactions,
} = require("../Controller/Admin/Campaign");

const {
  SpecialityNew,
  GetAllSpecialities,
  GetSpecialityDetails,
  UpdateSpecialityDetails,
  UploadSpecialityImgtoS3,
  DeleteSpeciality,
} = require("../Controller/Admin/Speciality");

const {
  GetAllServices,
  ServiceNew,
  UpdateServiceDetails,
  DeleteService,
} = require("../Controller/Admin/Service");

const {
  GetTransactions,
  SearchTransactions,
} = require("../Controller/Admin/Transaction");

// Configure multer for memory storage
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.route("/admin/login").post(AdminLogin);
router.route("/admin/get-profile").get(requireAuth, GetProfile);
router.route("/admin/update-profile").post(requireAuth, UpdateProfile);


// Campaign Routes
router.post(
  "/admin/campaign-new",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "carouselImages", maxCount: 5 },
  ]),
  CampaignNew
);
router.route("/admin/get-all-campaigns").get(GetAllCampaigns);
router.route("/admin/get-campaign-details/:link").get(GetCampaignDetails);
router.route("/admin/campaign-all-time-transactions/:link").get(GetAllTimeTransactions);

router.put(
  "/admin/update-campaign-details/:link",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "qrCode", maxCount: 1 },
    { name: "carouselImages", maxCount: 5 },
    { name: "documentImages", maxCount: 5 },
  ]),
  UpdateCampaignDetails
);
router.post(
  "/admin/upload-campaign-image/:link",
  upload.fields([{ name: "image", maxCount: 1 }]),
  UploadCampaignImgtoS3
);
router
  .route("/admin/campaign-delete/:link")
  .delete(requireAuth, DeleteCampaign);

// router.post(
//   "/admin/get-campaign-img-presigned-url/:link",
//   GetCampaignImgPresignedUrl
// );


// Speciality Routes

router.post(
  "/admin/speciality-new",
  upload.fields([
    { name: "icon", maxCount: 1 },
    { name: "wallpaperimg", maxCount: 1 },
  ]),
  SpecialityNew
);
router.route("/admin/get-all-specialties").get(GetAllSpecialities);
router.route("/admin/get-speciality-details/:link").get(GetSpecialityDetails);

router.put(
  "/admin/update-speciality-details/:link",
  upload.fields([
    { name: "icon", maxCount: 1 },
    { name: "wallpaperimg", maxCount: 1 },
  ]),
  UpdateSpecialityDetails
);
router.post(
  "/admin/upload-speciality-image/:link",
  upload.fields([{ name: "image", maxCount: 1 }]),
  UploadSpecialityImgtoS3
);
router
  .route("/admin/speciality-delete/:link")
  .delete(requireAuth, DeleteSpeciality);


// Service Routes
router.post(
  "/admin/service-new",
  upload.fields([{ name: "icon", maxCount: 1 }]),
  ServiceNew
);
router.route("/admin/get-all-services").get(GetAllServices);

router.put(
  "/admin/update-service-detail/:id",
  upload.fields([{ name: "icon", maxCount: 1 }]),
  UpdateServiceDetails
);
router.route("/admin/service-delete/:id").delete(requireAuth, DeleteService);

router.get("/admin/transactions", GetTransactions);
router.get("/admin/transactions/search", SearchTransactions);

module.exports = router;
