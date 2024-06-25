/* eslint-disable linebreak-style */
const fs = require('fs');
const crypto = require('crypto');
const {parse}  = require('csv-parse');
const { hasUncaughtExceptionCaptureCallback } = require('process');
async function getReadStreamPromise(filePath) {
  return new Promise((resolve, reject) => {
  let arr=[]
  fs.createReadStream(filePath)
  .pipe(parse({ delimiter: ',', from_line: 2 }))
  .on('data', async (row) => {
    arr.push(row);
    //console.log(resArr)
  })
  .on('end', () => {
    console.log('finished');
    resolve(arr)
  })
  .on('error', (error) => {
    console.log(error.message);
    reject(error)
  });
  
  })
}
function checkSufficiency(item) {
  if (item[3]  > 15){
    return item[4] === 'TRUE'
  }
  else{
    return item[4] === 'FALSE'
  } 
}



module.exports = class checkRPMReportSufficiency{
  /**
   * command method of class checkSupressedNotification
   * @param {*} filePath 
   * @returns true or false if hashvalue matches
   */
  async command(filePath) {
    return new Promise((resolve,reject) => {
      /**
       *
       * @returns returns true if rpm exported file column 5 has the correct boolean value based on column 4 else false
       */
      async function checkSufficiencyResult(){
        
        let resArr = await getReadStreamPromise(filePath)
        return new Promise((resolve, reject) => {
          try {
            
            console.log('resarr'+resArr)
            const result = resArr.map(checkSufficiency).every(Boolean);
            resolve(result);
          }
          catch(error){
            reject(error)
          }
          
  
        });

      } 
      /**
     *asynchronous function checks if clinic id exists
     *and that the suppressed notifications is enabled
     * @returns {string} json body of clinic array object
     */
      async function checkSufficiencyResultRun() {
        try {
          
            resolve(await checkSufficiencyResult());
        } catch (error) {
          console.error('Error:', error);
        }
      }
  
      checkSufficiencyResultRun();
    });
  }
};
