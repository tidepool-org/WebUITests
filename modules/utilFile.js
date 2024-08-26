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

exports.checkFileExistence = async (browser, fileName, attemptsCheckFileExists) => {
  try {
    console.log(fileName);
    const exists = await browser.checkFileExists(attemptsCheckFileExists, fileName);
    browser.assert.strictEqual(exists, true, 'file exists ');
  } catch (error) {
    console.log(error);
    browser.quit();
    browser.assert.strictEqual(false, true, 'file exists ');
  }
};
