module.exports = {
  'User Logs in with Existing Credentials'(browser) {
    const loginPage = browser.page.LoginPage();
    const loginForm = loginPage.section.loginForm;
    const dsaUsername = browser.globals.dsaUsernameTandem;
    const dsaPassword = browser.globals.dsaPasswordTandem;
    loginPage.loadPage();
    loginForm.loginDsa(dsaUsername, dsaPassword);
  },
  // we'll add more to this flow as the we map out the rest of the application
};
