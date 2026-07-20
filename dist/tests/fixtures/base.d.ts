import { Page, PlaywrightTestArgs, PlaywrightTestOptions, PlaywrightWorkerArgs, PlaywrightWorkerOptions, TestType } from '@playwright/test';
interface CustomFixtures {
    timeLogger: Page;
    timeStepLogger: Page;
    stepTimer: Page;
    stepScreenshoter: Page;
    exceptionLogger: Page;
}
export declare const test: TestType<PlaywrightTestArgs & PlaywrightTestOptions & CustomFixtures, PlaywrightWorkerArgs & PlaywrightWorkerOptions>;
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
export declare function step(stepName?: string): (target: any, context: ClassMethodDecoratorContext) => (this: {
    name: string;
}, ...args: any[]) => Promise<any>;
