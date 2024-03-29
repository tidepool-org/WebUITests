module.exports = {
  url: function useEnvironmentUrl() {
    return this.api.launch_url;
  },

  elements: {
    landingPage: {
      selector: '.card-pf',
    },
    usernameInput: {
      selector: '#username', // ID selector for the username input field
    },
    passwordInput: {
      selector: '#password', // ID selector for the password input field
    },
    submitBtn: {
      selector: 'input[name="login"]', // Name selector for the submit btn field
    },
    rememberChk: {
      selector: '#rememberMe', // ID selector for the rememberMe checkbox field
    },
    nextBtn: {
      selector: '#kc-login', // ID selector for the Next checkbox field
    },
    signupLink: {
      selector: '//a[contains(text(),"Sign up")]',
      locateStrategy: 'xpath',
    },
    logo: {
      selector: 'img[alt="Tidepool"]',
    },
    twitterLogo: {
      selector: 'a[href="https://twitter.com/tidepool_org"]',
    },
    facebookLogo: {
      selector: 'a[href="https://www.facebook.com/TidepoolOrg"]',
    },
    mobileLink: {
      selector: 'a[href="http://tidepool.org/products/tidepool-mobile/"]',
    },
    supportLink: {
      selector: 'a[href="http://support.tidepool.org/"]',
    },
    termsLink: {
      selector: 'a[href="http://tidepool.org/legal/"]',
    },
    jdrfLink: {
      selector: 'a[href="http://jdrf.org/"]',
    },

    // Add other elements of the login form here (e.g., password input, submit button, etc.)
  },

  commands: [
    {
      // Add other commands/actions related to the login form here
      userLogin(username, password) {
        this.waitForElementVisible('@usernameInput', this.api.globals.elementTimeout);
        this.setValue('@usernameInput', username);
        this.click('@nextBtn');
        this.waitForElementVisible('@passwordInput', this.api.globals.elementTimeout);
        this.setValue('@passwordInput', password);
        return this.click('@submitBtn');
      },

      loadPage() {
        this.navigate();
        this.api.window.maximize();
        return this.waitForElementVisible(
          '#kc-page-title',
          this.api.globals.elementTimeout,
          'page loaded',
        );
      },
    },
  ],
};
