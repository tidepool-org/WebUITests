import {
  test as base,
  Page,
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  PlaywrightWorkerArgs,
  PlaywrightWorkerOptions,
  TestFixture,
  TestInfo,
  TestStepInfo,
  TestType,
} from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Define the custom fixtures interface
interface CustomFixtures {
  timeLogger: Page;
  timeStepLogger: Page;
  stepTimer: Page;
  stepScreenshoter: Page;
  exceptionLogger: Page;
}

// Define the test type with custom fixtures
export const test: TestType<
  PlaywrightTestArgs & PlaywrightTestOptions & CustomFixtures,
  PlaywrightWorkerArgs & PlaywrightWorkerOptions
> = base.extend({
  page: async ({ page }, use, testInfo) => {
    const modifiedTestInfo = testInfo;
    modifiedTestInfo.snapshotSuffix = '';
    modifiedTestInfo.snapshotPath = name => `${testInfo.file}-snapshots/${name}`;

    // Make testInfo globally available for network helpers
    (globalThis as any).testInfo = testInfo;
    try {
      await use(page);
    } finally {
      // Clean up after test
      delete (globalThis as any).testInfo;
    }
  },
  timeLogger: [
    async ({ page }: { page: Page }, use: (r: Page) => Promise<void>, testInfo: TestInfo) => {
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
    async ({ page }: { page: Page }, use: (r: Page) => Promise<void>, testInfo: TestInfo) => {
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
    async ({ page }: { page: Page }, use: (r: Page) => Promise<void>, testInfo: TestInfo) => {
      const originalStep = test.step;
      const stepTimings = new Map<string, number>();

      // Continue-past-failure: once a step throws, we record it as FAILED and mark every
      // SUBSEQUENT step as "skipped" WITHOUT running its body, so the uploaded Xray test
      // keeps the FULL ordered step list (a tester re-running it by hand sees the whole
      // procedure, not just up to the failure). The original error is stashed and re-thrown
      // at teardown so Playwright still fails the test.
      // NOTE: because we swallow the failing step's error to keep going, Playwright's own
      // HTML report shows that step (and later ones) as passed/empty; the authoritative
      // per-step pass/fail/skip lives in these annotations, which the Xray reporter reads.
      let aborted = false;
      let firstError: unknown = null;

      const recordStep = (
        name: string,
        durationMs: number,
        status: 'passed' | 'failed' | 'skipped',
      ) => {
        testInfo.annotations.push({
          type: `Step Duration: ${name}`,
          description: JSON.stringify({ durationMs, status }),
        });
      };

      // Create a new step function with the same interface as the original
      const newStep = function newStepWrapper<T>(
        this: any,
        name: string,
        fn: (step: TestStepInfo) => Promise<T> | T,
      ) {
        return originalStep.call(this, name, async (stepInfo: TestStepInfo) => {
          // An earlier step already failed: record this one as skipped, don't run its body.
          if (aborted) {
            recordStep(name, 0, 'skipped');
            return undefined as unknown as T;
          }

          const startTime = Date.now();
          console.time(`[step] ${name}`);

          try {
            const result = await fn(stepInfo);
            console.timeEnd(`[step] ${name}`);
            const duration = Date.now() - startTime;
            stepTimings.set(name, duration);
            recordStep(name, duration, 'passed');
            return result;
          } catch (error) {
            console.timeEnd(`[step] ${name}`);
            const duration = Date.now() - startTime;
            aborted = true;
            firstError = error;
            recordStep(name, duration, 'failed');
            // Swallow here so the remaining steps run through this wrapper and get recorded
            // as skipped; the test is failed via the re-throw at teardown below.
            return undefined as unknown as T;
          }
        });
      };

      // Add the skip method to match the original test.step interface
      newStep.skip = function skipStep<T>(
        name: string,
        fn: (step: TestStepInfo) => Promise<T> | T,
      ) {
        return originalStep.skip.call(this, name, fn);
      };

      // Cleanup steps ALWAYS run, even after an earlier step failed — use them for reverts
      // and teardown (e.g. restoring an email a test changed) that must happen regardless of
      // the test's outcome. Unlike a normal step, a cleanup step ignores the abort flag and
      // does NOT set it, so other cleanup steps still run. Exposed as test.cleanupStep().
      const cleanupStep = function cleanupStepWrapper<T>(
        this: any,
        name: string,
        fn: (step: TestStepInfo) => Promise<T> | T,
      ) {
        return originalStep.call(this, name, async (stepInfo: TestStepInfo) => {
          const startTime = Date.now();
          try {
            const result = await fn(stepInfo);
            recordStep(name, Date.now() - startTime, 'passed');
            return result;
          } catch (error) {
            recordStep(name, Date.now() - startTime, 'failed');
            // A cleanup failure must not abort the remaining cleanups; surface it in logs
            // but don't re-throw (the primary failure, if any, still fails the test).
            console.error(`[cleanup] step failed (continuing): ${name}`, error);
            return undefined as unknown as T;
          }
        });
      };

      // Replace the original step with our enhanced version
      test.step = newStep as any;
      (test as any).cleanupStep = cleanupStep;

      await use(page);

      // Restore original test.step
      test.step = originalStep;
      delete (test as any).cleanupStep;

      // Re-throw the first step failure (after the full step list has been recorded) so
      // Playwright marks the test failed.
      if (firstError) {
        throw firstError;
      }
    },
    { auto: true },
  ],
  stepScreenshoter: [
    async ({ page }: { page: Page }, use: (r: Page) => Promise<void>, testInfo: TestInfo) => {
      const originalStep = test.step;
      let stepCounter = 0;

      // Create a safe directory name based on test info
      const testDirName = path.basename(testInfo.file, '.spec.ts').replace(/[^a-z0-9]/gi, '-');
      const screenshotDir = path.join('test-results', testDirName);

      // Store current step name for network helpers
      let currentStepName = '';

      // Make step counter accessible globally for network helper
      (globalThis as any).stepCounter = {
        get: () => stepCounter,
        increment: () => {
          stepCounter += 1;
          return stepCounter;
        },
        getDirectory: () => screenshotDir,
        getCurrentStepName: () => currentStepName,
        setCurrentStepName: (name: string) => {
          currentStepName = name;
        },
      };

      // Clean up existing screenshots from previous runs
      try {
        await fs.promises.access(screenshotDir);
        await fs.promises.rm(screenshotDir, { recursive: true, force: true });
      } catch {
        // Directory doesn't exist, no need to clean up
      }

      // Create a new step function that takes screenshots after completion and attaches them to the report
      const newStep = function newStepScreenshot<T>(
        this: any,
        name: string,
        fn: (step: TestStepInfo) => Promise<T> | T,
      ) {
        return originalStep.call(this, name, async (stepInfo: TestStepInfo) => {
          // Set current step name for network helpers (clean name without [no-screenshot])
          const stepCounterObj = (globalThis as any).stepCounter;
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
          } catch (error) {
            // Screenshot capture failed, continue without screenshot
          }

          return result;
        });
      };

      // Add the skip method to match the original test.step interface
      newStep.skip = function skipStepScreenshot<T>(
        name: string,
        fn: (step: TestStepInfo) => Promise<T> | T,
      ) {
        return originalStep.skip.call(this, name, fn);
      };

      // Add a custom stepNoScreenshot function for API validation steps
      const stepNoScreenshot = function stepNoScreenshot<T>(
        this: any,
        name: string,
        fn: (step: TestStepInfo) => Promise<T> | T,
      ) {
        return originalStep.call(this, name, async (stepInfo: TestStepInfo) => {
          // Set current step name for network helpers (clean name)
          const stepCounterObj = (globalThis as any).stepCounter;
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
      test.step = newStep as any;

      // Add the no-screenshot step function to the test object
      (test as any).stepNoScreenshot = stepNoScreenshot;

      await use(page);

      // Restore original test.step
      test.step = originalStep;
    },
    { auto: true },
  ],
  exceptionLogger: [
    async ({ page }: { page: Page }, use: (r: Page) => Promise<void>, testInfo: TestInfo) => {
      const errors: Error[] = [];
      page.on('pageerror', (error: Error) => {
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

export { expect } from '@playwright/test';

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
export function step(stepName?: string) {
  return function decorator(target: any, context: ClassMethodDecoratorContext) {
    return function replacementMethod(this: { name: string }, ...args: any[]) {
      const name = `${stepName || (context.name as string)} (${this.name})`;
      return test.step(name, async () => await target.call(this, ...args));
    };
  };
}
