import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import env from './utilities/env';

// Helper to detect BrowserStack run
const isBrowserStack = Boolean(
  process.env.BROWSERSTACK_USERNAME && process.env.BROWSERSTACK_ACCESS_KEY,
);

/**
 * Convert TEST_TAGS env var to a Playwright grep RegExp.
 *
 * - Single tag:   TEST_TAGS="smoke"        → /@smoke/i
 * - AND (spaces): TEST_TAGS="smoke ui"     → /(?=.*@smoke)(?=.*@ui)/i
 * - OR (commas):  TEST_TAGS="smoke,api"    → /@smoke|@api/i
 * - Case-insensitive so Jira uppercase input matches lowercase tags.
 * - Works with or without @ prefix.
 */
function buildGrepFromTags(): RegExp | undefined {
  const testTags = process.env.TEST_TAGS?.trim();
  if (!testTags) return undefined;

  const hasCommas = testTags.includes(',');
  const tagList = testTags
    .split(hasCommas ? ',' : /\s+/)
    .map(t => t.trim().toLowerCase())
    .filter(t => t.length > 0)
    .map(t => (t.startsWith('@') ? t : `@${t}`));

  if (tagList.length === 0) return undefined;

  if (tagList.length === 1) {
    return new RegExp(tagList[0], 'i');
  }

  if (hasCommas) {
    return new RegExp(tagList.join('|'), 'i');
  }

  return new RegExp(tagList.map(tag => `(?=.*${tag})`).join(''), 'i');
}

function buildBrowserStackEndpoint(testName: string) {
  const caps = {
    browser: 'chrome',
    browser_version: 'latest',
    os: 'os x',
    os_version: 'catalina',
    name: testName,
    build: process.env.CI_BUILD_NUMBER || 'local-run',
    'browserstack.username': process.env.BROWSERSTACK_USERNAME,
    'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY,
  };
  return `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(caps))}`;
}

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results', // Custom output directory
  globalSetup: require.resolve(path.join(__dirname, 'tests/global-setup')),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  grep: buildGrepFromTags(),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60_000,

  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.2 },
  },

  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/last-run.json' }],
    ['./utilities/xray-json-reporter.ts'],
  ],

  use: {
    baseURL: env.BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Custom test attachment naming
    testIdAttribute: 'data-testid',
  },

  projects: [
    {
      name: 'chromium-personal',
      testMatch: '**/personal/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/personal.json',
        headless: false,
      },
    },

    {
      name: 'chromium-claimed',
      testMatch: '**/claimed/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/claimed.json',
        headless: false,
      },
    },

    {
      name: 'chromium-clinician',
      testMatch: '**/clinician/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/clinician.json',
        headless: false,
      },
    },

    ...(isBrowserStack
      ? [
          {
            name: 'bs-chrome-personal',
            testMatch: '**/patient/**/*.spec.ts',
            use: {
              storageState: 'tests/.auth/personal.json',
              connectOptions: { wsEndpoint: buildBrowserStackEndpoint('Personal Patient Tests') },
            },
          },

          {
            name: 'bs-chrome-claimed',
            testMatch: '**/claimed/**/*.spec.ts',
            use: {
              storageState: 'tests/.auth/claimed.json',
              connectOptions: { wsEndpoint: buildBrowserStackEndpoint('Claimed Patient Tests') },
            },
          },

          {
            name: 'bs-chrome-clinician',
            testMatch: '**/clinician/**/*.spec.ts',
            use: {
              storageState: 'tests/.auth/clinician.json',
              connectOptions: { wsEndpoint: buildBrowserStackEndpoint('Clinician Tests') },
            },
          },
        ]
      : []),
  ],
});
