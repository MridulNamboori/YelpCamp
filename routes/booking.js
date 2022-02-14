const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const {
  isLoggedIn,
  validateBooking,
  isBookingAuthor,
} = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });
const booking = require("../controllers/booking");

router.get("/booking", isLoggedIn, catchAsync(booking.renderNewBookingForm));

router.post(
  "/booking",
  isLoggedIn,
  upload.array("image"),
  validateBooking,
  catchAsync(booking.createBooking)
);

router.post("/booking/callback", booking.paymentVerification);

router.get(
  "/booking/:bookingId",
  isLoggedIn,
  isBookingAuthor,
  catchAsync(booking.showBooking)
);

router.delete(
  "/booking/:bookingId",
  isLoggedIn,
  isBookingAuthor,
  catchAsync(booking.deleteBooking)
);

module.exports = router;
