const otplib = require('otplib');
require('dotenv').config();
const path = require('path');

function getToken() {
  const secret = process.env.OTP_SECRET;
  const token = otplib.authenticator.generate(secret);
  return token;
}

function generateScreenshotFilePath(nightwatchClient, basePath, fileName) {
  const moduleName = nightwatchClient.currentTest.module;
  const environment = nightwatchClient.options.environmentName;

  return path.join(process.cwd(), basePath, moduleName, environment, fileName);
}

module.exports = {
  getToken, generateScreenshotFilePath,
};
