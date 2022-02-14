module.exports.redirection = (req, res) => {
  // Successful authentication, redirect home.
  req.flash("success", "Welcome to Yelp Camp!");
  const redirectUrl = req.session.returnTo || "/campgrounds";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};
