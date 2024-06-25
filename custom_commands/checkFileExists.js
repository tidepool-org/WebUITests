/* eslint-disable linebreak-style */
const fs = require('fs');
const crypto = require('crypto');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
module.exports = class checkFileExists {
  /**
   * command method of class checkSupressedNotification
   * @param {*} hashValue string
   * @returns true if file exists otherwise false
   */
  command(attempts, fileName) {
    return new Promise((resolve, reject) => {
      browser.executeScript(
        `browserstack_executor: {"action": "fileExists","arguments":{"file_name":"${fileName}"}}`,
        [],
        (result) => {
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
      if (--attempts <= 0) throw err; // give up
      return delay(1000).then(() => checkFileExists(attempts, browser, fileName));
    });
  }
};
