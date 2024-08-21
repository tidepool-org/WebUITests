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
    let attempts1 = attempts;
    return new Promise((resolve, reject) => {
      browser.executeScript(
        `browserstack_executor: {"action": "fileExists","arguments":{"file_name":"${fileName}"}}`,
        [],
        (result) => {
          console.log(`res${result}`);
          if (result.value) {
            resolve(result.value);
          } else {
            console.log(`fail${attempts}`);
            reject(Error);
          }
        },
      );
    }).catch((err) => {
      console.log(`att${attempts}${err}`);
      attempts1 -= 1;
      if (attempts1 <= 0) throw err; // give up
      return delay(1000).then(() => checkFileExists(attempts, browser, fileName));
    });
  }
};
