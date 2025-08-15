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

    await use(page);
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

      // Create a new step function with the same interface as the original
      const newStep = function newStepWrapper<T>(
        this: any,
        name: string,
        fn: (step: TestStepInfo) => Promise<T> | T,
      ) {
        return originalStep.call(this, name, async (stepInfo: TestStepInfo) => {
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
      newStep.skip = function skipStep<T>(
        name: string,
        fn: (step: TestStepInfo) => Promise<T> | T,
      ) {
        return originalStep.skip.call(this, name, fn);
      };

      // Replace the original step with our enhanced version
      test.step = newStep as any;

      await use(page);

      // Restore original test.step
      test.step = originalStep;
    },
    { auto: true },
  ],
  stepScreenshoter: [
    async ({ page }: { page: Page }, use: (r: Page) => Promise<void>, testInfo: TestInfo) => {
      const originalStep = test.step;
      let stepCounter = 0;

      // Create a safe directory name based on test info
      const testDirName = `${testInfo.title.replace(/[^a-z0-9]/gi, '-')}-${testInfo.project.name}`;
      const testDirName = `${path.basename(testInfo.file, '.spec.ts').replace(/[^a-z0-9]/gi, '-')}`;
      const screenshotDir = path.join('test-results', testDirName);

      // Store current step name for network helpers
      let currentStepName = '';

      // Make step counter accessible globally for network helper
      (globalThis as any).__stepCounter = {
        get: () => stepCounter,
        increment: () => ++stepCounter,
        getDirectory: () => screenshotDir,
        getCurrentStepName: () => currentStepName,
        setCurrentStepName: (name: string) => { currentStepName = name; }
      };

      // Clean up existing screenshots from previous runs
      try {
        await fs.promises.access(screenshotDir);
        await fs.promises.rm(screenshotDir, { recursive: true, force: true });
      } catch {
        // Directory doesn't exist, no need to clean up
      }

      // Create a new step function that takes screenshots after completion
      const newStep = function newStepScreenshot<T>(
        this: any,
        name: string,
        fn: (step: TestStepInfo) => Promise<T> | T,
      ) {
        return originalStep.call(this, name, async (stepInfo: TestStepInfo) => {
          // Set current step name for network helpers (clean name without [no-screenshot])
          const stepCounterObj = (globalThis as any).__stepCounter;
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
              // Ensure directory exists
              await fs.promises.mkdir(screenshotDir, { recursive: true });

              // Use clean name for filename (without [no-screenshot])
              const cleanName = name.replace(/\s*\[no-screenshot\]\s*/g, '').trim();
              const screenshotName = `step-${stepCounter.toString().padStart(2, '0')}-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
              const screenshotPath = path.join(screenshotDir, screenshotName);

              await page.screenshot({
                path: screenshotPath,
                fullPage: true,
              });

            }
          } catch (error) {
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
          const stepCounterObj = (globalThis as any).__stepCounter;
          if (stepCounterObj) {
            stepCounterObj.setCurrentStepName(name);
          }

          const result = await fn(stepInfo);
          
          // No screenshot taken for this step type
          //console.log(`⏭️  API step completed without screenshot: ${name}`);
          
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
