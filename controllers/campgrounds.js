const Campground = require("../models/campground");
const Booking = require("../models/bookings");
const User = require("../models/user");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");
const { calcDate } = require("../public/javascripts/date");
module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({})
    .populate("popupText")
    .populate({
      path: "bookings",
      populate: {
        path: "user",
      },
    });
  res.render("campgrounds/index", { campgrounds });
};

module.exports.showCampgroundsByName = async (req, res) => {
  const { search } = req.query;
  const regex = new RegExp(escapeRegex(search), "gi");
  const campgrounds = await Campground.find({
    $or: [{ location: regex }, { title: regex }],
  })
    .populate("popupText")
    .populate({
      path: "bookings",
      populate: {
        path: "user",
      },
    });
  if (campgrounds.length === 0) {
    req.flash("error", `Sorry, no Campgrounds found for "${search}" query!`);
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/specifics/name", { campgrounds, search });
};

module.exports.showCampgroundsByPrice = async (req, res) => {
  const { search, sort } = req.query;
  const index = search.indexOf("-");
  const Sort = parseInt(sort) || 1;
  const low = parseInt(search.substring(0, index));
  const high = parseInt(search.substring(index + 1));
  const campgrounds = await Campground.find({
    $and: [{ price: { $lte: high } }, { price: { $gte: low } }],
  })
    .sort({ price: Sort })
    .populate("popupText")
    .populate({
      path: "bookings",
      populate: {
        path: "user",
      },
    });
  if (campgrounds.length === 0) {
    req.flash(
      "error",
      `Sorry, no Campgrounds found in the range of INR ${low}-${high}!`
    );
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/specifics/price", { campgrounds, search });
};

module.exports.showCampgroundsByTime = async (req, res) => {
  const { sort } = req.query;
  const Sort = parseInt(sort) || 1;
  let word = "recent";
  if (Sort === 1) {
    word = "oldest";
  }
  const campgrounds = await Campground.find({})
    .sort({ date: Sort })
    .populate("popupText")
    .populate({
      path: "bookings",
      populate: {
        path: "user",
      },
    });
  if (campgrounds.length === 0) {
    req.flash("error", "Sorry, no Campgrounds found");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/specifics/time", { campgrounds, word });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry;
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.author = req.user._id;
  campground.date = Date.now();
  await campground.save();
  console.log(campground);
  req.flash("success", "Successfully made a new campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
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
  const time = calcDate(campground.date);
  res.render("campgrounds/show", { campground, time });
};

module.exports.showBookings = async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "bookings",
    populate: {
      path: "campground",
    },
  });
  res.render("campgrounds/bookings", { user });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  campground.geometry = geoData.body.features[0].geometry;
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  campground.images.push(...imgs);
  await campground.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "Successfully updated campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  // const campground = await Campground.findById(id);
  // if (campground.images) {
  //   for (let img of campground.images) {
  //     await cloudinary.uploader.destroy(img.filename);
  //   }
  // }
  const campground = await Campground.findById(id);
  for (let book of campground.bookings) {
    let booking = await Booking.findById(book);
    let user = await User.findById(booking.user);
    await User.findByIdAndUpdate(booking.user, {
      $pull: { bookings: book },
    });
    console.log(book);
    await user.save();
  }
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted campground");
  res.redirect("/campgrounds");
};
const escapeRegex = function (text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
