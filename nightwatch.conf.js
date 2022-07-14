const dayjs = require('dayjs');

module.exports = {
  src_folders: './tests',
  page_objects_path: './pageobjects',
  globals_path: 'global.js',
  custom_commands_path: ['node_modules/nightwatch-vrt/commands'],
  custom_assertions_path: ['node_modules/nightwatch-vrt/assertions'],

  test_settings: {
    webdriver: {
      keep_alive: true,
      timeout_options: {
        timeout: 60000,
        retry_attempts: 3,
      },
    },
    test_workers: {
      enabled: true,
      workers: 'auto',
    },
    browserstack: {
      selenium: {
        host: 'hub-cloud.browserstack.com',
        port: 443,
        start_process: false,
      },

      desiredCapabilities: {
        local: 'false',
        userName: process.env.BROWSERSTACK_USER,
        accessKey: process.env.BROWSERSTACK_KEY,
        'browserstack.debug': 'true',
      },
    },

    qa2chrome: {
      extends: 'browserstack',
      launch_url: 'https://qa2.development.tidepool.org',
      environmentName: 'qa2chrome',
      desiredCapabilities: {
        browserName: 'chrome',
        browserVersion: 'latest',
        os: 'Windows',
        osVersion: '10',
        resolution: '1366x768',
        build: `QA2_CHROME ${dayjs().format('YYYY-MM-DD h:mm:ss A')}`,
        'browserstack.networkLogs': 'true',
      },
    },

    qa1chrome: {
      extends: 'browserstack',
      launch_url: 'https://qa1.development.tidepool.org',
      environmentName: 'qa1chrome',
      desiredCapabilities: {
        browserName: 'chrome',
        browserVersion: 'latest',
        os: 'Windows',
        osVersion: '10',
        resolution: '1366x768',
        build: `QA1_CHROME ${dayjs().format('YYYY-MM-DD h:mm:ss A')}`,
        'browserstack.networkLogs': 'true',
      },
    },

    intchrome: {
      extends: 'browserstack',
      launch_url: 'https://int-app.tidepool.org',
      environmentName: 'intchrome',
      desiredCapabilities: {
        browserName: 'chrome',
        browserVersion: 'latest',
        os: 'Windows',
        osVersion: '10',
        resolution: '1366x768',
        build: `INT_CHROME ${dayjs().format('YYYY-MM-DD h:mm:ss A')}`,

      },
    },

    prdchrome: {
      extends: 'browserstack',
      launch_url: 'https://app.tidepool.org',
      environmentName: 'prdchrome',
      desiredCapabilities: {
        browserName: 'chrome',
        browserVersion: 'latest',
        os: 'Windows',
        osVersion: '10',
        resolution: '1366x768',
        build: `PRD_CHROME ${dayjs().format('YYYY-MM-DD h:mm:ss A')}`,
        'browserstack.networkLogs': 'true',
      },
    },

    dev1chrome: {
      extends: 'browserstack',
      launch_url: 'https://dev1.dev.tidepool.org',
      environmentName: 'dev1chrome',
      desiredCapabilities: {
        browserName: 'chrome',
        browserVersion: 'latest',
        os: 'Windows',
        osVersion: '10',
        resolution: '1366x768',
        build: `DEV1_CHROME ${dayjs().format('YYYY-MM-DD h:mm:ss A')}`,
      },
    },
  },
};
