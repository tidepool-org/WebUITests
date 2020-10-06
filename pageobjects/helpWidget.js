'use strict';

module.exports = {
  url: function useEnvironmentUrl() {
    return this.api.launch_url;
  },
  commands: [{
    accessHelpWidget() {
      return this.api
        .frame('launcher')
        .click('button[aria-label="Help"]')
        .frame(null)
        .frame('webWidget')
        .waitForElementVisible('input[type="search"]', 5000, 'help widget expanded');
    },
    helpWidgetSearch(searchTerm, browser) {
      return this.api
        .setValue('input[type="search"]', searchTerm)
        .keys(browser.Keys.ENTER)
        .assert.visible('a[href^="https://support.tidepool.org"]', 'support articles showing');
    },
    helpWidgetContactUsBtn() {
      return this.api
        .useXpath()
        .click('//button[text()="Contact us"]')
        .useCss()
        .waitForElementVisible('input[name="name"]', 5000, '"contact us" form displayed');
    },
    helpWidgetContactUsFormFill() {
      return this.api
        .setValue('input[name="name"]', 'Automated UI Testing')
        .setValue('input[name="email"]', 'webuiautomation@tidepool.org')
        .setValue('textarea[name="description"]', 'Automated UI Testing via Nightwatch')
        .click('button[type="submit"]')
        .assert.containsText('h1[data-testid="widget-title"]', 'Message sent', 'message to support sent successfully');
    }
  }]
};
