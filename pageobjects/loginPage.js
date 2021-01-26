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
        elementsPresent() {
          return this
            .assert.visible('@signupLink', 'signup link visible and references correct link')
            .assert.visible('@logo', 'Tidepool logo is visible');
        },
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
        elementsPresent() {
          return this
            .assert.visible('@forgotPasswordLink', 'forgot password link visible and references correct link');
        },
        loginDsa(username, password) {
          return this
            .setValue('@usernameInput', username)
            .setValue('@passwordInput', password)
            .click('@rememberChk')
            .click('@loginBtn')
            .api.assert.urlContains('data', 'successful login');
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
        elementsPresent() {
          return this
            .assert.visible('@twitterLogo', 'Twitter logo visible and references correct link')
            .assert.visible('@facebookLogo', 'facebook logo visible and references correct link')
            .assert.visible('@mobileLink', 'mobile link visible and references correct link')
            .assert.visible('@supportLink', 'support link ivisible and references correct link')
            .assert.visible('@termsLink', 'terms link visible and references correct link')
            .assert.visible('@jdrfLink', 'JDRF link visible and references correct link');
        },
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
