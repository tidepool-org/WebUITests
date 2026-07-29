import { FullConfig, FullResult, Suite, TestCase, TestResult } from '@playwright/test/reporter';
interface XrayTestStep {
    action: string;
    data?: string;
    result?: string;
    status: 'PASS' | 'FAIL' | 'PENDING';
    actualResult?: string;
    evidences?: Array<{
        data: string;
        filename: string;
        contentType: string;
    }>;
}
interface XrayTest {
    testKey?: string;
    testInfo: {
        summary: string;
        type: 'Manual' | 'Cucumber' | 'Generic';
        projectKey: string;
        labels?: string[];
    };
    status: 'PASS' | 'FAIL' | 'PENDING' | 'EXECUTING';
    comment?: string;
    evidences?: Array<{
        data: string;
        filename: string;
        contentType: string;
    }>;
    steps?: XrayTestStep[];
    examples?: string[];
}
interface XrayExecutionResult {
    info: {
        summary: string;
        description: string;
        version?: string;
        testPlanKey?: string;
        testExecutionKey?: string;
        startDate: string;
        finishDate: string;
        testEnvironments?: string[];
    };
    tests: XrayTest[];
}
/**
 * Unified Xray JSON Reporter for Playwright
 * Maps rich Playwright test data to Xray's JSON format with step-by-step evidence
 */
declare class XrayJsonReporter {
    private styles;
    private startTime;
    private endTime;
    /**
     * Authenticates with Xray API using client credentials
     */
    authenticateWithXray(): Promise<string>;
    /**
     * Converts file to base64 string for Xray evidence
     */
    private fileToBase64;
    /**
     * Extracts step information from test annotations
     */
    private extractSteps;
    /**
     * Maps Playwright test result to Xray test format
     */
    private mapPlaywrightTestToXray;
    /**
     * Converts Playwright JSON results to Xray format
     */
    convertPlaywrightJsonToXray(playwrightJsonPath: string): Promise<XrayExecutionResult>;
    /**
     * Recursively processes test suites
     */
    private processSuite;
    /**
     * Uploads Xray execution result to Xray
     */
    uploadToXray(xrayResult: XrayExecutionResult): Promise<void>;
    /**
     * Main method to process and upload results
     */
    processAndUpload(playwrightJsonPath: string): Promise<void>;
    /**
     * Reporter lifecycle methods for direct Playwright integration
     */
    onBegin(_config: FullConfig, suite: Suite): void;
    onTestBegin(test: TestCase, _result: TestResult): void;
    onTestEnd(test: TestCase, result: TestResult): void;
    onEnd(result: FullResult): Promise<void>;
}
export default XrayJsonReporter;
