/* eslint-disable linebreak-style */

/**

 * Checks if a file exists using the browser instance.
 * If the file exists, it asserts that it is true.
 * If the file does not exist, it quits the browser and asserts that it is false.
 *
 * @param {object} browser - The browser instance.
 * @param {string} fileName - The name of the file to check.
 * @param {number} attemptsCheckFileExists - The number of attempts to check if the file exists.
 * @return {Promise<void>} - A Promise that resolves when the file existence has been checked.
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
