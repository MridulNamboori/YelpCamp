const Joi = require("joi");

module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required().min(0),
    location: Joi.string().required(),
    date: Joi.number(),
    maxBookings: Joi.number().min(1),
    maxVehicles: Joi.number().min(0),
    description: Joi.string().required(),
  }).required(),
  deleteImages: Joi.array(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required(),
  }).required(),
});

module.exports.bookingSchema = Joi.object({
  booking: Joi.object({
    price: Joi.number().min(0),
    image: Joi.array(),
    arrivalDate: Joi.string().required(),
    numStay: Joi.number().required().min(1),
    contact: Joi.number().required(),
    address: Joi.string().required(),
    numMembers: Joi.number().required().min(1),
    numVehicles: Joi.number().required().min(0),
  }).required(),
  name: Joi.object().required(),
  age: Joi.object().required(),
});
