import { test as base } from "@playwright/test";


/** @type {import('@playwright/test').TestType<import('@playwright/test').PlaywrightTestArgs & import('@playwright/test').PlaywrightTestOptions, import('@playwright/test').PlaywrightWorkerArgs & import('@playwright/test').PlaywrightWorkerOptions>}  */
export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    testInfo.snapshotSuffix = '';
    testInfo.snapshotPath = (name) => `${testInfo.file}-snapshots/${name}`;

    await use(page);
  },
  timeLogger: [
    async ({ page }, use) => {
      test.info().annotations.push({
        type: "Start",
        description: new Date().toISOString(),
      });

      await use(page);

      test.info().annotations.push({
        type: "End",
        description: new Date().toISOString(),
      });
    },
    { auto: true },
  ],
  timeStepLogger: [
    async ({ page }, use, testInfo) => {
      const startTime = Date.now();
      console.time(`test: ${testInfo.title}`);

      await use(page);

      console.timeEnd(`test: ${testInfo.title}`);
      const endTime = Date.now();
      const duration = endTime - startTime;

      test.info().annotations.push({
        type: "Duration",
        description: `${duration}ms`,
      });
      test.info().annotations.push({
        type: "End",
        description: new Date().toISOString(),
      });
    },
    { auto: true },
  ],
  stepTimer: [
    async ({ page }, use) => {
      const originalStep = test.step;
      const stepTimings = new Map();

      // Override test.step to include timing
      test.step = function (name, fn) {
        return originalStep.call(this, name, async () => {
          const startTime = Date.now();
          console.time(`step: ${name}`);

          const result = await fn();

          console.timeEnd(`step: ${name}`);
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

      await use(page);

      // Restore original test.step
      test.step = originalStep;
    },
    { auto: true },
  ],
  exceptionLogger: [
    async ({ page }, use) => {
      const errors = [];
      page.on("pageerror", (error) => {
        errors.push(error);
      });

      await use(page);

      if (errors.length > 0) {
        await test.info.attach("frontend-exceptions", {
          body: errors.map((error) => `${error.message}\n${error.stack}`).join("\n---------\n"),
        });

        throw new Error("Some frontend exceptions occurred");
      }
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";

// TODO: do we want this? It would be better to have typescript for it (decorators needs babel plugin)
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
export function step(stepName) {
  return function decorator(target, context) {
    return function replacementMethod(...args) {
      const name = `${stepName || context.name} (${this.name})`;
      return test.step(name, async () => {
        return await target.call(this, ...args);
      });
    };
  };
}
