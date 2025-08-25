"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const env_1 = __importDefault(require("./env"));
/**
 * Unified Xray JSON Reporter for Playwright
 * Maps rich Playwright test data to Xray's JSON format with step-by-step evidence
 */
class XrayJsonReporter {
    constructor() {
        this.styles = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⛔️',
            upload: '🚀',
            test: '🧪',
            separator: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        };
        this.startTime = '';
        this.endTime = '';
    }
    /**
     * Authenticates with Xray API using client credentials
     */
    async authenticateWithXray() {
        try {
            console.log(`${this.styles.info} Authenticating with Xray...`);
            const response = await fetch('https://xray.cloud.getxray.app/api/v1/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    client_id: env_1.default.XRAY_CLIENT_ID,
                    client_secret: env_1.default.XRAY_CLIENT_SECRET,
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, Response: ${errorText}`);
            }
            const token = await response.text();
            console.log(`${this.styles.success} Successfully authenticated with Xray`);
            return token.replace(/"/g, ''); // Remove quotes from token
        }
        catch (error) {
            console.error(`${this.styles.error} Failed to authenticate with Xray:`, error);
            throw error;
        }
    }
    /**
     * Maps Playwright test status to Xray status
     */
    getTestStatus(status) {
        if (status === 'passed')
            return 'PASS';
        if (status === 'skipped')
            return 'PENDING';
        return 'FAIL';
    }
    /**
     * Converts file to base64 string for Xray evidence
     */
    async fileToBase64(filePath) {
        try {
            const fileBuffer = node_fs_1.default.readFileSync(filePath);
            return fileBuffer.toString('base64');
        }
        catch (error) {
            console.warn(`${this.styles.warning} Could not read file ${filePath}:`, error);
            return '';
        }
    }
    /**
     * Extracts step information from test annotations
     */
    async extractSteps(annotations, attachments) {
        const steps = [];
        const stepAnnotations = annotations.filter(ann => ann.type.startsWith('Step Duration:'));
        for (const stepAnn of stepAnnotations) {
            const stepName = stepAnn.type.replace('Step Duration: ', '');
            const duration = stepAnn.description;
            // Find associated step attachments
            const stepAttachments = attachments.filter(att => att.name.toLowerCase().includes(stepName.toLowerCase().substring(0, 20)));
            const step = {
                action: stepName,
                data: `Duration: ${duration}`,
                result: stepName.includes('Then') ? stepName : undefined,
                status: 'PASS', // Will be updated based on test result
                evidences: [],
            };
            // Add evidence for this step
            for (const attachment of stepAttachments) {
                if (attachment.path && node_fs_1.default.existsSync(attachment.path)) {
                    step.evidences?.push({
                        data: await this.fileToBase64(attachment.path),
                        filename: node_path_1.default.basename(attachment.path),
                        contentType: attachment.contentType || 'application/octet-stream',
                    });
                }
            }
            steps.push(step);
        }
        return steps;
    }
    /**
     * Maps Playwright test result to Xray test format
     */
    async mapPlaywrightTestToXray(testCase, testResult) {
        const tags = testCase.tags || [];
        const annotations = testResult.annotations || [];
        const attachments = testResult.attachments || [];
        // Extract steps from annotations
        const steps = await this.extractSteps(annotations, attachments);
        // Mark failed steps if test failed
        if (testResult.status !== 'passed' && steps.length > 0) {
            steps[steps.length - 1].status = 'FAIL';
            steps[steps.length - 1].actualResult = testResult.error?.message || 'Test failed';
        }
        // Collect test-level evidence (screenshots, videos)
        const testEvidences = [];
        for (const attachment of attachments) {
            if (attachment.path && node_fs_1.default.existsSync(attachment.path)) {
                // Add main test evidence (final screenshots, videos, etc.)
                if (attachment.name.includes('screenshot') || attachment.name.includes('video')) {
                    testEvidences.push({
                        data: await this.fileToBase64(attachment.path),
                        filename: attachment.name,
                        contentType: attachment.contentType || 'application/octet-stream',
                    });
                }
            }
        }
        const xrayTest = {
            testInfo: {
                summary: testCase.title,
                type: 'Generic',
                projectKey: 'XT', // Could be made configurable
                labels: tags,
            },
            status: this.getTestStatus(testResult.status),
            comment: testResult.error?.message,
            evidences: testEvidences,
            steps: steps.length > 0 ? steps : undefined,
        };
        return xrayTest;
    }
    /**
     * Converts Playwright JSON results to Xray format
     */
    async convertPlaywrightJsonToXray(playwrightJsonPath) {
        const jsonContent = node_fs_1.default.readFileSync(playwrightJsonPath, 'utf8');
        const playwrightResult = JSON.parse(jsonContent);
        const tests = [];
        // Process all test suites
        for (const suite of playwrightResult.suites || []) {
            await this.processSuite(suite, tests);
        }
        const testExecKey = process.env.TEST_EXECUTION_KEY || process.env.testExecKey;
        const targetEnv = process.env.TARGET_ENV || 'qa1';
        const xrayResult = {
            info: {
                summary: `Playwright Test Execution - ${new Date().toISOString()}`,
                description: `Automated test execution for ${targetEnv} environment`,
                version: '1.0',
                testExecutionKey: testExecKey !== 'none' ? testExecKey : undefined,
                startDate: playwrightResult.stats?.startTime || new Date().toISOString(),
                finishDate: new Date(new Date(playwrightResult.stats?.startTime || Date.now()).getTime() +
                    (playwrightResult.stats?.duration || 0)).toISOString(),
                testEnvironments: [targetEnv],
            },
            tests,
        };
        return xrayResult;
    }
    /**
     * Recursively processes test suites
     */
    async processSuite(suite, tests) {
        // Process specs in this suite
        for (const spec of suite.specs || []) {
            for (const test of spec.tests || []) {
                for (const result of test.results || []) {
                    const xrayTest = await this.mapPlaywrightTestToXray(spec, result);
                    tests.push(xrayTest);
                }
            }
        }
        // Process nested suites
        for (const nestedSuite of suite.suites || []) {
            await this.processSuite(nestedSuite, tests);
        }
    }
    /**
     * Uploads Xray execution result to Xray
     */
    async uploadToXray(xrayResult) {
        try {
            console.log(`${this.styles.info} Uploading test execution to Xray...`);
            const token = await this.authenticateWithXray();
            const response = await fetch('https://xray.cloud.getxray.app/api/v2/import/execution', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(xrayResult),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, Response: ${errorText}`);
            }
            const result = await response.json();
            console.log(`${this.styles.success} Successfully uploaded to Xray. Execution Key: ${result.key}`);
        }
        catch (error) {
            console.error(`${this.styles.error} Failed to upload to Xray:`, error);
            throw error;
        }
    }
    /**
     * Main method to process and upload results
     */
    async processAndUpload(playwrightJsonPath) {
        if (!(env_1.default.XRAY_CLIENT_ID && env_1.default.XRAY_CLIENT_SECRET)) {
            console.log(`${this.styles.warning} No Xray credentials found, skipping upload to JIRA Xray`);
            return;
        }
        try {
            console.log(`${this.styles.info} Processing Playwright results...`);
            const xrayResult = await this.convertPlaywrightJsonToXray(playwrightJsonPath);
            // Save converted result for debugging
            node_fs_1.default.writeFileSync('test-results/xray-execution.json', JSON.stringify(xrayResult, null, 2));
            await this.uploadToXray(xrayResult);
            console.log(`${this.styles.upload} Xray upload completed successfully`);
        }
        catch (error) {
            console.error(`${this.styles.error} Failed to process and upload:`, error);
            throw error;
        }
    }
    /**
     * Reporter lifecycle methods for direct Playwright integration
     */
    onBegin(_config, suite) {
        this.startTime = new Date().toISOString();
        console.log(`\n${this.styles.separator}`);
        console.log(`${this.styles.test} Starting test run with ${suite.allTests().length} tests`);
        console.log(`${this.styles.separator}\n`);
    }
    onTestBegin(test, _result) {
        console.log(`${this.styles.test} Starting: ${test.title}`);
    }
    onTestEnd(test, result) {
        const statusEmoji = result.status === 'passed' ? this.styles.success : this.styles.error;
        console.log(`${statusEmoji} Finished: ${test.title} (${result.status})`);
    }
    async onEnd(result) {
        this.endTime = new Date().toISOString();
        console.log(`\n${this.styles.separator}`);
        console.log(`${this.styles.info} Test Run Summary:`);
        console.log(`Status: ${result.status === 'passed' ? this.styles.success : this.styles.error} ${result.status}`);
        console.log(`Duration: ${result.duration}ms`);
        console.log(`${this.styles.separator}\n`);
        // Auto-upload if JSON results are available
        const jsonPath = 'test-results/last-run.json';
        if (node_fs_1.default.existsSync(jsonPath)) {
            await this.processAndUpload(jsonPath);
        }
    }
}
exports.default = XrayJsonReporter;
