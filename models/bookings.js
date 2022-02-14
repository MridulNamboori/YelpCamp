const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String,
});
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_400");
});
const opts = { toJSON: { virtuals: true } };

const BookingSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    person: [
      {
        name: {
          type: String,
          required: true,
        },
        age: {
          type: Number,
          required: true,
        },
      },
    ],
    images: [ImageSchema],
    price: {
      type: Number,
      required: true,
    },
    arrivalDate: {
      type: String,
      required: true,
    },
    numStay: {
      type: Number,
      required: true,
    },
    contact: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    numMembers: {
      type: Number,
      required: true,
    },
    numVehicles: {
      type: Number,
      required: true,
    },
    campground: {
      type: Schema.Types.ObjectId,
      ref: "Campground",
    },
  },
  opts
);
module.exports = mongoose.model("Booking", BookingSchema);
