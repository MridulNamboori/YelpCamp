const mongoose = require("mongoose");
const cities = require("./cities");
const Description = require("./descriptions");
const Image = require("./images");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 150; i++) {
    const price = Math.floor(Math.random() * 700) + 1500;
    const maxBookings = Math.floor(Math.random() * 5) + 10;
    const maxVehicles = Math.floor(Math.random() * 5) + 5;
    const randomDescription = Math.floor(Math.random() * 20);
    const randomImage1 = Math.floor(Math.random() * 48);
    const randomImage2 = Math.floor(Math.random() * 48);
    const days = Math.floor(Math.random() * 10) + 16;
    const camp = new Campground({
      //YOUR USER ID
      author: "6187a3f60101432e8079c8e3",
      location: `${cities[i].city}, ${cities[i].state}, ${cities[i].country}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description: Description[randomDescription].description,
      price,
      maxVehicles,
      maxBookings,
      date: Date.now() - 1000 * 60 * 60 * 24 * days,
      geometry: {
        type: "Point",
        coordinates: [cities[i].lng, cities[i].lat],
      },
      images: [
        {
          url: Image[randomImage1].url,
          filename: Image[randomImage1].filename,
        },
      ],
    });
    if (randomImage1 !== randomImage2) {
      camp.images.push({
        url: Image[randomImage2].url,
        filename: Image[randomImage2].filename,
      });
    }
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
