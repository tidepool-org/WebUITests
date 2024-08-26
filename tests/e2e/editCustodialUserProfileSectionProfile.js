/* eslint-disable linebreak-style */
require('../../utilities/seleniumKeepAlive');

module.exports = {
  '@tags': ['qae-223', 'clinician', 'parallel'],
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
  'Click custodial user profile link'(browser) {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.profile;
    userProfile.waitForElementVisible('@profile', browser.globals.elementTimeout);
    userProfile.click('@profile');
    userProfile.expect.element('@edit').to.be.present.before(browser.globals.elementTimeout);
  },
  'Click edit in custodial user profile page'(browser) {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.profile;
    userProfile.click('@edit');
    userProfile.expect.element('@fullName').to.be.present.before(browser.globals.elementTimeout);
  },
  'Edit and save full name in custodial user profile page': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.profile;
    let previousName;
    await userProfile.getValue('@fullName', (result) => {
      console.log('result', result);
      previousName = result.value;
    });
    userProfile.setValue('@fullName', `${previousName}new`);
    userProfile.click('@save');
    userProfile.waitForElementVisible('@edit', browser.globals.elementTimeout);
    userProfile.click('@edit');
    let newName;
    await userProfile.getValue('@fullName', (result) => {
      console.log('result', result);
      newName = result.value;
    });
    console.log(`${newName}newname`);
    console.log(`${previousName}previousname`);
    userProfile.click('@save');
    browser.assert.not.strictEqual(previousName, newName, 'previous name and new name are not equal');
    userProfile.click('@edit');
    userProfile.waitForElementVisible('@fullName', browser.globals.elementTimeout);
    userProfile.setValue('@fullName', previousName);
    userProfile.click('@save');
    browser.assert.not.strictEqual(previousName, newName, 'previous name saved in full name field');
  },
  'Edit and save dob in custodial user profile page': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.profile;
    userProfile.waitForElementVisible('@edit', browser.globals.elementTimeout);
    userProfile.click('@edit');
    let previousDOB;
    await userProfile.getValue('@dob', (result) => {
      console.log('result', result);
      previousDOB = result.value;
      console.log(`previousdob${previousDOB}`);
    });
    userProfile.setValue('@dob', '04/04/2000');
    userProfile.click('@save');
    userProfile.waitForElementVisible('@edit', browser.globals.elementTimeout);
    userProfile.click('@edit');
    let newDOB;
    await userProfile.getValue('@dob', (result) => {
      console.log('result', result);
      newDOB = result.value;
      console.log(`${newDOB} ${previousDOB}`);
    });
    browser.assert.not.strictEqual(previousDOB, newDOB, 'previous dob and new dob are not equal');
    userProfile.waitForElementVisible('@dob', browser.globals.elementTimeout);
    userProfile.setValue('@dob', previousDOB);
    userProfile.click('@save');
  },
  'Edit and save diagnosis date in custodial user profile page': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.profile;
    userProfile.waitForElementVisible('@edit', browser.globals.elementTimeout);
    userProfile.click('@edit');
    let previousDiagnosisDate;
    await userProfile.getValue('@diagnosisDate', (result) => {
      console.log('result', result);
      previousDiagnosisDate = result.value;
    });
    userProfile.setValue('@diagnosisDate', '03/03/2000');
    userProfile.click('@save');
    userProfile.waitForElementVisible('@edit', browser.globals.elementTimeout);
    userProfile.click('@edit');
    let newDiagnosisDate;
    await userProfile.getValue('@diagnosisDate', (result) => {
      console.log('result', result);
      newDiagnosisDate = result.value;
    });
    browser.assert.not.strictEqual(previousDiagnosisDate, newDiagnosisDate, 'previous diagnosis and new diagnosis are not equal');
    userProfile.waitForElementVisible('@diagnosisDate', browser.globals.elementTimeout);
    userProfile.setValue('@diagnosisDate', previousDiagnosisDate);
    userProfile.click('@save');
  },
  'Edit and save diagnosis type to type 1 in custodial user profile page': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.profile;
    userProfile.selectDiagnosesAs('@diagnosisTypeOptionType1');
    userProfile.isSelected('@diagnosisTypeOptionType1', function (result) {
      this.assert.equal(typeof result, 'object');
      this.assert.equal(result.status, 0);
      this.assert.equal(result.value, true);
    });
    userProfile.click('@save');
  },
  'Edit and save diagnosis type to type 2 in custodial user profile page': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.profile;
    userProfile.selectDiagnosesAs('@diagnosisTypeOptionType2');
    userProfile.isSelected('@diagnosisTypeOptionType2', function (result) {
      this.assert.equal(typeof result, 'object');
      this.assert.equal(result.status, 0);
      this.assert.equal(result.value, true);
    });
    userProfile.click('@save');
  },
  'Edit and save diagnosis type to gestational in custodial user profile page': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.profile;
    userProfile.selectDiagnosesAs('@diagnosisTypeGestational');
    userProfile.isSelected('@diagnosisTypeGestational', function (result) {
      this.assert.equal(typeof result, 'object');
      this.assert.equal(result.status, 0);
      this.assert.equal(result.value, true);
    });
    userProfile.click('@save');
  },
  'Edit and save diagnosis type to prediabetes in custodial user profile page': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.profile;
    userProfile.selectDiagnosesAs('@diagnosisTypePrediabetes');
    userProfile.isSelected('@diagnosisTypePrediabetes', function (result) {
      this.assert.equal(typeof result, 'object');
      this.assert.equal(result.status, 0);
      this.assert.equal(result.value, true);
    });
    userProfile.click('@save');
  },
  'Edit and save diagnosis type to lada in custodial user profile page': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.profile;
    userProfile.selectDiagnosesAs('@diagnosisTypeLada');
    userProfile.isSelected('@diagnosisTypeLada', function (result) {
      this.assert.equal(typeof result, 'object');
      this.assert.equal(result.status, 0);
      this.assert.equal(result.value, true);
    });
    userProfile.click('@save');
  },
  'Edit and save diagnosis type to mody in custodial user profile page': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.profile;
    userProfile.selectDiagnosesAs('@diagnosisTypeMody');
    userProfile.isSelected('@diagnosisTypeMody', function (result) {
      this.assert.equal(typeof result, 'object');
      this.assert.equal(result.status, 0);
      this.assert.equal(result.value, true);
    });
    userProfile.click('@save');
  },
  'Edit and save diagnosis type to other in custodial user profile page': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.profile;
    userProfile.selectDiagnosesAs('@diagnosisTypeOther');
    userProfile.isSelected('@diagnosisTypeOther', function (result) {
      this.assert.equal(typeof result, 'object');
      this.assert.equal(result.status, 0);
      this.assert.equal(result.value, true);
    });
    userProfile.click('@save');
  },
  'Edit and save MRN in custodial user profile page': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.profile;
    userProfile.waitForElementVisible('@edit', browser.globals.elementTimeout);
    userProfile.click('@edit');
    let previousMRN;
    await userProfile.getValue('@mrn', (result) => {
      console.log('result', result);
      previousMRN = result.value;
    });
    userProfile.setValue('@mrn', '8192024');
    userProfile.click('@save');
    userProfile.waitForElementVisible('@edit', browser.globals.elementTimeout);
    userProfile.click('@edit');
    let newMRN;
    await userProfile.getValue('@mrn', (result) => {
      console.log('result', result);
      newMRN = result.value;
    });
    userProfile.click('@save');
    browser.assert.not.strictEqual(previousMRN, newMRN, 'previous mrn and new mrn are not equal');
    userProfile.click('@edit');
    userProfile.waitForElementVisible('@mrn', browser.globals.elementTimeout);
    userProfile.setValue('@mrn', previousMRN);
    userProfile.click('@save');
    browser.assert.not.strictEqual(previousMRN, newMRN, 'previous mrn saved in mrn field');
  },
  'Edit and save bio in custodial user profile page': async (browser) => {
    const userProfilePage = browser.page.userProfilePage();
    const userProfile = userProfilePage.section.profile;
    userProfile.waitForElementVisible('@edit', browser.globals.elementTimeout);
    userProfile.click('@edit');
    let previousBio;
    await userProfile.getText('@bio', (result) => {
      console.log('result', result);
      previousBio = result.value;
    });
    userProfile.setValue('@bio', 'test bio');
    let newBio;
    userProfile.click('@save');
    userProfile.waitForElementVisible('@edit', browser.globals.elementTimeout);
    userProfile.click('@edit');
    await userProfile.getText('@bio', (result) => {
      console.log('result', result);
      newBio = result.value;
    });
    browser.assert.not.strictEqual(previousBio, newBio, 'previous bio and new bio are not equal');
    userProfile.waitForElementVisible('@bio', browser.globals.elementTimeout);
    userProfile.setValue('@bio', previousBio);
    userProfile.click('@save');
    userProfile.waitForElementVisible('@edit', browser.globals.elementTimeout);
    userProfile.click('@edit');
    await userProfile.getText('@bio', (result) => {
      console.log('result', result);
      newBio = result.value;
    });
    userProfile.click('@save');
    browser.assert.strictEqual(previousBio, newBio, 'previous bio saved in bio field');
  },

};
