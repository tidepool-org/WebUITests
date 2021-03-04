module.exports = {
  '@tags': ['parallel'],
  'User Logs in with Existing Credentials'(browser) {
    const loginPage = browser.page.loginPage();
    const loginForm = loginPage.section.loginForm;
    const dsaUsername = browser.globals.dsaUsernameTandem;
    const dsaPassword = browser.globals.dsaPasswordTandem;
    loginPage.loadPage();
    loginForm.loginDsa(dsaUsername, dsaPassword);
  },
};
