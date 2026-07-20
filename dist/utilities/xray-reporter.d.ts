import { FullConfig, FullResult, Suite, TestCase, TestResult } from '@playwright/test/reporter';
/**
 * Reporter class for uploading test results to Xray
 */
declare class XRayReporter {
    private styles;
    constructor();
    /**
     * Authenticates with Xray API using client credentials
     * @returns {Promise<string>} The authentication token
     * @throws {Error} If authentication fails
     */
    authenticateWithXray(): Promise<string>;
    /**
     * Uploads test results to Xray
     * @param {string} token - The authentication token
     * @param {string} xmlContent - The JUnit XML content to upload
     * @returns {Promise<void>}
     * @throws {Error} If upload fails
     */
    uploadTestResults(token: string, xmlContent: string): Promise<void>;
    /**
     * Called when test run begins
     * @param suite - Test suite object containing all tests
     */
    onBegin(_config: FullConfig, suite: Suite): void;
    /**
     * Called when a test begins
     * @param test - Test case object
     */
    onTestBegin(test: TestCase, _result: TestResult): void;
    /**
     * Called when a test ends
     * @param {Object} test - Test case object
     * @param {Object} result - Test result object containing status and other details
     */
    onTestEnd(test: TestCase, result: TestResult): void;
    /**
     * Called when all tests have finished
     * @param result - Full test run result object containing status and duration
     */
    onEnd(result: FullResult): Promise<void>;
}
export default XRayReporter;
