"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.expect = exports.test = void 0;
exports.step = step;
const test_1 = require("@playwright/test");
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
// Define the test type with custom fixtures
exports.test = test_1.test.extend({
    page: async ({ page }, use, testInfo) => {
        const modifiedTestInfo = testInfo;
        modifiedTestInfo.snapshotSuffix = '';
        modifiedTestInfo.snapshotPath = name => `${testInfo.file}-snapshots/${name}`;
        // Make testInfo globally available for network helpers
        globalThis.testInfo = testInfo;
        try {
            await use(page);
        }
        finally {
            // Clean up after test
            delete globalThis.testInfo;
        }
    },
    timeLogger: [
        async ({ page }, use, testInfo) => {
            testInfo.annotations.push({
                type: 'Start',
                description: new Date().toISOString(),
            });
            await use(page);
            testInfo.annotations.push({
                type: 'End',
                description: new Date().toISOString(),
            });
        },
        { auto: true },
    ],
    timeStepLogger: [
        async ({ page }, use, testInfo) => {
            const startTime = Date.now();
            console.time(`[test] ${testInfo.title}`);
            await use(page);
            console.timeEnd(`[test] ${testInfo.title}`);
            const endTime = Date.now();
            const duration = endTime - startTime;
            testInfo.annotations.push({
                type: 'Duration',
                description: `${duration}ms`,
            });
            testInfo.annotations.push({
                type: 'End',
                description: new Date().toISOString(),
            });
        },
        { auto: true },
    ],
    stepTimer: [
        async ({ page }, use, testInfo) => {
            const originalStep = exports.test.step;
            const stepTimings = new Map();
            // Create a new step function with the same interface as the original
            const newStep = function newStepWrapper(name, fn) {
                return originalStep.call(this, name, async (stepInfo) => {
                    const startTime = Date.now();
                    console.time(`[step] ${name}`);
                    const result = await fn(stepInfo);
                    console.timeEnd(`[step] ${name}`);
                    const endTime = Date.now();
                    const duration = endTime - startTime;
                    stepTimings.set(name, duration);
                    testInfo.annotations.push({
                        type: `Step Duration: ${name}`,
                        description: `${duration}ms`,
                    });
                    return result;
                });
            };
            // Add the skip method to match the original test.step interface
            newStep.skip = function skipStep(name, fn) {
                return originalStep.skip.call(this, name, fn);
            };
            // Replace the original step with our enhanced version
            exports.test.step = newStep;
            await use(page);
            // Restore original test.step
            exports.test.step = originalStep;
        },
        { auto: true },
    ],
    stepScreenshoter: [
        async ({ page }, use, testInfo) => {
            const originalStep = exports.test.step;
            let stepCounter = 0;
            // Create a safe directory name based on test info
            const testDirName = path.basename(testInfo.file, '.spec.ts').replace(/[^a-z0-9]/gi, '-');
            const screenshotDir = path.join('test-results', testDirName);
            // Store current step name for network helpers
            let currentStepName = '';
            // Make step counter accessible globally for network helper
            globalThis.__stepCounter = {
                get: () => stepCounter,
                increment: () => ++stepCounter,
                getDirectory: () => screenshotDir,
                getCurrentStepName: () => currentStepName,
                setCurrentStepName: (name) => {
                    currentStepName = name;
                },
            };
            // Clean up existing screenshots from previous runs
            try {
                await fs.promises.access(screenshotDir);
                await fs.promises.rm(screenshotDir, { recursive: true, force: true });
            }
            catch {
                // Directory doesn't exist, no need to clean up
            }
            // Create a new step function that takes screenshots after completion and attaches them to the report
            const newStep = function newStepScreenshot(name, fn) {
                return originalStep.call(this, name, async (stepInfo) => {
                    // Set current step name for network helpers (clean name without [no-screenshot])
                    const stepCounterObj = globalThis.__stepCounter;
                    if (stepCounterObj) {
                        const cleanName = name.replace(/\s*\[no-screenshot\]\s*/g, '').trim();
                        stepCounterObj.setCurrentStepName(cleanName);
                    }
                    const result = await fn(stepInfo);
                    // Skip screenshot if step name contains [no-screenshot]
                    if (name.includes('[no-screenshot]')) {
                        return result;
                    }
                    // Take screenshot after step completion
                    stepCounter += 1;
                    try {
                        if (!page.isClosed()) {
                            // Use clean name for filename (without [no-screenshot])
                            const cleanName = name.replace(/\s*\[no-screenshot\]\s*/g, '').trim();
                            const screenshotName = `step-${stepCounter.toString().padStart(2, '0')}-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
                            // Take screenshot directly to buffer (no local file)
                            const screenshot = await page.screenshot({
                                fullPage: true,
                            });
                            // Attach to Playwright report AND force test-results folder creation
                            if (testInfo && typeof testInfo.attach === 'function') {
                                await testInfo.attach(screenshotName, {
                                    body: screenshot,
                                    contentType: 'image/png',
                                });
                                // Also save to test-results for organized viewing (single source)
                                const testResultsDir = path.join(testInfo.outputDir, 'attachments');
                                await fs.promises.mkdir(testResultsDir, { recursive: true });
                                const screenshotPath = path.join(testResultsDir, screenshotName);
                                await fs.promises.writeFile(screenshotPath, screenshot);
                            }
                        }
                    }
                    catch (error) { }
                    return result;
                });
            };
            // Add the skip method to match the original test.step interface
            newStep.skip = function skipStepScreenshot(name, fn) {
                return originalStep.skip.call(this, name, fn);
            };
            // Add a custom stepNoScreenshot function for API validation steps
            const stepNoScreenshot = function stepNoScreenshot(name, fn) {
                return originalStep.call(this, name, async (stepInfo) => {
                    // Set current step name for network helpers (clean name)
                    const stepCounterObj = globalThis.__stepCounter;
                    if (stepCounterObj) {
                        stepCounterObj.setCurrentStepName(name);
                    }
                    const result = await fn(stepInfo);
                    // No screenshot taken for this step type
                    // console.log(`⏭️  API step completed without screenshot: ${name}`);
                    return result;
                });
            };
            // Replace the original step with our enhanced version
            exports.test.step = newStep;
            // Add the no-screenshot step function to the test object
            exports.test.stepNoScreenshot = stepNoScreenshot;
            await use(page);
            // Restore original test.step
            exports.test.step = originalStep;
        },
        { auto: true },
    ],
    exceptionLogger: [
        async ({ page }, use, testInfo) => {
            const errors = [];
            page.on('pageerror', (error) => {
                errors.push(error);
            });
            await use(page);
            if (errors.length > 0) {
                await testInfo.attach('frontend-exceptions', {
                    body: errors.map(error => `${error.message}\n${error.stack}`).join('\n---------\n'),
                });
                throw new Error('Some frontend exceptions occurred');
            }
        },
        { auto: true },
    ],
});
var test_2 = require("@playwright/test");
Object.defineProperty(exports, "expect", { enumerable: true, get: function () { return test_2.expect; } });
/**
 * Decorator function for wrapping POM methods in a test.step.
 *
 * Use it without a step name `@step()`.
 *
 * Or with a step name `@step("Search something")`.
 *
 * @param stepName - The name of the test step.
 * @returns A decorator function that can be used to decorate test methods.
 */
function step(stepName) {
    return function decorator(target, context) {
        return function replacementMethod(...args) {
            const name = `${stepName || context.name} (${this.name})`;
            return exports.test.step(name, async () => await target.call(this, ...args));
        };
    };
}
