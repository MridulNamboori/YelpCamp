const mongoose = require("mongoose");
const Review = require("./review");
const Booking = require("./bookings");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String,
});
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const opts = { toJSON: { virtuals: true } };
const CampgroundSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    price: Number,
    date: Number,
    description: String,
    location: String,
    maxBookings: {
      type: Number,
      default: 10,
    },
    maxVehicles: {
      type: Number,
      default: 5,
    },
    bookingsLeft: [
      {
        date: {
          type: String,
        },
        seats: {
          type: Number,
          default: 10,
        },
      },
    ],
    vehiclesLeft: [
      {
        date: {
          type: String,
        },
        seats: {
          type: Number,
          default: 10,
        },
      },
    ],
    bookings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Booking",
      },
    ],
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);
CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`;
});

CampgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
    await Booking.deleteMany({
      _id: {
        $in: doc.bookings,
      },
    });
  }
});

module.exports = mongoose.model("Campground", CampgroundSchema);
