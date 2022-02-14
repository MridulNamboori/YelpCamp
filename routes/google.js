const express = require("express");
const router = express.Router();
const passport = require("passport");
const { redirection } = require("../controllers/google");
require("../passport-setup");

router.get(
  "/",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  redirection
);

module.exports = router;
