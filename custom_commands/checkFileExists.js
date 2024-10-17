/* eslint-disable linebreak-style */

function delay(ms) {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}
module.exports = class checkFileExists {
  /**
   * command method of class checkSupressedNotification , checks if a file exists
   * @param {number} attempts - number of attempts to rerun function
   * @param {string} fileName - name of file
   * @returns true if file exists otherwise false
   */

  command(attempts, fileName) {
    let results = false;
    return new Promise((resolve, reject) => {
      async function checkFileRun() {
        /* eslint-disable no-await-in-loop */
        for (let i = 0; i < attempts; i++) {
          try {
            console.log(`${i}filecheck`);
            const exists = await browser.executeScript(
              `browserstack_executor: {"action": "fileExists","arguments":{"fileName":"${fileName}"}}`,
            );
            results = exists;
            if (exists) { break; }
          } catch (error) {
            console.error('Error:', error);
            browser.quit();
          }
          /* eslint-enable no-await-in-loop */
        }
        resolve(results);
      }
      checkFileRun();
    });
  }
};
