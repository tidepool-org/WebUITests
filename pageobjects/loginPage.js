module.exports = {
  url: function useEnvironmentUrl() {
    return this.api.launch_url;
  },
  sections: {
    navigation: {
      selector: '#app',
      elements: {
        signupLink: 'a[href="/signup"]',
        logo: 'img[alt="Tidepool"]',
      },
      commands: [{
      }],
    },
    loginForm: {
      selector: '#app',
      elements: {
        usernameInput: '#username',
        passwordInput: '#password',
        rememberChk: '#remember',
        forgotPasswordLink: 'a[href="/request-password-reset"]',
        loginBtn: {
          selector: '//button[text()="Login"]',
          locateStrategy: 'xpath',
        },
      },
      commands: [{
        loginDsa(username, password) {
          return this
            .setValue('@usernameInput', username)
            .setValue('@passwordInput', password)
            .click('@rememberChk')
            .click('@loginBtn')
            .api.expect.url().to.contain('data');
        },
      }],
    },
    footer: {
      selector: '#app',
      elements: {
        twitterLogo: 'a[href="https://twitter.com/tidepool_org"]',
        facebookLogo: 'a[href="https://www.facebook.com/TidepoolOrg"]',
        mobileLink: 'a[href="http://tidepool.org/products/tidepool-mobile/"]',
        supportLink: 'a[href="http://support.tidepool.org/"]',
        termsLink: 'a[href="http://tidepool.org/legal/"]',
        jdrfLink: 'a[href="http://jdrf.org/"]',
      },
      commands: [{
      }],
    },
  },
  commands: [{
    loadPage() {
      return this
        .navigate()
        .maximizeWindow()
        .waitForElementVisible('#app', this.api.globals.elementTimeout, 'page loaded');
    },
  }],
};
