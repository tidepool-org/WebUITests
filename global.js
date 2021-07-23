/* eslint-disable no-console */
require('dotenv').config();
const request = require('request');

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
  gmailPassword: process.env.GMAIL_PASSWORD,
  gmailUsername: process.env.GMAIL_USERNAME,
  elementTimeout: 15000,
  reporter: function reporterFunc(results, cb) { cb(results); },

  afterEach(browser, done) {
    browser.getLog('browser', (logEntriesArray) => {
      if (logEntriesArray.length) {
        console.log(`Log Length: ${logEntriesArray}`);
        logEntriesArray.forEach((log) => {
          console.log(
            `[${log.level}] ${log.timestamp} ${log.message}`,
          );
        });
      }
    });
    done();
  },
};
