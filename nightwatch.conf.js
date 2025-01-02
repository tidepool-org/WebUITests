require('dotenv').config();
const dayjs = require('dayjs');

module.exports = {
  src_folders: ['tests'],
  page_objects_path: ['pageobjects'],
  globals_path: 'global.js',
  custom_commands_path: ['node_modules/nightwatch-vrt/commands'],
  custom_assertions_path: ['node_modules/nightwatch-vrt/assertions'],
  disable_colors: !!process.env.CI,
  live_output: !process.env.CI,
  detailed_output: !process.env.CI,
  webdriver: {},

  test_settings: {
    default: {
      disable_error_log: false,
      launch_url: 'qa2.development.tidepool.org',

      screenshots: {
        enabled: false,
        on_failure: false,
      },

      desiredCapabilities: {
        browserName: 'chrome',
      },
    },

    browserstack: {
      selenium: {
        host: 'hub.browserstack.com',
        port: 443,
      },

      desiredCapabilities: {
        'bstack:options': {
          userName: process.env.BROWSERSTACK_USER,
          accessKey: process.env.BROWSERSTACK_KEY,
        },
      },

      disable_error_log: true,
      webdriver: {
        timeout_options: {
          timeout: 20000,
          retry_attempts: 3,
        },
        keep_alive: true,
        start_process: false,
      },
    },

    'browserstack.local': {
      extends: 'browserstack',
      desiredCapabilities: {
        'browserstack.local': true,
      },
    },
    /* The following test environments and their names are tightly couple with the jira automation.
    changing these could result in broken a QMS */

    qa2chrome: {
      extends: 'browserstack',
      launch_url: 'https://qa2.development.tidepool.org',
      environmentName: 'qa2chrome', // an extra key o help vrt distinguish between environments
      desiredCapabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          w3c: true,
        },
        'bstack:options': {
          os: 'Windows',
          osVersion: '10',
          resolution: '1366x768',
          buildName: `QA2_CHROME ${dayjs().format('YYYY-MM-DD')} JIRA: ${process.env.TEST_EXECUTION_KEY}`,
          local: 'false',
        },
      },
    },

    qa2edge: {
      extends: 'browserstack',
      launch_url: 'https://qa2.development.tidepool.org',
      environmentName: 'qa2edge',
      desiredCapabilities: {
        browserName: 'edge',
        'goog:chromeOptions': {
          w3c: true,
        },
        'bstack:options': {
          os: 'Windows',
          osVersion: '10',
          resolution: '1366x768',
          buildName: `QA2_EDGE ${dayjs().format('YYYY-MM-DD')} JIRA: ${process.env.TEST_EXECUTION_KEY}`,
          local: 'false',
        },
      },
    },

    qa1chrome: {
      extends: 'browserstack',
      launch_url: 'https://qa1.development.tidepool.org',
      environmentName: 'qa1chrome',
      desiredCapabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          w3c: true,
        },
        'bstack:options': {
          os: 'Windows',
          osVersion: '10',
          resolution: '1366x768',
          buildName: `QA1_CHROME ${dayjs().format('YYYY-MM-DD')} JIRA: ${process.env.TEST_EXECUTION_KEY}`,
          local: 'false',
        },
      },
    },

    qa1edge: {
      extends: 'browserstack',
      launch_url: 'https://qa1.development.tidepool.org',
      environmentName: 'qa1edge',
      desiredCapabilities: {
        browserName: 'edge',
        'goog:chromeOptions': {
          w3c: true,
        },
        'bstack:options': {
          os: 'Windows',
          osVersion: '10',
          resolution: '1366x768',
          buildName: `QA1_EDGE ${dayjs().format('YYYY-MM-DD')} JIRA: ${process.env.TEST_EXECUTION_KEY}`,
          local: 'false',
        },
      },
    },

    dev1chrome: {
      extends: 'browserstack',
      launch_url: 'https://dev1.dev.tidepool.org',
      environmentName: 'dev1chrome',
      desiredCapabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          w3c: true,
        },
        'bstack:options': {
          os: 'Windows',
          osVersion: '10',
          resolution: '1366x768',
          buildName: `DEV1_CHROME ${dayjs().format('YYYY-MM-DD')} JIRA: ${process.env.TEST_EXECUTION_KEY}`,
          local: 'false',
        },
      },
    },

    intchrome: {
      extends: 'browserstack',
      launch_url: 'https://int-app.tidepool.org',
      environmentName: 'intchrome',
      desiredCapabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          w3c: true,
        },
        'bstack:options': {
          os: 'Windows',
          osVersion: '10',
          resolution: '1366x768',
          buildName: `INT_CHROME ${dayjs().format('YYYY-MM-DD')} JIRA: ${process.env.TEST_EXECUTION_KEY}`,
          local: 'false',
        },
      },
    },

    prdchrome: {
      extends: 'browserstack',
      launch_url: 'https://app.tidepool.org',
      environmentName: 'prdchrome',
      desiredCapabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          w3c: true,
        },
        'bstack:options': {
          os: 'Windows',
          osVersion: '10',
          resolution: '1366x768',
          buildName: `PRD_CHROME ${dayjs().format('YYYY-MM-DD')} JIRA: ${process.env.TEST_EXECUTION_KEY}`,
          local: 'false',
        },
      },
    },

    prdedge: {
      extends: 'browserstack',
      launch_url: 'https://app.tidepool.org',
      environmentName: 'prdedge',
      desiredCapabilities: {
        browserName: 'edge',
        'goog:chromeOptions': {
          w3c: true,
        },
        'bstack:options': {
          os: 'Windows',
          osVersion: '10',
          resolution: '1366x768',
          buildName: `PRD_EDGE ${dayjs().format('YYYY-MM-DD')} JIRA: ${process.env.TEST_EXECUTION_KEY}`,
          local: 'false',
        },
      },
    },
  },
};
