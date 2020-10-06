'use strict';

var dayjs = require('dayjs');
module.exports = {
  src_folders: ['tests'],
  page_objects_path: ['pageobjects'],
  globals_path: 'global.js',

  webdriver: {
    start_process: false,
    host: 'hub-cloud.browserstack.com',
    port: 80
  },

  common_capabilities: {
    'browserstack.user': process.env.BROWSERSTACK_USER,
    'browserstack.key': process.env.BROWSERSTACK_KEY
  },

  test_settings: {
    qa2_chrome: {
      launch_url: 'https://qa2.development.tidepool.org',
      desiredCapabilities: {
        os: 'Windows',
        osVersion: '10',
        browserName: 'chrome',
        browserVersion: 'latest',
        resolution: '1366x768',
        build: 'QA2_CHROME ' + dayjs().format()
      }
    },
    qa1_chrome: {
      launch_url: 'https://qa1.development.tidepool.org',
      desiredCapabilities: {
        os: 'Windows',
        osVersion: '10',
        browserName: 'chrome',
        browserVersion: 'latest',
        resolution: '1366x768',
        build: 'QA1_CHROME ' + dayjs().format()
      }
    },
    prd_chrome: {
      launch_url: 'https://app.tidepool.org',
      desiredCapabilities: {
        os: 'Windows',
        osVersion: '10',
        browserName: 'chrome',
        browserVersion: 'latest',
        resolution: '1366x768',
        build: 'PRODUCTION_CHROME ' + dayjs().format()
      }
    }
  }
  /*
    When we're ready to use multi-browser testing we can uncomment these
    - add names to the test script in both the nightwatch.conf.js and travis.yml

    'qa2_firefox': {
      'desiredCapabilities': {
        'browserName': 'firefox'
      }
    },
    'qa2_safari': {
      "desiredCapabilities": {
        'browserName': 'safari'
      }
    },
    'qa2_ie': {
      'desiredCapabilities': {
        'browserName': "internet explorer"
      }
    } */
};
