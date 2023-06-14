require('../../utilities/seleniumKeepAlive');

module.exports = {
  '@tags': ['parallel'],
  'Log In'(browser) {
    const loginPage = browser.page.loginPage();

    browser.fullscreenWindow();
    loginPage.loadPage();
    const dsaUsername = browser.globals.dsaUsernameTandem;
    const dsaPassword = browser.globals.dsaPasswordTandem;
    loginPage.waitForElementVisible('@usernameInput', browser.globals.elementTimeout);
    loginPage.enterUsername(dsaUsername);
    loginPage.nextBtnClick();            //Navigate to the password page
    loginPage.waitForElementVisible('@passwordInput', browser.globals.elementTimeout);
    loginPage.enterPassword(dsaPassword);
    loginPage.submitBtnClick();            //Navigate to the password page
  },
  'verify login dropdown elements present'(browser) {
    const common = browser.page.commonElementsPage();
    const navBar = common.section.navBar;
    navBar.expect.element('@loginDropdown').to.be.visible;
    navBar.click('@loginDropdown');
    navBar.expect.element('@privateWorkspace').to.be.visible;
    navBar.expect.element('@accountSettings').to.be.visible;
    navBar.expect.element('@logout').to.be.visible;
    navBar.assert.screenshotIdenticalToBaseline('@loginDropdownMenu', 'login dropdown menu');
    navBar.click('@privateWorkspace');
  },
  'verify private workspace elements present'(browser) {
    const common = browser.page.commonElementsPage();
    const navBar = common.section.navBar;
    const privateWorkspace = browser.page.dsaPrivateWorkspace();
    navBar.waitForElementVisible('@logo', browser.globals.elementTimeout);
    navBar.expect.element('@loginDropdown').to.be.visible;
    privateWorkspace.expect.element('@patientCard').to.be.visible;
    privateWorkspace.expect.element('@patientView').to.be.visible;
    privateWorkspace.expect.element('@patientShare').to.be.visible;
    privateWorkspace.expect.element('@patientUpload').to.be.visible;
    privateWorkspace.assert.screenshotIdenticalToBaseline('@navBar', 'nav bar');
    privateWorkspace.assert.screenshotIdenticalToBaseline('@patientsSection', 'private workspace patients');
  },
};
