/* eslint-disable linebreak-style */
const fs = require('fs');

const getFile = (fileName) => new Promise((resolve) => {
  resolve(browser.executeScript(`browserstack_executor: {"action": "getFileContent", "arguments": {"fileName": "${fileName}"}}`).then((content) => {
    // Decode the content to Base64 and write to a file
    const decodedData = Buffer.from(content, 'base64');
    fs.writeFile('rpm.csv', decodedData, (err) => {
      console.log(err);
      // browser.quit();
    });
  }));
});

module.exports = class checkFileContents {
  /**
   * command method of class checkFileContents, downloads file to local
   * so that it can opened and read
   * @param {string} fileName - name of file
   * @returns transfers latest downloaded file from remote server to local machine
   */
  command(fileName) {
    return new Promise((resolve) => {
      /**
       *
       * @returns writes file to local
       */
      async function getFileRun() {
        try {
          resolve(await getFile(fileName));
        } catch (error) {
          console.error('Error:', error);
          browser.quit();
        }
      }

      getFileRun();
    });
  }
};
