module.exports = {
  url: function useEnvironmentUrl() {
    return this.api.launch_url;
  },
  sections: {
    navBar: {
      selector: '.Navbar',
      elements: {
        navBarContainer: '.App-navbar',
        logo: 'a[href="/"]',
        loginDropdown: '#navigation-menu-trigger',
        loginDropdownMenu: {
          selector: '//span[@aria-label="Logout"]/ancestor::button/..',
          locateStrategy: 'xpath',
        },
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
    navBarPatientHeader: {
      selector: '#navPatientHeader',
      elements: {
        self: '#navPatientHeader',
        patientProfile: '#navPatientHeader_profileButton',
        patientView: '#navPatientHeader_viewDataButton',
        patientShare: '#navPatientHeader_shareButton',
        patientUpload: '#navPatientHeader_uploadButton',
      },
    },
    patientData: {
      selector: '#app',
      elements: {
        banner: 'div[class*="Banner-message"]',
        bannerAction: 'div[class*="Banner-action"]',
        bannerDismiss: 'div[class*="Banner-close"]',
        patientDataSubNav: '.patient-data-subnav',
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
        /**
         * @summary Navigates to one of the patient data views
         * @param {string} view One of the available data views: basics, daily, bgLog, or trends
         */
        loadView(view) {
          this.waitForElementVisible(`@${view}`, this.api.globals.elementTimeout);
          return this.click(`@${view}`);
        },
      }],
    },
    footer: {
      selector: '#app',
      elements: {
        footerContainer: '.footer',
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
