/* eslint-disable no-console */
require('dotenv').config();
const request = require('request');
const { generateScreenshotFilePath } = require('./utilities/utilities');

module.exports = {
  abortOnAssertionFailure: true,
  abortOnElementLocateError: true,
  waitForConditionPollInterval: 500,
  waitForConditionTimeout: 30000,
  suppressWarningsOnMultipleElementsReturned: false,
  asyncHookTimeout: 10000,
  customReporterCallbackTimeout: 20000,
  retryAssertionTimeout: 5000,
  persist_globals: true,
  dsaUsernameTandem: process.env.DSA_USERNAME_TANDEM,
  dsaPasswordTandem: process.env.DSA_PASSWORD_TANDEM,
  gmailPassword: process.env.GMAIL_PASSWORD,
  gmailUsername: process.env.GMAIL_USERNAME,
  elementTimeout: 30000,
  reporter: function reporterFunc(results, cb) { cb(results); },

  visual_regression_settings: {
    generate_screenshot_path: generateScreenshotFilePath,
    latest_screenshots_path: 'vrt/latest',
    latest_suffix: '',
    baseline_screenshots_path: 'vrt/baseline',
    baseline_suffix: '',
    diff_screenshots_path: 'vrt/diff',
    diff_suffix: '',
    threshold: 0.5,
    prompt: false,
    always_save_diff_screenshot: false,
  },

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
    if (browser.currentTest.results.failed > 0 || browser.currentTest.results.errors > 0) {
      request({
        uri: `https://${process.env.BROWSERSTACK_USER}:${process.env.BROWSERSTACK_KEY}@api.browserstack.com/automate/sessions/${browser.sessionId}.json`,
        method: 'PUT',
        form: {
          status: 'failed',
          reason: `Failure: ${browser.currentTest.results.stackTrace}`,
        },
      });
    }
    done();
    browser.quit();
  },
};
