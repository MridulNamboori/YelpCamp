const crypto = require("crypto");
const resetToken = require("../models/resetToken");
const User = require("../models/user");
const mailer = require("../sendMail");

module.exports.renderForgotPasswordForm = (req, res) => {
  // render reset password page
  // not checking if user is authenticated
  // so that you can use as an option to change password too
  res.render("users/forgot-password");
};

module.exports.createForgotPasswordMail = async (req, res) => {
  const { email } = req.body;
  // not checking if the field is empty or not
  // check if a user existss with this email
  const user = await User.findOne({ email: email });
  console.log(user);
  if (user) {
    if (user.provider === "google") {
      req.flash(
        "error",
        "User exists with Google account. Try resetting your google account password and then login using it."
      );
      res.redirect("/forgot-password");
    } else {
      // user exists and is not with google
      // generate token
      const token = crypto.randomBytes(32).toString("hex");
      // add that to database
      await resetToken({ token: token, email: email }).save();
      // send an email for verification
      mailer.sendResetEmail(email, token, user.username);
      res.render("templates/thanks-for-reset", {
        email,
      });
    }
  } else {
    req.flash("error", "Requested email is not registered with YelpCamp");
    res.redirect("/forgot-password");
  }
};

module.exports.renderResetPasswordForm = async (req, res) => {
  // first check for a valid token
  // and if the token is valid send the reset password page to show the option to change password
  const token = req.query.token;
  if (token) {
    const check = await resetToken.findOne({ token: token });
    if (check) {
      // token verified
      // send reset-password page
      // this will render the form to reset password
      // sending token too to grab email later
      res.render("users/reset-password", { email: check.email, token });
    } else {
      req.flash("error", "Token Tampered or Expired!");
      res.redirect("/forgot-password");
    }
  } else {
    // doesnt have a token
    req.flash(
      "error",
      "Security token missing! Try resetting your password again."
    );
    res.redirect("/forgot-password");
  }
};

module.exports.resetPassword = async (req, res) => {
  // get passwords
  const { password, confirmPassword, email, token } = req.body;
  if (
    !(
      password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/) &&
      password.match(/([0-9])/) &&
      password.match(/([!,@,#,$,%,^,&,*,?,_,~])/) &&
      password.length > 7
    )
  ) {
    req.flash(
      "error",
      "Password doesn't meet the mentioned criteria! Try again."
    );
    return res.redirect(`/reset-password?token=${token}`);
  }
  if (password !== confirmPassword) {
    req.flash("error", "Passwords don't match! Try again.");
    return res.redirect(`/reset-password?token=${token}`);
  } else {
    // encrypt the password
    const oldUser = await User.findOne({
      email: email,
    });
    const newUser = new User({
      email: "qwertyuioplkjhgfd@gmail.com",
      username: "sample",
    });
    const registeredUser = await User.register(newUser, password);
    const updatedUser = await User.findByIdAndUpdate(oldUser._id, {
      salt: registeredUser.salt,
      hash: registeredUser.hash,
    });
    await updatedUser.save();
    await User.findByIdAndDelete(registeredUser._id);
    req.flash("success", "Password Reseted Successfully!");
    res.redirect("/login");
  }
};
