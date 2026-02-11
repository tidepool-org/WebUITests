"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const env_1 = __importDefault(require("./env"));
const xray_graphql_evidence_1 = require("./xray-graphql-evidence");
/**
 * Unified Xray JSON Reporter for Playwright
 * Maps rich Playwright test data to Xray's JSON format with intelligent evidence handling
 */
class XrayJsonReporter {
    constructor() {
        this.styles = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️',
            upload: '🚀',
            test: '🧪',
            evidence: '📎',
            separator: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        };
        this.startTime = '';
        this.endTime = '';
        this.deferredEvidenceUploads = [];
    }
    /**
     * Authenticates with Xray API using client credentials
     */
    async authenticateWithXray() {
        const startAuth = Date.now();
        try {
            console.log(`${this.styles.info} Authenticating with Xray Cloud API...`);
            if (!env_1.default.XRAY_CLIENT_ID || !env_1.default.XRAY_CLIENT_SECRET) {
                throw new Error('XRAY_CLIENT_ID and XRAY_CLIENT_SECRET are required for authentication');
            }
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
                throw new Error(`Authentication failed (HTTP ${response.status}): ${errorText || 'No error details'}`);
            }
            const token = await response.text();
            const cleanToken = token.replace(/"/g, ''); // Remove quotes from token
            if (!cleanToken || cleanToken.length < 10) {
                throw new Error(`Invalid token received: ${cleanToken.substring(0, 20)}...`);
            }
            const authDuration = Date.now() - startAuth;
            console.log(`${this.styles.success} Successfully authenticated with Xray (${authDuration}ms)`);
            return cleanToken;
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
     * Get file size in bytes
     */
    getFileSize(filePath) {
        try {
            const stats = node_fs_1.default.statSync(filePath);
            return stats.size;
        }
        catch (error) {
            return 0;
        }
    }
    /**
     * Classifies evidence based on type, size, and test result
     */
    classifyEvidence(attachment, testStatus, contentType) {
        const filePath = attachment.path;
        if (!filePath || !node_fs_1.default.existsSync(filePath)) {
            return 'skip';
        }
        const sizeBytes = this.getFileSize(filePath);
        const sizeKB = sizeBytes / 1024;
        const thresholdKB = env_1.default.XRAY_EVIDENCE_SIZE_THRESHOLD_KB || 100;
        // Videos: Only for failed tests
        if (contentType.includes('video')) {
            if (testStatus !== 'passed') {
                return 'deferred'; // Always defer videos (large files)
            }
            return 'skip';
        }
        // Screenshots (PNG/JPEG): Always include
        if (contentType.includes('image')) {
            if (sizeKB < thresholdKB) {
                return 'inline';
            }
            return 'deferred';
        }
        // JSON responses: Always inline (small)
        if (contentType.includes('json')) {
            return 'inline';
        }
        // Other attachments: Check size
        if (sizeKB < thresholdKB) {
            return 'inline';
        }
        return 'deferred';
    }
    /**
     * Extracts step information from test annotations and maps evidence
     */
    async extractSteps(annotations, attachments, testStatus) {
        const steps = [];
        const classifiedEvidence = [];
        const stepAnnotations = annotations.filter(ann => ann.type.startsWith('Step Duration:'));
        for (let i = 0; i < stepAnnotations.length; i += 1) {
            const stepAnn = stepAnnotations[i];
            const stepName = stepAnn.type.replace('Step Duration: ', '');
            const duration = stepAnn.description;
            const stepNumber = i + 1;
            // Find associated step attachments using step number pattern
            const stepPattern = `step-${stepNumber.toString().padStart(2, '0')}`;
            const stepAttachments = attachments.filter(att => att.name.toLowerCase().includes(stepPattern));
            const step = {
                action: stepName,
                data: `Duration: ${duration}`,
                result: stepName.includes('Then') ? stepName : undefined,
                status: 'PASS', // Will be updated if test failed
                evidences: [],
            };
            // Classify and process step evidence
            for (const attachment of stepAttachments) {
                if (attachment.path && node_fs_1.default.existsSync(attachment.path)) {
                    const contentType = attachment.contentType || 'application/octet-stream';
                    const classification = this.classifyEvidence(attachment, testStatus, contentType);
                    if (classification !== 'skip') {
                        const sizeBytes = this.getFileSize(attachment.path);
                        if (classification === 'inline') {
                            // Embed in Xray JSON
                            const base64Data = await this.fileToBase64(attachment.path);
                            if (base64Data) {
                                step.evidences?.push({
                                    data: base64Data,
                                    filename: node_path_1.default.basename(attachment.path),
                                    contentType,
                                });
                            }
                        }
                        else {
                            // Mark for deferred upload
                            classifiedEvidence.push({
                                evidence: {
                                    data: '', // Will be loaded during GraphQL upload
                                    filename: node_path_1.default.basename(attachment.path),
                                    contentType,
                                },
                                classification: 'deferred',
                                stepIndex: i,
                                filePath: attachment.path,
                                fileSize: sizeBytes,
                            });
                        }
                    }
                }
            }
            steps.push(step);
        }
        return { steps, classified: classifiedEvidence };
    }
    /**
     * Maps Playwright test result to Xray test format
     */
    async mapPlaywrightTestToXray(testCase, testResult) {
        const tags = testCase.tags || [];
        const annotations = testResult.annotations || [];
        const attachments = testResult.attachments || [];
        const testStatus = testResult.status;
        // Extract steps from annotations
        const { steps, classified: stepDeferred } = await this.extractSteps(annotations, attachments, testStatus);
        // Mark failed steps if test failed
        if (testStatus !== 'passed' && steps.length > 0) {
            steps[steps.length - 1].status = 'FAIL';
            steps[steps.length - 1].actualResult = testResult.error?.message || 'Test failed';
        }
        // Collect test-level evidence (screenshots, videos)
        const testEvidences = [];
        const testLevelDeferred = [];
        for (const attachment of attachments) {
            // Only process test-level evidence (not step-level)
            if (attachment.path &&
                node_fs_1.default.existsSync(attachment.path) &&
                !attachment.name.toLowerCase().includes('step-')) {
                const contentType = attachment.contentType || 'application/octet-stream';
                const classification = this.classifyEvidence(attachment, testStatus, contentType);
                if (classification !== 'skip') {
                    const sizeBytes = this.getFileSize(attachment.path);
                    if (classification === 'inline') {
                        const base64Data = await this.fileToBase64(attachment.path);
                        if (base64Data) {
                            testEvidences.push({
                                data: base64Data,
                                filename: attachment.name,
                                contentType,
                            });
                        }
                    }
                    else {
                        testLevelDeferred.push({
                            evidence: {
                                data: '',
                                filename: attachment.name,
                                contentType,
                            },
                            classification: 'deferred',
                            filePath: attachment.path,
                            fileSize: sizeBytes,
                        });
                    }
                }
            }
        }
        const xrayTest = {
            testInfo: {
                summary: testCase.title,
                type: 'Generic',
                projectKey: env_1.default.XRAY_PROJECT_KEY || 'SAND',
                labels: tags,
            },
            status: this.getTestStatus(testStatus),
            comment: testResult.error?.message,
            evidences: testEvidences.length > 0 ? testEvidences : undefined,
            steps: steps.length > 0 ? steps : undefined,
        };
        return {
            test: xrayTest,
            deferred: [...stepDeferred, ...testLevelDeferred],
        };
    }
    /**
     * Converts Playwright JSON results to Xray format
     */
    async convertPlaywrightJsonToXray(playwrightJsonPath) {
        const jsonContent = node_fs_1.default.readFileSync(playwrightJsonPath, 'utf8');
        const playwrightResult = JSON.parse(jsonContent);
        const tests = [];
        this.deferredEvidenceUploads = []; // Reset deferred uploads
        // Process all test suites
        for (const suite of playwrightResult.suites || []) {
            await this.processSuite(suite, tests);
        }
        const testExecKey = process.env.TEST_EXECUTION_KEY || process.env.testExecKey;
        const targetEnv = process.env.TARGET_ENV || 'qa1';
        // Calculate statistics
        const passedCount = tests.filter(t => t.status === 'PASS').length;
        const failedCount = tests.filter(t => t.status === 'FAIL').length;
        const pendingCount = tests.filter(t => t.status === 'PENDING').length;
        const xrayResult = {
            info: {
                summary: `Playwright Test Execution - ${new Date().toISOString()}`,
                description: `Automated test execution for ${targetEnv} environment\n\nResults: ${passedCount} passed, ${failedCount} failed, ${pendingCount} pending`,
                version: '1.0',
                testExecutionKey: testExecKey && testExecKey !== 'none' && testExecKey.trim() !== ''
                    ? testExecKey
                    : undefined,
                startDate: playwrightResult.stats?.startTime || new Date().toISOString(),
                finishDate: new Date(new Date(playwrightResult.stats?.startTime || Date.now()).getTime() +
                    (playwrightResult.stats?.duration || 0)).toISOString(),
                testEnvironments: [targetEnv],
            },
            tests,
        };
        // Log deferred evidence summary
        if (this.deferredEvidenceUploads.length > 0) {
            const totalSizeKB = this.deferredEvidenceUploads.reduce((sum, d) => sum + this.getFileSize(d.filePath) / 1024, 0);
            console.log(`${this.styles.evidence} ${this.deferredEvidenceUploads.length} evidence files marked for deferred upload (${totalSizeKB.toFixed(1)} KB)`);
        }
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
                    const { test: xrayTest, deferred } = await this.mapPlaywrightTestToXray(spec, result);
                    tests.push(xrayTest);
                    // Store deferred evidence for later upload
                    // Note: We'll need test run IDs from import response to upload these
                    for (const evidence of deferred) {
                        this.deferredEvidenceUploads.push({
                            testRunId: '', // Will be populated after import
                            testRunStepId: evidence.stepIndex !== undefined ? '' : undefined,
                            filePath: evidence.filePath,
                            filename: evidence.evidence.filename,
                            contentType: evidence.evidence.contentType,
                            stepAction: evidence.stepIndex !== undefined
                                ? xrayTest.steps?.[evidence.stepIndex]?.action
                                : undefined,
                        });
                    }
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
            const uploadStart = Date.now();
            const payloadSize = JSON.stringify(xrayResult).length;
            const payloadSizeKB = (payloadSize / 1024).toFixed(1);
            console.log(`${this.styles.info} Uploading test execution to Xray...`);
            console.log(`${this.styles.info} Payload: ${xrayResult.tests.length} tests, ${payloadSizeKB} KB`);
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
                throw new Error(`Upload failed (HTTP ${response.status}): ${errorText}`);
            }
            const result = await response.json();
            const uploadDuration = Date.now() - uploadStart;
            console.log(`${this.styles.success} Successfully uploaded to Xray (${uploadDuration}ms)`);
            console.log(`${this.styles.success} Test Execution Key: ${result.testExecIssue?.key || 'N/A'}`);
            return result;
        }
        catch (error) {
            console.error(`${this.styles.error} Failed to upload to Xray:`, error);
            throw error;
        }
    }
    /**
     * Upload deferred evidence via GraphQL
     */
    async uploadDeferredEvidenceViaGraphQL(importResponse) {
        try {
            console.log(`${this.styles.evidence} Uploading ${this.deferredEvidenceUploads.length} deferred evidence files via GraphQL...`);
            // Get fresh token for GraphQL
            const token = await this.authenticateWithXray();
            // Create GraphQL client
            const graphqlClient = new xray_graphql_evidence_1.XrayGraphQLClient();
            graphqlClient.setAuthToken(token);
            // Note: The import response doesn't directly provide test run IDs
            // For now, we'll skip GraphQL upload and log a warning
            // This requires additional API calls to fetch test run details
            console.log(`${this.styles.warning} GraphQL evidence upload requires test run ID mapping`);
            console.log(`${this.styles.info} Test Execution: ${importResponse.testExecIssue?.key}`);
            console.log(`${this.styles.info} Deferred uploads will be enhanced in a future update to fetch test run IDs`);
            // TODO: Implement test run ID fetching via GraphQL query
            // Query: { getTestExecution(issueId: "...") { testRuns { id, test { summary } } } }
            // Then map playwright test titles to test run IDs
            // Then call graphqlClient.uploadBatch(uploadsWithIds)
        }
        catch (error) {
            console.error(`${this.styles.error} Failed to upload deferred evidence:`, error);
            // Don't throw - evidence upload is non-critical
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
            const processStart = Date.now();
            console.log(`\n${this.styles.separator}`);
            console.log(`${this.styles.info} Processing Playwright results for Xray...`);
            console.log(`${this.styles.info} Project Key: ${env_1.default.XRAY_PROJECT_KEY || 'SAND'}`);
            console.log(`${this.styles.info} Environment: ${process.env.TARGET_ENV || 'qa1'}`);
            const testExecKey = process.env.TEST_EXECUTION_KEY || process.env.testExecKey;
            if (testExecKey && testExecKey !== 'none' && testExecKey.trim() !== '') {
                console.log(`${this.styles.info} Linking to Test Execution: ${testExecKey}`);
            }
            else {
                console.log(`${this.styles.info} Creating new Test Execution`);
            }
            const xrayResult = await this.convertPlaywrightJsonToXray(playwrightJsonPath);
            // Save converted result for debugging
            node_fs_1.default.writeFileSync('test-results/xray-execution.json', JSON.stringify(xrayResult, null, 2));
            console.log(`${this.styles.info} Saved Xray JSON to: test-results/xray-execution.json`);
            const importResponse = await this.uploadToXray(xrayResult);
            // Phase 3 - Upload deferred evidence via GraphQL
            if (this.deferredEvidenceUploads.length > 0 && importResponse) {
                await this.uploadDeferredEvidenceViaGraphQL(importResponse);
            }
            const totalDuration = Date.now() - processStart;
            console.log(`${this.styles.upload} Xray upload completed successfully (${totalDuration}ms)`);
            console.log(`${this.styles.separator}\n`);
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
        // Only attempt upload if Xray credentials and execution key are configured
        const testExecKey = process.env.TEST_EXECUTION_KEY || process.env.testExecKey;
        if (env_1.default.XRAY_CLIENT_ID && env_1.default.XRAY_CLIENT_SECRET && testExecKey && testExecKey !== 'none') {
            const jsonPath = 'test-results/last-run.json';
            if (node_fs_1.default.existsSync(jsonPath)) {
                await this.processAndUpload(jsonPath);
            }
        }
    }
}
exports.default = XrayJsonReporter;
