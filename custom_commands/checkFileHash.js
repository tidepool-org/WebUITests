/* eslint-disable linebreak-style */
const fs = require('fs');
const crypto = require('crypto');

function sleep(millis) {
  return new Promise((resolve) => setTimeout(resolve, millis));
}

module.exports = class checkFileHash {
  /**
   * command method of class checkSupressedNotification
   * @param {*} hashValue string
   * @returns true or false if hashvalue matches
   */
  command(hashValue) {
    return new Promise((resolve) => {
      /**
       *
       * @returns @{string} file hash
       */
      const getHash = (path) => new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const rs = fs.createReadStream(path);
        rs.on('error', reject);
        rs.on('data', (chunk) => hash.update(chunk));
        rs.on('end', () => resolve(hash.digest('hex')));
      });
      /**
     *asynchronous function checks if clinic id exists
     *and that the suppressed notifications is enabled
     * @returns {string} json body of clinic array object
     */
      async function getHashRun() {
        try {
          await sleep(10000);
          const fileHashValue = await getHash('/Users/hello/Downloads/RPM Report (05-13-2024 - 06-11-2024).csv');

          console.log(fileHashValue === hashValue);
          resolve(fileHashValue === '7d36d0458146b10b34a226205b8659f6a0748dd6b6f3135460741eb42226ae0d');
          console.log('hi');
        } catch (error) {
          console.error('Error:', error);
        }
      }

      getHashRun();
    });
  }
};
