module.exports = {
  url: function useEnvironmentUrl() {
    return this.api.launch_url;
  },
  elements: {
    helpButton: 'button[aria-label="Help"]',
    searchBar: 'input[type="search"]',
    supportArticleLink: 'a[href^="https://support.tidepool.org"]',
    contactUsBtn: {
      selector: '//button[text()="Contact us"]',
      locateStrategy: 'xpath',
    },
    nameInput: 'input[name="name"]',
    emailInput: 'input[name="email"]',
    descriptionTextbox: 'textarea[name="description"]',
    contactFormSubmitBtn: 'button[type="submit"]',
    widgetTitle: 'h1[data-testid="widget-title"]',
  },
  commands: [{
    loadWidget() {
      this.waitForElementVisible('#launcher', this.api.globals.elementTimeout);
    },
    accessHelpWidget() {
      this.api.frame(1);
      this.waitForElementVisible('@helpButton', this.api.globals.elementTimeout, 'helpWidget loaded');
      this.click('@helpButton');
      this.api.frame(null)
        .frame('webWidget');
      return this.waitForElementVisible('@searchBar', this.api.globals.elementTimeout, 'help widget expanded');
    },
    searchArticles(searchTerm, browser) {
      this.setValue('@searchBar', searchTerm);
      this.api.keys(browser.Keys.ENTER);
      return this.assert.visible('@supportArticleLink', 'support articles showing');
    },
    contactSupport() {
      this.click('@contactUsBtn');
      this.waitForElementVisible('@nameInput', this.api.globals.elementTimeout, '"contact us" form displayed')
        .setValue('@nameInput', 'Automated UI Testing')
        .setValue('@emailInput', 'webuiautomation@tidepool.org')
        .setValue('@descriptionTextbox', 'Automated UI Testing via Nightwatch')
        .click('@contactFormSubmitBtn');
      return this.assert.containsText('@widgetTitle', 'Message sent', 'message to support sent successfully');
    },
  }],
};
