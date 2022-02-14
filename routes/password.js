const express = require("express");
const router = express.Router();
const { isLoggedInAlready } = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const password = require("../controllers/password");

router.get(
  "/forgot-password",
  isLoggedInAlready,
  password.renderForgotPasswordForm
);

router.post("/forgot-password", catchAsync(password.createForgotPasswordMail));

router.get(
  "/reset-password",
  isLoggedInAlready,
  catchAsync(password.renderResetPasswordForm)
);

router.post("/reset-password", catchAsync(password.resetPassword));

module.exports = router;
