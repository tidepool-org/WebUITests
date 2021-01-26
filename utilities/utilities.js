const otplib = require('otplib');
require('dotenv').config();

function getToken() {
  const secret = process.env.OTP_SECRET;
  const token = otplib.authenticator.generate(secret);
  return token;
}

module.exports = {
  getToken,
};
