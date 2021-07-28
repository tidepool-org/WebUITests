const dayjs = require('dayjs');

module.exports = {
  src_folders: './tests',
  page_objects_path: './pageobjects',
  globals_path: 'global.js',

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
        'browserstack.networkLogs': 'true',
        'browserstack.debug': 'true',
      },
    },

    default: {
      launch_url: 'https://app.tidepool.org',
    },

    qa2chrome: {
      extends: 'browserstack',
      desiredCapabilities: {
        browserName: 'chrome',
        browserVersion: 'latest',
        launch_url: 'https://qa2.development.tidepool.org',
        os: 'Windows',
        osVersion: '10',
        resolution: '1366x768',
        build: `QA2_CHROME ${dayjs().format('YYYY-MM-DD h:mm:ss A')}`,
      },
    },

    qa1chrome: {
      extends: 'browserstack',
      desiredCapabilities: {
        browserName: 'chrome',
        browserVersion: 'latest',
        launch_url: 'https://qa1.development.tidepool.org',
        os: 'Windows',
        osVersion: '10',
        resolution: '1366x768',
        build: `QA1_CHROME ${dayjs().format('YYYY-MM-DD h:mm:ss A')}`,
      },
    },

    intchrome: {
      extends: 'browserstack',
      desiredCapabilities: {
        browserName: 'chrome',
        browserVersion: 'latest',
        launch_url: 'https://int-app.tidepool.org',
        os: 'Windows',
        osVersion: '10',
        resolution: '1366x768',
        build: `INT_CHROME ${dayjs().format('YYYY-MM-DD h:mm:ss A')}`,

      },
    },

    prdchrome: {
      extends: 'browserstack',
      desiredCapabilities: {
        browserName: 'chrome',
        browserVersion: 'latest',
        launch_url: 'https://app.tidepool.org',
        os: 'Windows',
        osVersion: '10',
        resolution: '1366x768',
        build: `PRD_CHROME ${dayjs().format('YYYY-MM-DD h:mm:ss A')}`,
      },
    },

    dev1chrome: {
      extends: 'browserstack',
      desiredCapabilities: {
        browserName: 'chrome',
        browserVersion: 'latest',
        launch_url: 'https://dev1.dev.tidepool.org',
        os: 'Windows',
        osVersion: '10',
        resolution: '1366x768',
        build: `DEV1_CHROME ${dayjs().format('YYYY-MM-DD h:mm:ss A')}`,
      },
    },
  },
};
