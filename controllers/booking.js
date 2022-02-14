const Campground = require("../models/campground");
const User = require("../models/user");
const Booking = require("../models/bookings");
const { cloudinary } = require("../cloudinary");
const checksum_lib = require("../Paytm/checksum");
const config = require("../Paytm/config");
const https = require("https");
const qs = require("querystring");
const { calcDateInString } = require("../public/javascripts/date");

module.exports.renderNewBookingForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id).populate({
    path: "bookings",
    populate: {
      path: "user",
    },
  });
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("booking/new", { campground });
};

module.exports.createBooking = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  const { maxBookings, maxVehicles, bookingsLeft, vehiclesLeft } = campground;
  const {
    numStay,
    numVehicles,
    numMembers,
    arrivalDate: date,
  } = req.body.booking;
  const { name, age } = req.body;
  const result1 = checkSeats(
    maxBookings,
    bookingsLeft,
    numStay,
    date,
    numMembers
  );
  if (result1 !== true) {
    req.flash("error", `Booking Alert: ${result1}`);
    return res.redirect(`/campgrounds/${id}/booking`);
  }
  const result2 = checkSeats(
    maxVehicles,
    vehiclesLeft,
    numStay,
    date,
    numVehicles
  );
  if (result2 !== true) {
    req.flash("error", `Vehicle Alert: ${result2}`);
    return res.redirect(`/campgrounds/${id}/booking`);
  }
  reserveSeats(bookingsLeft, numStay, date, numMembers, 0);
  reserveSeats(vehiclesLeft, numStay, date, numVehicles, 0);
  const booking = new Booking({
    user: req.user._id,
    price: campground.price * numMembers * numStay,
    arrivalDate: date,
    numStay: numStay,
    contact: req.body.booking.contact,
    address: req.body.booking.address,
    numMembers: numMembers,
    numVehicles: numVehicles,
  });
  booking.campground = campground._id;
  booking.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  for (i = 0; i < numMembers; ++i) {
    if (numMembers == 1) {
      booking.person.push({
        name: name.name,
        age: age.age,
      });
    } else {
      booking.person.push({
        name: name.name[i],
        age: age.age[i],
      });
    }
  }
  campground.bookings.push(booking);
  const user = await User.findById(req.user._id);
  user.bookings.push(booking);
  await user.save();
  await booking.save();
  await campground.save();

  var params = {};
  params["MID"] = config.PaytmConfig.mid;
  params["WEBSITE"] = config.PaytmConfig.website;
  params["CHANNEL_ID"] = "WEB";
  params["INDUSTRY_TYPE_ID"] = "Retail";
  params["ORDER_ID"] = "TEST_" + new Date().getTime();
  params["CUST_ID"] = user.username.replace(/\s/g, "");
  params["TXN_AMOUNT"] = booking.price;
  params[
    "CALLBACK_URL"
  ] = `http://localhost:3000/campgrounds/${campground._id}/booking/callback`;
  params["EMAIL"] = user.email;
  params["MOBILE_NO"] = booking.contact;
  checksum_lib.genchecksum(
    params,
    config.PaytmConfig.key,
    function (err, checksum) {
      var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
      // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production

      var form_fields = "";
      for (var x in params) {
        form_fields +=
          "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
      }
      form_fields +=
        "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";

      res.writeHead(200, { "Content-Type": "text/html" });
      res.write(
        '<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' +
          txn_url +
          '" name="f1">' +
          form_fields +
          '</form><script type="text/javascript">document.f1.submit();</script></body></html>'
      );
      res.end();
    }
  );

  // req.flash(
  //   "success",
  //   `Successfully created your booking for ${campground.title}!`
  // );
  // res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.paymentVerification = (req, res) => {
  // Route for verifiying payment

  var body = "";

  req.on("data", function (data) {
    body += data;
  });

  req.on("end", function () {
    var html = "";
    var post_data = qs.parse(body);

    // received params in callback
    console.log("Callback Response: ", post_data, "\n");

    // verify the checksum
    var checksumhash = post_data.CHECKSUMHASH;
    // delete post_data.CHECKSUMHASH;
    var result = checksum_lib.verifychecksum(
      post_data,
      config.PaytmConfig.key,
      checksumhash
    );
    console.log("Checksum Result => ", result, "\n");

    // Send Server-to-Server request to verify Order Status
    var params = { MID: config.PaytmConfig.mid, ORDERID: post_data.ORDERID };

    checksum_lib.genchecksum(
      params,
      config.PaytmConfig.key,
      function (err, checksum) {
        params.CHECKSUMHASH = checksum;
        post_data = "JsonData=" + JSON.stringify(params);

        var options = {
          hostname: "securegw-stage.paytm.in", // for staging
          // hostname: 'securegw.paytm.in', // for production
          port: 443,
          path: "/merchant-status/getTxnStatus",
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": post_data.length,
          },
        };

        // Set up the request
        var response = "";
        var post_req = https.request(options, function (post_res) {
          post_res.on("data", function (chunk) {
            response += chunk;
          });

          post_res.on("end", function () {
            console.log("S2S Response: ", response, "\n");

            var _result = JSON.parse(response);
            if (_result.STATUS == "TXN_SUCCESS") {
              res.send("payment sucess");
            } else {
              res.send("payment failed");
            }
          });
        });

        // post the data
        post_req.write(post_data);
        post_req.end();
      }
    );
  });
};

