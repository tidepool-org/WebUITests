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
        patientUpload: 'a[title="Upload data"]',
        loginDropdown: '#navigation-menu-trigger',
        privateWorkspace: {
          selector: '//span[@aria-label="Private Workspace"]/ancestor::button',
          locateStrategy: 'xpath',
        },
        accountSettings: {
          selector: '//span[@aria-label="Account Settings"]/ancestor::button',
          locateStrategy: 'xpath',
        },
        logout: {
          selector: '//span[@aria-label="Logout"]/ancestor::button',
          locateStrategy: 'xpath',
        },

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
          selector: '//*[contains(@class,"refresh")]',
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
