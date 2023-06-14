require('../../utilities/seleniumKeepAlive');

module.exports = {
  '@tags': ['parallel'],
  'User Logs in with Existing Credentials'(browser) {
    const loginPage = browser.page.loginPage();
    loginPage.loadPage();
    //const loginForm = loginPage.section.loginForm;
    const dsaUsername = browser.globals.dsaUsernameTandem;
    const dsaPassword = browser.globals.dsaPasswordTandem;
    loginPage.waitForElementVisible('@usernameInput', browser.globals.elementTimeout);
    loginPage.enterUsername(dsaUsername);
    loginPage.nextBtnClick();            //Navigate to the password page
    loginPage.waitForElementVisible('@passwordInput', browser.globals.elementTimeout);
    loginPage.enterPassword(dsaPassword);
    loginPage.submitBtnClick();            //Navigate to the home page
  },
};
