'use strict';

module.exports = {
  'User Accesses Help Widget'(browser) {
    const loginPage = browser.page.loginPage();
    loginPage.loadPage()
      .accessHelpWidget();
  }
};
