module.exports = {
  url: function useEnvironmentUrl() {
    return this.api.launch_url;
  },
  sections: {
    navBar: {
      selector: '.Navbar',
      elements: {
        logo: 'a[href="/"]',
        patientCard: '.patientcard',
        patientProfile: 'a[href$="profile"]',
        patientView: 'a[href$="data"]',
        patientShare: 'a[href$="share"]',
        patientUpload: 'a[title="Upload data"',
        careTeam: 'a[href="/patients"]',
        loginDropdown: '.Navbar-logged',
        accountSettings: {
          selector: '//div[text()="Account Settings"]',
          locateStrategy: 'xpath',
        },
        logout: 'a[title="Logout"]',

      },
      commands: [{
      }],
    },
    patientData: {
      selector: '#app',
      elements: {
        banner: 'div[class*="Banner-message"]',
        bannerAction: 'div[class*="Banner-action"]',
        bannerDismiss: 'div[class*="Banner-close"]',
        basics: 'a[class*="js-basics"]',
        daily: 'a[class*="js-daily"]',
        bgLog: 'a[class*="js-bgLog"]',
        trends: 'a[class*="js-trends"]',
        dateRange: '#tidelineLabel',
        date: {
          selector: '//*[@id="tidelineLabel"]//*[contains(@class,"js-date")]',
          locateStrategy: 'xpath',
        },
        print: 'span[aria-label="Print PDF report"]',
        deviceSettings: 'a[class*=js-settings]',
      },
      commands: [{
      }],
    },
    footer: {
      selector: '#app',
      elements: {
        refresh: {
          selector: '//button[text()="Refresh"]',
          locateStrategy: 'xpath',
        },
        twitter: '#twitter',
        facebook: '#facebook',
        support: '#support',
        termsOfUse: '#legal',
        jdrf: '#jdrf',
      },
      commands: [{
      }],
    },
  },
};