module.exports.showBooking = async (req, res) => {
  const { id, bookingId } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  const booking = await Booking.findById(bookingId)
    .populate("user")
    .populate("campground");
  if (!booking) {
    req.flash("error", "Cannot find your campground booking!");
    return res.redirect(`/campgrounds/${id}`);
  }
  const departureDate = reserveSeats(
    campground.bookingsLeft,
    booking.numStay,
    booking.arrivalDate,
    booking.numMembers,
    1
  );
  res.render("booking/show", { booking, departureDate });
};

module.exports.deleteBooking = async (req, res) => {
  const { id, bookingId } = req.params;
  const booking = await Booking.findById(bookingId);
  const campground = await Campground.findById(id);
  const d1 = Date.now();
  const d2 = new Date(booking.arrivalDate).getTime();
  if (d1 >= d2) {
    req.flash(
      "error",
      "You cannot cancel your campground booking now as per YelpCamp cancellation policy!"
    );
    return res.redirect(`/campgrounds/bookings`);
  }
  let { bookingsLeft, vehiclesLeft } = campground;
  let {
    numStay: numDays,
    arrivalDate: date,
    numMembers,
    numVehicles,
  } = booking;
  reserveSeats(bookingsLeft, numDays, date, -numMembers, 0);
  reserveSeats(vehiclesLeft, numDays, date, -numVehicles, 0);
  await Campground.findByIdAndUpdate(id, { $pull: { bookings: bookingId } });
  if (booking.images) {
    for (let img of booking.images) {
      await cloudinary.uploader.destroy(img.filename);
    }
  }
  const user = await User.findById(req.user._id);
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { bookings: bookingId },
  });
  await Booking.findByIdAndDelete(bookingId);
  await campground.save();
  await user.save();
  req.flash(
    "success",
    "Booking successfully cancelled! Your refund will be processed within 5 working days."
  );
  res.redirect(`/campgrounds/bookings`);
};

const reserveSeats = function (arr, numDays, date, numMember, change) {
  let day = parseInt(date.substring(3, 5));
  let Month = parseInt(date.substring(0, 2));
  let Year = parseInt(date.substring(6));
  let numMembers = parseInt(numMember);
  if (change === 1) {
    numDays += 1;
  }
  const dates = calcDateInString(day, Month, Year, numDays);
  if (change === 1) {
    return dates[dates.length - 1];
  }
  for (i = 1; i <= numDays; ++i) {
    let Day = dates[i - 1];
    let Check = arr.findIndex((obj) => obj.date === Day);
    if (Check === -1) {
      arr.push({
        date: Day,
        seats: numMembers,
      });
    } else {
      arr[Check].seats += numMembers;
    }
  }
};

const checkSeats = function (max, arr, numDays, date, numMember) {
  let day = parseInt(date.substring(3, 5));
  let Month = parseInt(date.substring(0, 2));
  let Year = parseInt(date.substring(6));
  let numMembers = parseInt(numMember);
  const setDate = new Date(date);
  const setTime = setDate.getTime();
  const currentDate = Date.now();
  if (setTime - currentDate < 0) {
    return `Please select a slot after the today's slot`;
  }
  const dates = calcDateInString(day, Month, Year, numDays);
  for (i = 1; i <= numDays; ++i, ++day) {
    let Day = dates[i - 1];
    let Check = arr.find((n) => n.date === Day);
    if (Check === undefined) {
      if (max < numMembers) {
        return `The slots exceed the maximum number of seats for one day i.e., ${max}! Please try some other campground or reduce the number of slots required.`;
      }
      continue;
    }
    if (max - Check.seats >= numMembers) {
      continue;
    } else {
      return `Only ${
        max - Check.seats
      } slots left on ${Day}! Try some other slots.`;
    }
  }
  return true;
};
