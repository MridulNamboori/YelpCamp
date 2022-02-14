const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res, next) => {
  try {
    const { email, username, password, confirmPassword } = req.body;
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
      return res.redirect("register");
    }
    if (password !== confirmPassword) {
      req.flash("error", "Passwords don't match! Try again.");
      return res.redirect("register");
    }
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Yelp Camp!");
      res.redirect("/campgrounds");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("register");
  }
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!");
  const redirectUrl = req.session.returnTo || "/campgrounds";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
  req.flash("success", "Goodbye!");
  req.logout();
  res.redirect("/campgrounds");
};
