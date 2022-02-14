const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const ejs = require("ejs");
const catchAsync = require("./utils/catchAsync");

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URL
);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

module.exports.sendResetEmail = catchAsync(async (email, token, username) => {
  const accessToken = process.env.ACCESS_TOKEN;
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.USER_EMAIL,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });
  const url = "http://localhost:3000/reset-password?token=" + token;
  const data = await ejs.renderFile("./views/emails/resetPassword.ejs", {
    url,
    username,
  });
  //console.log(url);
  await transport.sendMail({
    from: `YelpCamp<${process.env.USER_EMAIL}>`,
    to: email,
    subject: "Reset Your Password",
    text: `Click on this link to reset your password 
    ${url}`,
    html: data,
  });
});
