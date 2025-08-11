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
import * as fs from 'fs';
import * as path from 'path';

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
    testInfo.snapshotSuffix = '';
    testInfo.snapshotPath = name => `${testInfo.file}-snapshots/${name}`;

    await use(page);
  },
  timeLogger: [
    async ({ page }: { page: Page }, use: TestFixture<Page, any>, testInfo: TestInfo) => {
      test.info().annotations.push({
        type: 'Start',
        description: new Date().toISOString(),
      });

      await use(
        page,
        async page => {
          // The page is available here
        },
        testInfo,
      );

      test.info().annotations.push({
        type: 'End',
        description: new Date().toISOString(),
      });
    },
    { auto: true },
  ],
  timeStepLogger: [
    async ({ page }: { page: Page }, use: TestFixture<Page, any>, testInfo: TestInfo) => {
      const startTime = Date.now();
      console.time(`[test] ${testInfo.title}`);

      await use(
        page,
        async page => {
          // The page is available here
        },
        testInfo,
      );

      console.timeEnd(`[test] ${testInfo.title} ${testInfo}`);
      const endTime = Date.now();
      const duration = endTime - startTime;

      test.info().annotations.push({
        type: 'Duration',
        description: `${duration}ms`,
      });
      test.info().annotations.push({
        type: 'End',
        description: new Date().toISOString(),
      });
    },
    { auto: true },
  ],
  stepTimer: [
    async ({ page }: { page: Page }, use: TestFixture<Page, any>, testInfo: TestInfo) => {
      const originalStep = test.step;
      const stepTimings = new Map<string, number>();

      // Create a new step function with the same interface as the original
      const newStep = function <T>(
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
          test.info().annotations.push({
            type: `Step Duration: ${name}`,
            description: `${duration}ms`,
          });

          return result;
        });
      };

      // Add the skip method to match the original test.step interface
      newStep.skip = function <T>(name: string, fn: (step: TestStepInfo) => Promise<T> | T) {
        return originalStep.skip.call(this, name, fn);
      };

      // Replace the original step with our enhanced version
      test.step = newStep as any;

      await use(
        page,
        async page => {
          // The page is available here
        },
        testInfo,
      );

      // Restore original test.step
      test.step = originalStep;
    },
    { auto: true },
  ],
  stepScreenshoter: [
    async ({ page }: { page: Page }, use: TestFixture<Page, any>, testInfo: TestInfo) => {
      const originalStep = test.step;
      let stepCounter = 0;

      // Create a safe directory name based on test info
      const testDirName = `${testInfo.title.replace(/[^a-z0-9]/gi, '-')}-${testInfo.project.name}`;
      const screenshotDir = path.join('test-results', testDirName);
      
      // Clean up existing screenshots from previous runs
      if (fs.existsSync(screenshotDir)) {
        fs.rmSync(screenshotDir, { recursive: true, force: true });
      }
      
      // Create a new step function that takes screenshots after completion
      const newStep = function <T>(
        this: any,
        name: string,
        fn: (step: TestStepInfo) => Promise<T> | T,
      ) {
        return originalStep.call(this, name, async (stepInfo: TestStepInfo) => {
          const result = await fn(stepInfo);
          
          // Skip screenshot if step name contains [no-screenshot]
          if (name.includes('[no-screenshot]')) {
            console.log(`⏭️  Skipping screenshot for step: ${name}`);
            return result;
          }
          
          // Take screenshot after step completion
          stepCounter++;
          try {
            if (!page.isClosed()) {
              // Ensure directory exists
              if (!fs.existsSync(screenshotDir)) {
                fs.mkdirSync(screenshotDir, { recursive: true });
              }
              
              const screenshotName = `step-${stepCounter.toString().padStart(2, '0')}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
              const screenshotPath = path.join(screenshotDir, screenshotName);
              
              await page.screenshot({ 
                path: screenshotPath,
                fullPage: true 
              });
              console.log(`📸 Screenshot taken: ${screenshotPath}`);
            }
          } catch (error) {
            console.log(`⚠️  Screenshot failed for step "${name}": ${error}`);
          }

          return result;
        });
      };

      // Add the skip method to match the original test.step interface
      newStep.skip = function <T>(name: string, fn: (step: TestStepInfo) => Promise<T> | T) {
        return originalStep.skip.call(this, name, fn);
      };

      // Replace the original step with our enhanced version
      test.step = newStep as any;

      await use(
        page,
        async page => {
          // The page is available here
        },
        testInfo,
      );

      // Restore original test.step
      test.step = originalStep;
    },
    { auto: true },
  ],
  exceptionLogger: [
    async ({ page }: { page: Page }, use: TestFixture<Page, any>, testInfo: TestInfo) => {
      const errors: Error[] = [];
      page.on('pageerror', (error: Error) => {
        errors.push(error);
      });

      await use(
        page,
        async page => {
          // The page is available here
        },
        testInfo,
      );

      if (errors.length > 0) {
        const testInfo = test.info();
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
  return function decorator(target: Function, context: ClassMethodDecoratorContext) {
    return function replacementMethod(this: { name: string }, ...args: any[]) {
      const name = `${stepName || (context.name as string)} (${this.name})`;
      return test.step(name, async () => await target.call(this, ...args));
    };
  };
}
