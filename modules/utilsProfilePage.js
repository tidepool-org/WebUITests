/* eslint-disable linebreak-style */
const moment = require('moment');

/**

 * Reset target range when units selected are mg/dl
 *
 * @param {object} browser - The browser instance.
 * @param {string} userProfile - user profile page object
 * @return {Promise<void>} - A Promise that resolves after range is reset
 * and values are verified correct
 */
exports.resetDefaultMGDL = async (browser, userProfile) => {
  userProfile.click('@reset');
  userProfile.waitForBgValue('70');
  userProfile.waitForBgValue('180');
};
/**

 * Reset target range when units selected are mmol/l
 *
 * @param {object} browser - The browser instance.
 * @param {string} userProfile - user profile page object
 * @return {Promise<void>} - A Promise that resolves after range is reset
 * and values are verified correct
 */
exports.resetDefaultMMOLL = async (browser, userProfile) => {
  userProfile.click('@reset');
  userProfile.waitForBgValue('3.9');
  userProfile.waitForBgValue('10.0');
};
/**

 * Checks if date values are correct for date range slection
 *
 * @param {object} browser - The browser instance.
 * @param {string} userProfile - user profile page object
 * @return {Promise<void>} - A Promise that resolves after dates are verified correct
 */
exports.checkExportDates = async (browser, userProfile, delta) => {
  const today = moment();
  const start = moment().subtract(delta, 'days');
  const end = today;
  const startDate = start.format('YYYY-MM-DD');
  const endDate = end.format('YYYY-MM-DD');
  let startDateValue;
  startDateValue = await userProfile.getValue('@startDate');
  let endDateValue;
  endDateValue = await userProfile.getValue('@endDate');
  startDateValue = moment(startDateValue, 'YYYY-MM-DD');
  endDateValue = moment(endDateValue, 'YYYY-MM-DD');
  const startDiff = Math.abs(start.diff(startDateValue, 'days')) <= 1;
  const endDiff = Math.abs(end.diff(endDateValue, 'days')) <= 1;
  console.log(`sdv${startDiff}`);
  console.log(`edv${endDiff}`);
  await browser.assert.strictEqual(true, startDiff, 'start date set correctly according to offset');
  await browser.assert.strictEqual(true, endDiff, 'end date set correctly according to offset');
};
