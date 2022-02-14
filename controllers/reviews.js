const Campground = require("../models/campground");
const Review = require("../models/review");
const { calcDate } = require("../public/javascripts/date");

module.exports.createReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash("success", "Created new review!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.renderEditForm = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author")
    .populate({
      path: "bookings",
      populate: {
        path: "user",
      },
    });
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  const review = await Review.findById(req.params.reviewId);
  if (!review) {
    req.flash("error", "Cannot find that review!");
    return res.redirect(`/campgrounds/${req.params.id}`);
  }
  const time = calcDate(campground.date);
  res.render("reviews/edit", { campground, time, review });
};

module.exports.updateReview = async (req, res) => {
  const { reviewId } = req.params;
  const review = await Review.findByIdAndUpdate(reviewId, {
    ...req.body.review,
  });
  await review.save();
  req.flash("success", "Successfully updated review!");
  res.redirect(`/campgrounds/${req.params.id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted review");
  res.redirect(`/campgrounds/${id}`);
};
