import { TestInfo } from '@playwright/test';
/**
 * Interface for test annotations used in JIRA integration
 */
interface TestAnnotations {
    testKey: string;
    testSummary: string;
    requirements: string;
    testDescription: string;
}
/**
 * Add test annotations to the test info for JIRA integration
 */
export default function addTestAnnotations(testInfo: TestInfo, annotations: TestAnnotations): void;
export {};
