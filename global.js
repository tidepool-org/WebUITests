require('dotenv').config();

module.exports = {
  abortOnAssertionFailure: true,
  abortOnElementLocateError: true,
  waitForConditionPollInterval: 500,
  waitForConditionTimeout: 5000,
  suppressWarningsOnMultipleElementsReturned: false,
  asyncHookTimeout: 10000,
  customReporterCallbackTimeout: 20000,
  retryAssertionTimeout: 5000,
  persist_globals: true,
  dsaUsernameTandem: process.env.DSA_USERNAME_TANDEM,
  dsaPasswordTandem: process.env.DSA_PASSWORD_TANDEM,
  elementTimeout: 5000,
  reporter: function reporterFunc(results, cb) { cb(results); },
};
