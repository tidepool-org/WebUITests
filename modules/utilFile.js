/* eslint-disable linebreak-style */

/**
   * function checkFile,check if file exists and executes assertion statement based on result
   * @param {object} browser
   * @param {string} fileName
   * @param {number} attemptsCheckFileExists
   * @returns {void}
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
