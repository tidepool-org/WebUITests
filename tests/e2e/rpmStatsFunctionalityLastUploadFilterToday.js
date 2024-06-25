/* eslint-disable linebreak-style */
require('../../utilities/seleniumKeepAlive');
const fs = require('fs');
const {parse}  = require('csv-parse');
const  moment  = require('moment');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const checkFileExists = (attempts, browser, fileName) => new Promise((resolve, reject) => {
  browser.executeScript(
    'browserstack_executor: {"action": "fileExists","arguments":{"file_name":"RPM Report (05-15-2024 - 06-13-2024).csv"}}',
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

module.exports = {
  '@tags': ['rpm', 'clinician', 'parallel'],
  'Clinician User Logs in with Existing Credentials'(browser) {
    const loginPage = browser.page.loginPage();
    const clinicianUsername = browser.globals.clinicianUsername;
    const clinicianPassword = browser.globals.clinicianPassword;
    loginPage.loadPage();
    loginPage.userLogin(clinicianUsername, clinicianPassword);
  },
  'Clinic workspace selection'(browser) {
    const clinicWorkspacePage = browser.page.clinicWorkspacePage();
    const clinicWorkspace = clinicWorkspacePage.section.clinicWorkspace;
    clinicWorkspace.waitForElementVisible('@title', browser.globals.elementTimeout);
    clinicWorkspace.click('@goToWorkspace');
    
  },
  
  'Clinic workspace rpm stats export | lastUploadFilterToday | patientFilterSearch:autodex \
  | rpmExportStartDateSelected:40 days from today ': async function (browser) {
    //setup config
    const clinicPatientListPage = browser.page.clinicPatientListPage();
    const clinicPatientList = clinicPatientListPage.section.patientList;
    let today = moment().format('MM-DD-YYYY')
    let daysFromToday = 40
    let startDate = moment().subtract(daysFromToday,"days").format('MMMM D, YYYY')
    let endDate = moment(startDate,'MMM D, YYYY').add(29,"days").format('MMMM D, YYYY')
    let startDateFile = moment().subtract(daysFromToday,"days").format('MM-DD-YYYY')
    let endDateFile = moment(startDateFile,'MM-DD-YYYY').add(29,"days").format('MM-DD-YYYY')
    let fileName = `RPM Report (${startDateFile} - ${endDateFile}).csv`
    const attemptsCheckFileExists = 10;
    const filePath = './rpm.csv'

    //filter criteria and rpm report submit

  
    clinicPatientList.lastUploadFilterToday();
    clinicPatientList.patientFilterSearch("autodex");
    let startDateObj = moment(startDate, 'MMMM D, YYYY')
    if (moment().startOf('month').diff(startDateObj.startOf('month'),"months") === 2){
      clinicPatientList.rpmExportClickCalendarStartDatePreviousMonth(startDate)
    }
    else{
      clinicPatientList.rpmExportClickCalendarStartDate(startDate)
    }
    
    //validate file export results
    try {
      const exists = await browser.checkFileExists(attemptsCheckFileExists, fileName);
      browser.assert.strictEqual(exists, true, 'exported rpm csv file exists ');
    } catch (error) {
      console.log(error);
      browser.assert.strictEqual(false, true, 'exported rpm csv file exists ');
    }
    const written =await browser.checkFileContents(fileName)
    console.log('write'+written)
    const sufficient = await browser.checkRPMExportSufficiency(filePath);
    console.log('suff'+sufficient)
    browser.assert.strictEqual(sufficient, true, 'exported rpm csv file sufficiency is valid ');

  },
  'Clinic workspace rpm stats export | lastUploadFilterToday | patientFilterSearch:autodex \
  | rpmExportEndDateSelected:10 days from today  ': async function (browser) {
    //setup config
    const clinicPatientListPage = browser.page.clinicPatientListPage();
    const clinicPatientList = clinicPatientListPage.section.patientList;
    let today = moment().format('MM-DD-YYYY')
    let daysFromToday = 10
    let endDate = moment().subtract(daysFromToday,"days").format('MMMM D, YYYY')
    let endDateFile = moment().subtract(daysFromToday,"days").format('MM-DD-YYYY')
    let startDateFile = moment(endDate,'MMM D, YYYY').subtract(29,"days").format('MM-DD-YYYY')
    let fileName = `RPM Report (${startDateFile} - ${endDateFile}).csv`
    const attemptsCheckFileExists = 10;
    const filePath = './rpm.csv'

    //filter criteria and rpm report submit

  
    clinicPatientList.lastUploadFilterToday();
    clinicPatientList.patientFilterSearch("autodex");

    let endDateObj = moment(endDate, 'MMMM D, YYYY')
    if (moment().startOf('month').diff(endDateObj.startOf('month'),"months") === 2){
      clinicPatientList.rpmExportClickCalendarEndDatePreviousMonth(endDate)
    }
    else{
      clinicPatientList.rpmExportClickCalendarEndDate(endDate)
    }
    //validate file export results
    try {
      const exists = await browser.checkFileExists(attemptsCheckFileExists, fileName);
      browser.assert.strictEqual(exists, true, 'exported rpm csv file exists ');
    } catch (error) {
      console.log(error);
      browser.assert.strictEqual(false, true, 'exported rpm csv file exists ');
    }
    const sufficient = await browser.checkRPMExportSufficiency(filePath);
    browser.assert.strictEqual(sufficient, true, 'exported rpm csv file sufficiency is valid');

  },
  'Clinic workspace rpm stats export | lastUploadFilterToday | patientFilterSearch:autodex \
  | rpmExportStartDateSelected:57 days from today | rpmExportEndDateSelected:start date + 15 days ': async function (browser) {
    //setup config
    const clinicPatientListPage = browser.page.clinicPatientListPage();
    const clinicPatientList = clinicPatientListPage.section.patientList;
    let today = moment().format('MM-DD-YYYY')
    let daysFromToday = 57
    let dateRange = 15
    let startDate = moment().subtract(daysFromToday,"days").format('MMM D, YYYY')
    let endDate = moment(startDate,'MMM D, YYYY').add(dateRange,"days").format('MMM D, YYYY')
    let startDateFile = moment().subtract(daysFromToday,"days").format('MM-DD-YYYY')
    let endDateFile = moment(startDateFile,'MM-DD-YYYY').add(dateRange,"days").format('MM-DD-YYYY')
    let fileName = `RPM Report (${startDateFile} - ${endDateFile}).csv`
    const attemptsCheckFileExists = 10;
    const filePath = './rpm.csv'

    //filter criteria and rpm report submit

  
    clinicPatientList.lastUploadFilterToday();
    clinicPatientList.patientFilterSearch("autodex");

    clinicPatientList.rpmExportTypeInputStartAndEndDate(startDate,endDate);
    //validate file export results
    try {
      const exists = await browser.checkFileExists(attemptsCheckFileExists, fileName);
      browser.assert.strictEqual(exists, true, 'exported rpm csv file exists ');
    } catch (error) {
      console.log(error);
      browser.assert.strictEqual(false, true, 'exported rpm csv file exists ');
    }
    const sufficient = await browser.checkRPMExportSufficiency(filePath);
    browser.assert.strictEqual(sufficient, true, 'exported rpm csv file sufficiency is valid');

  },
  'Clinic workspace rpm stats export | lastUploadFilterToday | patientFilterSearch:autodex \
  | rpmExportDefaultDate ': async function (browser) {
    //setup config
    const clinicPatientListPage = browser.page.clinicPatientListPage();
    const clinicPatientList = clinicPatientListPage.section.patientList;
    let today = moment().format('MM-DD-YYYY')
    let startDateFile = moment().subtract(29,"days").format('MM-DD-YYYY')
    let endDateFile = today
    let fileName = `RPM Report (${startDateFile} - ${endDateFile}).csv`
    const attemptsCheckFileExists = 10;
    const filePath = './rpm.csv'

    //filter criteria and rpm report submit

  
    clinicPatientList.lastUploadFilterToday();
    clinicPatientList.patientFilterSearch("autodex");

    clinicPatientList.rpmExportDefaultDate();
    //validate file export results
    try {
      const exists = await browser.checkFileExists(attemptsCheckFileExists, fileName);
      browser.assert.strictEqual(exists, true, 'exported rpm csv file exists ');
    } catch (error) {
      console.log(error);
      browser.assert.strictEqual(false, true, 'exported rpm csv file exists ');
    }
    const sufficient = await browser.checkRPMExportSufficiency(filePath);
    browser.assert.strictEqual(sufficient, true, 'exported rpm csv file sufficiency is valid');

  },

};
