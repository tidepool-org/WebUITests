/* eslint-disable linebreak-style */
const fs = require('fs');
const { parse } = require('csv-parse');

async function getReadStreamPromise(filePath) {
  return new Promise((resolve, reject) => {
    const arr = [];
    fs.createReadStream(filePath)
      .pipe(parse({ delimiter: ',', from_line: 2 }))
      .on('data', async (row) => {
        arr.push(row);
        // console.log(resArr)
      })
      .on('end', () => {
        console.log('finished');
        resolve(arr);
      })
      .on('error', (error) => {
        console.log(error.message);
        reject(error);
      });
  });
}
/**
   * check if row in rpm report that days with qualifying data, item[3] ,
   * contains the expected result for the sufficient data column
   * @param {*} hashValue string
   * @returns true if expected result for the sufficient data column is present
   */
function checkSufficiency(item) {
  if (item[3] > 15) {
    return item[4] === 'TRUE';
  }

  return item[4] === 'FALSE';
}

async function checkSufficiencyResult(filePath) {
  const resArr = await getReadStreamPromise(filePath);
  return new Promise((resolve, reject) => {
    try {
      console.log(`resarr${resArr}`);
      const result = resArr.map(checkSufficiency).every(Boolean);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = class checkRPMReportSufficiency {
  /**
   * command method of class checkSupressedNotification
   * @param {*} filePath
   * @returns true or false if hashvalue matches
   */
  async command(filePath) {
    return new Promise((resolve) => {
      /**
       *
       * @returns returns true if rpm exported file column 5 has the
       * correct boolean value based on column 4 else false
       */

      /**
     *asynchronous function checks if clinic id exists
     *and that the suppressed notifications is enabled
     * @returns {string} json body of clinic array object
     */
      async function checkSufficiencyResultRun() {
        try {
          resolve(await checkSufficiencyResult(filePath));
        } catch (error) {
          console.error('Error:', error);
          browser.quit();
        }
      }

      checkSufficiencyResultRun();
    });
  }
};
