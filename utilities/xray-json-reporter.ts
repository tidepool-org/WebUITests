import fs from 'node:fs';
import path from 'node:path';
import { FullConfig, FullResult, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import env from './env';
import {
  XrayTestStepDefinition,
  XrayTestStepResult,
  XrayTest,
  XrayExecutionResult,
  XrayEvidence,
  XrayImportResponse,
} from './xray-types';

/**
 * Xray JSON Reporter for Playwright
 * Maps Playwright test data to Xray Cloud JSON format and uploads results
 */
class XrayJsonReporter {
  private styles = {
    success: '\u2705',
    error: '\u274C',
    info: '\u2139\uFE0F',
    warning: '\u26A0\uFE0F',
    upload: '\uD83D\uDE80',
    test: '\uD83E\uDDEA',
    evidence: '\uD83D\uDCCE',
    separator:
      '\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501',
  };

  /**
   * Authenticates with Xray API using client credentials
   */
  async authenticateWithXray(): Promise<string> {
    const startAuth = Date.now();
    try {
      console.log(`${this.styles.info} Authenticating with Xray Cloud API...`);

      if (!env.XRAY_CLIENT_ID || !env.XRAY_CLIENT_SECRET) {
        throw new Error('XRAY_CLIENT_ID and XRAY_CLIENT_SECRET are required for authentication');
      }

      const response = await fetch('https://xray.cloud.getxray.app/api/v1/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: env.XRAY_CLIENT_ID,
          client_secret: env.XRAY_CLIENT_SECRET,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Authentication failed (HTTP ${response.status}): ${errorText || 'No error details'}`,
        );
      }

      const token = await response.text();
      const cleanToken = token.replace(/"/g, '');

      if (!cleanToken || cleanToken.length < 10) {
        throw new Error(`Invalid token received: ${cleanToken.substring(0, 20)}...`);
      }

      const authDuration = Date.now() - startAuth;
      console.log(
        `${this.styles.success} Successfully authenticated with Xray (${authDuration}ms)`,
      );
      return cleanToken;
    } catch (error) {
      console.error(`${this.styles.error} Failed to authenticate with Xray:`, error);
      throw error;
    }
  }

  /**
   * Maps Playwright test status to Xray Cloud status
   * Note: Xray Cloud uses PASSED/FAILED, Xray Server uses PASS/FAIL
   */
  private getTestStatus(status: string): 'PASSED' | 'FAILED' | 'TODO' | 'EXECUTING' {
    if (status === 'passed') return 'PASSED';
    if (status === 'skipped') return 'TODO';
    return 'FAILED';
  }

  /**
   * Converts file to base64 string for Xray evidence
   */
  private async fileToBase64(filePath: string): Promise<string> {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      return fileBuffer.toString('base64');
    } catch (error) {
      console.warn(`${this.styles.warning} Could not read file ${filePath}:`, error);
      return '';
    }
  }

  /**
   * Determines if an attachment should be included as evidence
   * Videos and screenshots are only included for failed tests to keep payloads small.
   * JSON API responses are always included.
   */
  private shouldIncludeEvidence(attachment: any, testStatus: string, contentType: string): boolean {
    // Check if attachment has embedded base64 data (from JSON) or file path
    const hasData = !!attachment.body || (attachment.path && fs.existsSync(attachment.path));

    if (!hasData) {
      return false;
    }

    // Videos: Only for failed tests
    if (contentType.includes('video')) {
      return testStatus !== 'passed';
    }

    // Screenshots: Only for failed tests — passed tests generate many step screenshots
    // that balloon the payload and cause Xray HTTP 500 errors
    if (contentType.includes('image')) {
      return testStatus !== 'passed';
    }

    // JSON API responses and other non-visual attachments: always include
    return true;
  }

  // Maximum size (bytes) for a single evidence item sent to Xray.
  // Xray Cloud returns HTTP 500 on payloads over ~1MB per test.
  private readonly MAX_EVIDENCE_BYTES = 200 * 1024; // 200 KB

  private isGivenStep(stepName: string): boolean {
    return stepName.toLowerCase().startsWith('given ');
  }

  private isWhenStep(stepName: string): boolean {
    return stepName.toLowerCase().startsWith('when ');
  }

  private isThenStep(stepName: string): boolean {
    const lower = stepName.toLowerCase();
    return lower.startsWith('then ') || lower.startsWith('and ');
  }

  private parseDuration(duration: string): number {
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Collects inline evidence for given step indices
   */
  private async collectStepEvidence(
    indices: number[],
    attachments: any[],
    testStatus: string,
    stepStatus = 'PASSED',
    includeImages = true,
  ): Promise<XrayEvidence[]> {
    const evidence: XrayEvidence[] = [];

    for (const stepIndex of indices) {
      const stepNumber = stepIndex + 1;
      const stepPattern = `step-${stepNumber.toString().padStart(2, '0')}`;
      const stepAttachments = attachments.filter(att =>
        att.name.toLowerCase().includes(stepPattern),
      );

      for (const attachment of stepAttachments) {
        const contentType = attachment.contentType || 'application/octet-stream';

        // Pass per-step status so screenshots are only included for the failed step
        if (
          this.shouldIncludeEvidence(attachment, stepStatus, contentType) &&
          (!contentType.includes('image') || includeImages)
        ) {
          let base64Data: string | null = null;
          let filename = attachment.name || 'attachment';

          // Check if attachment has embedded base64 data (from JSON)
          if (attachment.body) {
            // Handle both Buffer and string cases
            base64Data =
              typeof attachment.body === 'string'
                ? attachment.body
                : attachment.body.toString('base64');
          }
          // Check if attachment has file path to read from
          else if (attachment.path && fs.existsSync(attachment.path)) {
            base64Data = await this.fileToBase64(attachment.path);
            filename = path.basename(attachment.path);
          }

          if (base64Data) {
            // Skip evidence items that exceed the size cap to prevent Xray HTTP 500 errors
            const byteSize = Buffer.byteLength(base64Data, 'utf8');
            if (byteSize > this.MAX_EVIDENCE_BYTES) {
              console.log(
                `${this.styles.warning} Skipping oversized evidence (${(byteSize / 1024).toFixed(0)}KB > ${this.MAX_EVIDENCE_BYTES / 1024}KB): ${filename}`,
              );
            } else {
              evidence.push({
                data: base64Data,
                filename,
                contentType,
              });
            }
          }
        }
      }
    }

    return evidence;
  }

  /**
   * Extracts step information from test annotations with Given/When/Then logic:
   * - Given: standalone step (action only)
   * - When: step with action, result = all consecutive Then steps that follow
   * - Then/And: combined as result of the preceding When step
   *
   * Returns both step definitions (for testInfo.steps) and step results (for test.steps)
   */
  private async extractSteps(
    annotations: any[],
    attachments: any[],
    testStatus: string,
  ): Promise<{
    stepDefinitions: XrayTestStepDefinition[];
    stepResults: XrayTestStepResult[];
  }> {
    const stepDefinitions: XrayTestStepDefinition[] = [];
    const stepResults: XrayTestStepResult[] = [];
    const stepAnnotations = annotations.filter(ann => ann.type.startsWith('Step Duration:'));

    if (stepAnnotations.length === 0) {
      return { stepDefinitions, stepResults };
    }

    let pendingWhen: { name: string; duration: number; index: number } | null = null;
    let pendingThens: { name: string; duration: number; index: number }[] = [];

    const flushPendingWhen = async () => {
      if (!pendingWhen) return;

      const totalDuration =
        pendingWhen.duration + pendingThens.reduce((sum, t) => sum + t.duration, 0);

      const stepDef: XrayTestStepDefinition = {
        action: pendingWhen.name,
      };

      if (pendingThens.length > 0) {
        stepDef.result = pendingThens.map(t => t.name).join('\n');
      }

      stepDefinitions.push(stepDef);

      const stepResult: XrayTestStepResult = {
        status: 'PASSED',
        comment: `Duration: ${totalDuration}ms`,
      };

      // When index: include JSON evidence only (no screenshots)
      const whenEvidence = await this.collectStepEvidence(
        [pendingWhen.index],
        attachments,
        testStatus,
        stepResult.status,
        false,
      );
      // Then indices: include all evidence (screenshots + JSON)
      const thenEvidence = await this.collectStepEvidence(
        pendingThens.map(t => t.index),
        attachments,
        testStatus,
        stepResult.status,
        true,
      );
      const evidence = [...whenEvidence, ...thenEvidence];
      if (evidence.length > 0) {
        stepResult.evidence = evidence;
      }

      stepResults.push(stepResult);
      pendingWhen = null;
      pendingThens = [];
    };

    const addStandaloneStep = async (stepName: string, duration: number, index: number) => {
      stepDefinitions.push({
        action: stepName,
      });

      const stepResult: XrayTestStepResult = {
        status: 'PASSED',
        comment: `Duration: ${duration}ms`,
      };

      // Given/standalone When steps: include JSON evidence only (no screenshots)
      const evidence = await this.collectStepEvidence(
        [index],
        attachments,
        testStatus,
        stepResult.status,
        false,
      );
      if (evidence.length > 0) {
        stepResult.evidence = evidence;
      }

      stepResults.push(stepResult);
    };

    for (let i = 0; i < stepAnnotations.length; i += 1) {
      const stepAnn = stepAnnotations[i];
      const stepName = stepAnn.type.replace('Step Duration: ', '');
      const duration = this.parseDuration(stepAnn.description);

      if (this.isGivenStep(stepName)) {
        await flushPendingWhen();
        await addStandaloneStep(stepName, duration, i);
      } else if (this.isWhenStep(stepName)) {
        await flushPendingWhen();
        pendingWhen = { name: stepName, duration, index: i };
      } else if (this.isThenStep(stepName)) {
        pendingThens.push({ name: stepName, duration, index: i });
      } else {
        await flushPendingWhen();
        await addStandaloneStep(stepName, duration, i);
      }
    }

    await flushPendingWhen();

    return { stepDefinitions, stepResults };
  }

  /**
   * Maps Playwright test result to Xray test format
   */
  private async mapPlaywrightTestToXray(
    testCase: TestCase,
    testResult: TestResult,
  ): Promise<XrayTest> {
    const annotations = testResult.annotations || [];
    const attachments = testResult.attachments || [];
    const testStatus = testResult.status;

    const { stepDefinitions, stepResults } = await this.extractSteps(
      annotations,
      attachments,
      testStatus,
    );

    // Mark last step as failed if test failed — duration stays in comment, error goes in actualResult
    if (testStatus !== 'passed' && stepResults.length > 0) {
      const lastStep = stepResults[stepResults.length - 1];
      lastStep.status = 'FAILED';
      lastStep.actualResult = testResult.error?.message || 'Test failed';
    }

    // Remove test-level evidence to avoid duplication (using step-level evidence instead)

    return {
      testInfo: {
        summary: testCase.title,
        type: 'Manual',
        projectKey: env.XRAY_PROJECT_KEY || 'QAE',
        steps: stepDefinitions.length > 0 ? stepDefinitions : undefined,
      },
      status: this.getTestStatus(testStatus),
      comment: testResult.error?.message,
      steps: stepResults.length > 0 ? stepResults : undefined,
    };
  }

  /**
   * Converts Playwright JSON results to Xray format
   */
  async convertPlaywrightJsonToXray(playwrightJsonPath: string): Promise<XrayExecutionResult> {
    const jsonContent = fs.readFileSync(playwrightJsonPath, 'utf8');
    const playwrightResult = JSON.parse(jsonContent);

    const tests: XrayTest[] = [];

    for (const suite of playwrightResult.suites || []) {
      await this.processSuite(suite, tests);
    }

    const testExecKey = env.TEST_EXECUTION_KEY;
    const targetEnv = env.TARGET_ENV;

    const passedCount = tests.filter(t => t.status === 'PASSED').length;
    const failedCount = tests.filter(t => t.status === 'FAILED').length;
    const todoCount = tests.filter(t => t.status === 'TODO').length;

    const hasExistingExecution = testExecKey && testExecKey !== 'none' && testExecKey.trim() !== '';

    // When linking to an existing execution (e.g., sharded CI runs), skip info to avoid
    // overwriting the execution description with partial per-shard counts.
    return {
      testExecutionKey: hasExistingExecution ? testExecKey : undefined,
      info: hasExistingExecution
        ? undefined
        : {
            summary: `Playwright Test Execution - ${new Date().toISOString()}`,
            description: `Automated test execution for ${targetEnv} environment\n\nResults: ${passedCount} passed, ${failedCount} failed, ${todoCount} skipped`,
            startDate: playwrightResult.stats?.startTime || new Date().toISOString(),
            finishDate: new Date(
              new Date(playwrightResult.stats?.startTime || Date.now()).getTime() +
                (playwrightResult.stats?.duration || 0),
            ).toISOString(),
          },
      tests,
    };
  }

  /**
   * Recursively processes test suites
   */
  private async processSuite(suite: any, tests: XrayTest[]): Promise<void> {
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        const results = test.results || [];
        if (results.length > 0) {
          // Only report the last result (final attempt after retries).
          // Reporting all results produces duplicate testInfo entries for the
          // same Xray test issue, which causes Xray to return HTTP 500.
          const lastResult = results[results.length - 1];
          const xrayTest = await this.mapPlaywrightTestToXray(spec, lastResult);
          tests.push(xrayTest);
        }
      }
    }

    for (const nestedSuite of suite.suites || []) {
      await this.processSuite(nestedSuite, tests);
    }
  }

  /**
   * Uploads Xray execution result to Xray Cloud
   */
  private calculatePayloadSize(xrayResult: XrayExecutionResult): number {
    try {
      // Calculate size safely, handling circular references
      const safePayload = JSON.stringify(xrayResult, (key, value) => {
        if (key === 'parent' || key === 'suite' || key === '_parentSuite' || key === '_project') {
          return undefined;
        }
        return value;
      });
      return safePayload.length;
    } catch (error) {
      console.log(
        `${this.styles.warning} Could not calculate payload size: ${(error as Error).message}`,
      );
      return 0;
    }
  }

  private createTestBatches(tests: XrayTest[]): XrayTest[][] {
    const maxBatchSizeBytes = (env.XRAY_BATCH_SIZE_MB || 20) * 1024 * 1024; // Convert MB to bytes
    const batches: XrayTest[][] = [];
    let currentBatch: XrayTest[] = [];
    let currentBatchSize = 0;

    // Base execution structure size (info + metadata)
    const baseStructureSize = JSON.stringify({
      testExecutionKey: 'SAMPLE-123',
      info: {
        project: 'SAMPLE',
        summary: 'Sample execution',
        description: 'Sample description for size calculation',
        testEnvironments: ['sample'],
      },
      tests: [],
    }).length;

    for (const test of tests) {
      // Calculate size of this individual test
      const testSize = JSON.stringify(test, (key, value) => {
        if (key === 'parent' || key === 'suite' || key === '_parentSuite' || key === '_project') {
          return undefined;
        }
        return value;
      }).length;

      // Check if adding this test would exceed batch size limit
      const projectedBatchSize = currentBatchSize + testSize + baseStructureSize;

      if (projectedBatchSize > maxBatchSizeBytes && currentBatch.length > 0) {
        // Current batch would be too large, start new batch
        console.log(
          `${this.styles.info} Batch ${batches.length + 1}: ${currentBatch.length} tests, ${(currentBatchSize / 1024 / 1024).toFixed(1)}MB`,
        );
        batches.push(currentBatch);
        currentBatch = [test];
        currentBatchSize = testSize;
      } else {
        // Add test to current batch
        currentBatch.push(test);
        currentBatchSize += testSize;
      }

      // Log warning for oversized individual tests
      if (testSize + baseStructureSize > maxBatchSizeBytes) {
        const testSizeMB = ((testSize + baseStructureSize) / 1024 / 1024).toFixed(1);
        console.log(
          `${this.styles.warning} Large test detected: ${testSizeMB}MB (exceeds ${env.XRAY_BATCH_SIZE_MB}MB limit) - will upload as single-test batch`,
        );
      }
    }

    // Don't forget the last batch
    if (currentBatch.length > 0) {
      console.log(
        `${this.styles.info} Batch ${batches.length + 1}: ${currentBatch.length} tests, ${(currentBatchSize / 1024 / 1024).toFixed(1)}MB`,
      );
      batches.push(currentBatch);
    }

    return batches;
  }

  async uploadToXray(xrayResult: XrayExecutionResult): Promise<XrayImportResponse | null> {
    // Check if batching is needed
    const totalSize = this.calculatePayloadSize(xrayResult);
    const maxBatchSizeBytes = (env.XRAY_BATCH_SIZE_MB || 20) * 1024 * 1024;

    if (totalSize > maxBatchSizeBytes && xrayResult.tests.length > 1) {
      console.log(
        `${this.styles.info} Payload size ${(totalSize / 1024 / 1024).toFixed(1)}MB exceeds ${env.XRAY_BATCH_SIZE_MB}MB limit`,
      );
      console.log(
        `${this.styles.info} Splitting ${xrayResult.tests.length} tests into size-capped batches...`,
      );

      return this.uploadInBatches(xrayResult);
    }
    // Single upload for small payloads
    return this.uploadSingleBatch(xrayResult);
  }

  private async uploadInBatches(
    fullResult: XrayExecutionResult,
  ): Promise<XrayImportResponse | null> {
    const testBatches = this.createTestBatches(fullResult.tests);
    let firstUploadResult: XrayImportResponse | null = null;

    console.log(`${this.styles.info} Uploading ${testBatches.length} batches...`);

    for (let i = 0; i < testBatches.length; i += 1) {
      const batchNumber = i + 1;
      const batch = testBatches[i];

      // Create batch payload
      const batchResult: XrayExecutionResult = {
        ...fullResult,
        tests: batch,
      };

      // For subsequent batches after the first, link to the same test execution
      if (i > 0 && firstUploadResult?.testExecIssue?.key) {
        batchResult.testExecutionKey = firstUploadResult.testExecIssue.key;
        // Remove info object for updates (only needed for creation)
        delete batchResult.info;
      }

      console.log(
        `${this.styles.upload} Uploading batch ${batchNumber}/${testBatches.length} (${batch.length} tests)...`,
      );

      try {
        const batchResponse = await this.uploadSingleBatch(batchResult);

        if (i === 0) {
          firstUploadResult = batchResponse;
        }

        if (batchResponse) {
          console.log(`${this.styles.upload} ✅ Batch ${batchNumber} uploaded successfully`);
        }
      } catch (error) {
        console.log(`${this.styles.error} ❌ Batch ${batchNumber} failed: ${error}`);
        // Continue with other batches even if one fails
      }
    }

    return firstUploadResult;
  }

  private async uploadSingleBatch(
    xrayResult: XrayExecutionResult,
    attempt = 1,
    maxAttempts = 4,
  ): Promise<XrayImportResponse | null> {
    try {
      const uploadStart = Date.now();

      // Calculate payload size safely, handling circular references
      let payloadSizeKB = '0';
      try {
        const safePayload = JSON.stringify(xrayResult, (key, value) => {
          if (key === 'parent' || key === 'suite' || key === '_parentSuite' || key === '_project') {
            return undefined;
          }
          return value;
        });
        payloadSizeKB = (safePayload.length / 1024).toFixed(1);
      } catch (sizeError) {
        payloadSizeKB = 'unknown';
      }

      console.log(`${this.styles.info} Uploading test execution to Xray...`);
      console.log(
        `${this.styles.info} Payload: ${xrayResult.tests.length} tests, ${payloadSizeKB} KB`,
      );

      const token = await this.authenticateWithXray();

      const response = await fetch('https://xray.cloud.getxray.app/api/v2/import/execution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(xrayResult, (key, value) => {
          // Skip circular references in upload payload
          if (key === 'parent' || key === 'suite' || key === '_parentSuite' || key === '_project') {
            return undefined;
          }
          return value;
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`Upload failed (HTTP ${response.status}): ${errorText}`);

        // Retry on 500 (Xray internal error, often caused by concurrent shard uploads)
        // with exponential backoff + jitter to avoid re-colliding
        if (response.status === 500 && attempt < maxAttempts) {
          const baseDelay = 5000 * attempt; // 5s, 10s, 15s
          const jitter = Math.floor(Math.random() * 3000); // 0-3s random jitter
          const delay = baseDelay + jitter;
          console.log(
            `${this.styles.warning} Xray 500 on attempt ${attempt}/${maxAttempts}, retrying in ${(delay / 1000).toFixed(1)}s...`,
          );
          await new Promise<void>(resolve => {
            setTimeout(resolve, delay);
          });
          return await this.uploadSingleBatch(xrayResult, attempt + 1, maxAttempts);
        }

        throw error;
      }

      const result: XrayImportResponse = await response.json();
      const uploadDuration = Date.now() - uploadStart;

      console.log(`${this.styles.success} Successfully uploaded to Xray (${uploadDuration}ms)`);
      console.log(
        `${this.styles.success} Test Execution Key: ${result.testExecIssue?.key || 'N/A'}`,
      );

      return result;
    } catch (error) {
      console.error(`${this.styles.error} Failed to upload to Xray:`, error);
      throw error;
    }
  }

  /**
   * Main method to process and upload results
   */
  async processAndUpload(playwrightJsonPath: string): Promise<void> {
    if (!(env.XRAY_CLIENT_ID && env.XRAY_CLIENT_SECRET)) {
      console.log(`${this.styles.warning} No Xray credentials found, skipping upload to JIRA Xray`);
      return;
    }

    try {
      const processStart = Date.now();
      console.log(`\n${this.styles.separator}`);
      console.log(`${this.styles.info} Processing Playwright results for Xray...`);
      console.log(`${this.styles.info} Project Key: ${env.XRAY_PROJECT_KEY || 'SAND'}`);
      console.log(`${this.styles.info} Environment: ${env.TARGET_ENV}`);

      const testExecKey = env.TEST_EXECUTION_KEY;
      if (testExecKey && testExecKey !== 'none' && testExecKey.trim() !== '') {
        console.log(`${this.styles.info} Linking to Test Execution: ${testExecKey}`);
      } else {
        console.log(`${this.styles.info} Creating new Test Execution`);
      }

      const xrayResult = await this.convertPlaywrightJsonToXray(playwrightJsonPath);

      // Save converted result for debugging
      try {
        // Handle circular references when saving debug JSON
        const safeResult = JSON.parse(
          JSON.stringify(xrayResult, (key, value) => {
            // Skip circular references and other problematic fields
            if (
              key === 'parent' ||
              key === 'suite' ||
              key === '_parentSuite' ||
              key === '_project'
            ) {
              return undefined;
            }
            return value;
          }),
        );
        fs.writeFileSync('test-results/xray-execution.json', JSON.stringify(safeResult, null, 2));
        console.log(`${this.styles.info} Saved Xray JSON to: test-results/xray-execution.json`);
      } catch (debugError) {
        console.log(
          `${this.styles.warning} Could not save debug JSON: ${(debugError as Error).message}`,
        );
      }

      if (xrayResult.tests.length === 0) {
        console.log(`${this.styles.warning} No tests to upload, skipping Xray upload`);
        return;
      }

      await this.uploadToXray(xrayResult);

      const totalDuration = Date.now() - processStart;
      console.log(`${this.styles.upload} Xray upload completed successfully (${totalDuration}ms)`);
      console.log(`${this.styles.separator}\n`);
    } catch (error) {
      console.error(`${this.styles.error} Failed to process and upload:`, error);
      throw error;
    }
  }

  /**
   * Reporter lifecycle methods for Playwright integration
   */
  onBegin(_config: FullConfig, suite: Suite): void {
    console.log(`\n${this.styles.separator}`);
    console.log(`${this.styles.test} Starting test run with ${suite.allTests().length} tests`);
    console.log(`${this.styles.separator}\n`);
  }

  onTestBegin(test: TestCase, _result: TestResult): void {
    console.log(`${this.styles.test} Starting: ${test.title}`);
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const statusEmoji = result.status === 'passed' ? this.styles.success : this.styles.error;
    console.log(`${statusEmoji} Finished: ${test.title} (${result.status})`);
  }

  async onEnd(result: FullResult): Promise<void> {
    console.log(`\n${this.styles.separator}`);
    console.log(`${this.styles.info} Test Run Summary:`);
    console.log(
      `Status: ${result.status === 'passed' ? this.styles.success : this.styles.error} ${result.status}`,
    );
    console.log(`Duration: ${result.duration}ms`);
    console.log(`${this.styles.separator}\n`);

    const testExecKey = env.TEST_EXECUTION_KEY;
    if (env.XRAY_CLIENT_ID && env.XRAY_CLIENT_SECRET && testExecKey && testExecKey !== 'none') {
      console.log(`${this.styles.info} Linking to Test Execution: ${testExecKey}`);

      // Check for multiple possible JSON file locations
      const possiblePaths = [
        'test-results/last-run.json',
        'test-results/.last-run.json',
        path.resolve('test-results/last-run.json'),
        path.resolve('test-results/.last-run.json'),
      ];

      let jsonPath: string | null = null;
      for (const testPath of possiblePaths) {
        if (fs.existsSync(testPath)) {
          jsonPath = testPath;
          break;
        }
      }

      if (jsonPath) {
        console.log(`${this.styles.info} Found test results at: ${jsonPath}`);
        try {
          await this.processAndUpload(jsonPath);
        } catch (error) {
          console.log(`${this.styles.error} Xray upload failed: ${error}`);
        }
      } else {
        console.log(`${this.styles.warning} No test results JSON file found for Xray upload`);
        console.log(`${this.styles.info} Checked paths:`, possiblePaths);
      }
    }
  }
}

export default XrayJsonReporter;
