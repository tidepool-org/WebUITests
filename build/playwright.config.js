"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const node_path_1 = __importDefault(require("node:path"));
const env_1 = __importDefault(require("./utilities/env"));
// Legacy XML options - can be removed when fully migrated to JSON
const xrayOptions = {
    embedAnnotationsAsProperties: true,
    textContentAnnotations: ['test_description', 'testrun_comment'],
    embedAttachmentsAsProperty: 'testrun_evidence',
    outputFile: 'test-output/test-results.xml',
};
// Helper to detect BrowserStack run
const isBrowserStack = Boolean(process.env.BROWSERSTACK_USERNAME && process.env.BROWSERSTACK_ACCESS_KEY);
function buildBrowserStackEndpoint(testName) {
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
exports.default = (0, test_1.defineConfig)({
    testDir: './tests',
    outputDir: './test-results', // Custom output directory
    globalSetup: require.resolve(node_path_1.default.join(__dirname, 'tests/global-setup')),
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    timeout: 60000,
    expect: {
        toHaveScreenshot: { maxDiffPixelRatio: 0.2 },
    },
    reporter: [
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'test-results/last-run.json' }],
        ['junit', xrayOptions],
        ['./utilities/xray-json-reporter.ts'],
    ],
    use: {
        baseURL: env_1.default.BASE_URL,
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
                ...test_1.devices['Desktop Chrome'],
                storageState: 'tests/.auth/personal.json',
                headless: false,
            },
        },
        {
            name: 'chromium-claimed',
            testMatch: '**/claimed/**/*.spec.ts',
            use: {
                ...test_1.devices['Desktop Chrome'],
                storageState: 'tests/.auth/claimed.json',
                headless: false,
            },
        },
        {
            name: 'chromium-clinician',
            testMatch: '**/clinician/**/*.spec.ts',
            use: {
                ...test_1.devices['Desktop Chrome'],
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
