/* eslint-disable linebreak-style */
exports.checkFile = async (browser, fileName, attemptsCheckFileExists) => {
  try {
    console.log(fileName);
    const exists = await browser.checkFileExists(attemptsCheckFileExists, fileName);
    browser.assert.strictEqual(exists, true, 'exported rpm csv file exists ');
  } catch (error) {
    console.log(error);
    browser.quit();
    browser.assert.strictEqual(false, true, 'exported rpm csv file exists ');
  }
};
