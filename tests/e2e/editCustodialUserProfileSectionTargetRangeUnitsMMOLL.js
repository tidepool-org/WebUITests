/* eslint-disable linebreak-style */
require('../../utilities/seleniumKeepAlive');
const utils = require('../../modules/utilsProfilePage');

module.exports = {
  '@tags': ['qae-223rangemmoll', 'clinician', 'parallel'],
  'Clinician User Logs in with Existing Credentials'(browser) {
    const loginPage = browser.page.loginPage();
    const clinicianUsername = browser.globals.clinicianUsername;
    const clinicianPassword = browser.globals.clinicianPassword;
    const clinicWorkspacePage = browser.page.clinicWorkspacePage();
    const clinicWorkspace = clinicWorkspacePage.section.clinicWorkspace;
    loginPage.loadPage();
    loginPage.userLogin(clinicianUsername, clinicianPassword);
    clinicWorkspace.expect.element('@title').to.be.present.before(browser.globals.elementTimeout);
  },
  'Clinic workspace selection'(browser) {
    const clinicWorkspacePage = browser.page.clinicWorkspacePage();
    const clinicWorkspace = clinicWorkspacePage.section.clinicWorkspace;
    const clinicPatientListPage = browser.page.clinicPatientListPage();
    const clinicPatientList = clinicPatientListPage.section.patientList;
    clinicWorkspace.waitForElementVisible('@title', browser.globals.elementTimeout);
    clinicWorkspace.click('@goToWorkspace');
    clinicPatientList.expect.element('@showAll').to.be.present.before(browser.globals.elementTimeout);
  },
  'Clinic workspace search custodial user and click patient name'(browser) {
    const clinicPatientListPage = browser.page.clinicPatientListPage();
    const clinicPatientList = clinicPatientListPage.section.patientList;
    clinicPatientList.patientFilterSearch('custodial user');
    clinicPatientList.waitForElementVisible('@row0PatientName', browser.globals.elementTimeout);
    clinicPatientList.click('@row0PatientName');
    clinicPatientList.expect.element('@uploadButton').to.be.present.before(browser.globals.elementTimeout);
    clinicPatientList.expect.element('@resendVerificationEmailButton').to.be.present.before(browser.globals.elementTimeout);
  },
  'Click custodial user profile link and set to mmoll  '(browser) {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.profile;
    const userProfileUnits = userProfilePage.section.units;
    userProfile.waitForElementVisible('@profile', browser.globals.elementTimeout);
    userProfile.click('@profile');
    userProfile.expect.element('@edit').to.be.present.before(browser.globals.elementTimeout);
    userProfileUnits.click('@mmoll');
    userProfileUnits.expect.element('@mmoll').to.be.selected;
  },
  'Click increment low in custodial user profile page': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.targetRange;

    let previousLow;
    await userProfile.getText('@low', (result) => {
      console.log('result', result);
      previousLow = parseFloat(result.value);
      console.log(previousLow);
    });
    userProfile.click('@increaseLow');
    let currentLow;
    await userProfile.getText('@low', (result) => {
      console.log('result', result);
      currentLow = parseFloat(result.value);
      console.log(currentLow);
    });
    browser.assert.strictEqual(previousLow + 0.1, currentLow, 'previous low incremented by 0.1');
    utils.resetDefaultMMOLL(browser, userProfile);
  },
  'Click increment high in custodial user profile page': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.targetRange;

    let previousHigh;
    await userProfile.getText('@high', (result) => {
      console.log('result', result);
      previousHigh = parseFloat(result.value);
      console.log(previousHigh);
    });
    userProfile.click('@increaseHigh');
    let currentHigh;
    await userProfile.getText('@high', (result) => {
      console.log('result', result);
      currentHigh = parseFloat(result.value);
      console.log(currentHigh);
    });
    browser.assert.strictEqual(previousHigh + 0.1, currentHigh, 'previous high incremented by 0.1');
    utils.resetDefaultMMOLL(browser, userProfile);
  },
  'Click decrease low in custodial user profile page': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.targetRange;

    let previousLow;
    await userProfile.getText('@low', (result) => {
      console.log('result', result);
      previousLow = parseFloat(result.value);
      console.log(previousLow);
    });
    userProfile.click('@decreaseLow');
    let currentLow;
    await userProfile.getText('@low', (result) => {
      console.log('result', result);
      currentLow = parseFloat(result.value);
      console.log(currentLow);
    });
    browser.assert.strictEqual(previousLow - 0.1, currentLow, 'previous low decereased by 0.1');
    utils.resetDefaultMMOLL(browser, userProfile);
  },
  'Click decrease high in custodial user profile page': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.targetRange;

    let previousHigh;
    await userProfile.getText('@high', (result) => {
      console.log('result', result);
      previousHigh = parseFloat(result.value);
      console.log(previousHigh);
    });
    userProfile.click('@decreaseHigh');
    let currentHigh;
    await userProfile.getText('@high', (result) => {
      console.log('result', result);
      currentHigh = parseFloat(result.value);
      console.log(currentHigh);
    });
    browser.assert.strictEqual(previousHigh - 0.1, currentHigh, 'previous high decrease by 0.1');
    utils.resetDefaultMMOLL(browser, userProfile);
  },
};
