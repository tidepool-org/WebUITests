module.exports = {
  'User Accesses Help Widget'(browser) {
    const loginPage = browser.page.LoginPage();
    const helpWidget = browser.page.HelpWidget();
    loginPage.loadPage();
    helpWidget.accessHelpWidget();
  },
  'User Searches for "Login" help'(browser) {
    const helpWidget = browser.page.HelpWidget();
    helpWidget
      .searchArticles('login', browser);
  },
  'User Contacts Support'(browser) {
    const helpWidget = browser.page.HelpWidget();
    helpWidget.contactSupport();
  },
};
