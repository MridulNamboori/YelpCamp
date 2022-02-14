const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const users = require("../controllers/users");
const { isLoggedInAlready } = require("../middleware");

router
  .route("/register")
  .get(isLoggedInAlready, users.renderRegister)
  .post(catchAsync(users.register));

router
  .route("/login")
  .get(isLoggedInAlready, users.renderLogin)
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.login
  );

router.get("/logout", users.logout);

module.exports = router;