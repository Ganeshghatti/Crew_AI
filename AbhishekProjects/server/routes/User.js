const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/User");
const verifyPayUHash = require("../middleware/PayUVerification");

const { Register, Login, GetMyAccount, VerifyEmail } = require("../Controller/User/Auth");
const {
  InitiatePayment,
  PaymentSuccess,
  PaymentFailure,
} = require("../Controller/User/Transaction");
const {
  GetAllSpecialities,
  GetSpecialityDetails,
} = require("../Controller/User/Specialities");
const {
  GetCampaignDetails,
  GetAllCampaigns,
} = require("../Controller/User/Campaigns");
const { GetAllServices } = require("../Controller/User/Services");

router.route("/user/register").post(Register);
router.route("/user/login").post(Login);
router.route("/user/verify-email/:token").post(VerifyEmail);
router.route("/user/my-account").get(requireAuth, GetMyAccount);
router.route("/user/get-all-specialties").get(GetAllSpecialities);
router.route("/user/get-speciality-details/:link").get(GetSpecialityDetails);
router.route("/user/get-all-services").get(GetAllServices);
router.route("/user/get-all-campaigns").get(GetAllCampaigns);
router.route("/user/get-campaign-details/:link").get(GetCampaignDetails);
router.route("/user/payu/hash").post(InitiatePayment);
router
  .route("/user/payment-success")
  .post(express.urlencoded({ extended: true }), verifyPayUHash, PaymentSuccess);
router
  .route("/user/payment-failure")
  .post(express.urlencoded({ extended: true }), verifyPayUHash, PaymentFailure);

module.exports = router;
