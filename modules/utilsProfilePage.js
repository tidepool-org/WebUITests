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
  let currentLow;
  await userProfile.getText('@low', (result) => {
    console.log('result', result);
    currentLow = parseInt(result.value, 10);
    console.log(currentLow);
  });
  let currentHigh;
  await userProfile.getText('@high', (result) => {
    console.log('result', result);
    currentHigh = parseInt(result.value, 10);
    console.log(currentHigh);
  });
  browser.assert.strictEqual(70, currentLow, 'low reset to default 70');
  browser.assert.strictEqual(180, currentHigh, 'high reset to default 180');
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
  let currentLow;
  await userProfile.getText('@low', (result) => {
    console.log('result', result);
    currentLow = parseFloat(result.value, 10);
    console.log(currentLow);
  });
  let currentHigh;
  await userProfile.getText('@high', (result) => {
    console.log('result', result);
    currentHigh = parseFloat(result.value, 10);
    console.log(currentHigh);
  });
  browser.assert.strictEqual(3.9, currentLow, 'low reset to default 3.9');
  browser.assert.strictEqual(10.0, currentHigh, 'high reset to default 10.0');
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
  console.log(`sdv${startDateValue}`);
  await browser.assert.strictEqual(startDateValue, String(startDate), 'start date set correctly according to offset');
  await browser.assert.strictEqual(endDateValue, String(endDate), 'end date set correctly according to offset');
};
