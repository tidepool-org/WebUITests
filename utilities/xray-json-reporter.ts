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
   * Videos are only included for failed tests; other files check size threshold
   */
  private shouldIncludeEvidence(attachment: any, testStatus: string, contentType: string): boolean {
    const filePath = attachment.path;
    if (!filePath || !fs.existsSync(filePath)) {
      return false;
    }

    // Videos: Only for failed tests
    if (contentType.includes('video')) {
      return testStatus !== 'passed';
    }

    return true;
  }

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
  ): Promise<XrayEvidence[]> {
    const evidence: XrayEvidence[] = [];

    for (const stepIndex of indices) {
      const stepNumber = stepIndex + 1;
      const stepPattern = `step-${stepNumber.toString().padStart(2, '0')}`;
      const stepAttachments = attachments.filter(att =>
        att.name.toLowerCase().includes(stepPattern),
      );

      for (const attachment of stepAttachments) {
        if (attachment.path && fs.existsSync(attachment.path)) {
          const contentType = attachment.contentType || 'application/octet-stream';

          if (this.shouldIncludeEvidence(attachment, testStatus, contentType)) {
            const base64Data = await this.fileToBase64(attachment.path);
            if (base64Data) {
              evidence.push({
                data: base64Data,
                filename: path.basename(attachment.path),
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

      const stepDef: XrayTestStepDefinition = {
        action: pendingWhen.name,
        data: `Duration: ${pendingWhen.duration + pendingThens.reduce((sum, t) => sum + t.duration, 0)}ms`,
      };

      if (pendingThens.length > 0) {
        stepDef.result = pendingThens.map(t => t.name).join('\n');
      }

      stepDefinitions.push(stepDef);

      const stepResult: XrayTestStepResult = {
        status: 'PASSED',
      };

      const allIndices = [pendingWhen.index, ...pendingThens.map(t => t.index)];
      const evidence = await this.collectStepEvidence(allIndices, attachments, testStatus);
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
        data: `Duration: ${duration}ms`,
      });

      const stepResult: XrayTestStepResult = {
        status: 'PASSED',
      };

      const evidence = await this.collectStepEvidence([index], attachments, testStatus);
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

    // Mark last step as failed if test failed
    if (testStatus !== 'passed' && stepResults.length > 0) {
      stepResults[stepResults.length - 1].status = 'FAILED';
      stepResults[stepResults.length - 1].actualResult = testResult.error?.message || 'Test failed';
    }

    // Collect test-level evidence (not step-level)
    const testEvidence: XrayEvidence[] = [];

    for (const attachment of attachments) {
      if (
        attachment.path &&
        fs.existsSync(attachment.path) &&
        !attachment.name.toLowerCase().includes('step-')
      ) {
        const contentType = attachment.contentType || 'application/octet-stream';

        if (this.shouldIncludeEvidence(attachment, testStatus, contentType)) {
          const base64Data = await this.fileToBase64(attachment.path);
          if (base64Data) {
            testEvidence.push({
              data: base64Data,
              filename: attachment.name,
              contentType,
            });
          }
        }
      }
    }

    return {
      testInfo: {
        summary: testCase.title,
        type: 'Manual',
        projectKey: env.XRAY_PROJECT_KEY || 'QAE',
        steps: stepDefinitions.length > 0 ? stepDefinitions : undefined,
      },
      status: this.getTestStatus(testStatus),
      comment: testResult.error?.message,
      evidence: testEvidence.length > 0 ? testEvidence : undefined,
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

    const testExecKey = process.env.TEST_EXECUTION_KEY || process.env.testExecKey;
    const targetEnv = process.env.TARGET_ENV || 'qa1';

    const passedCount = tests.filter(t => t.status === 'PASSED').length;
    const failedCount = tests.filter(t => t.status === 'FAILED').length;
    const todoCount = tests.filter(t => t.status === 'TODO').length;

    const hasExistingExecution = testExecKey && testExecKey !== 'none' && testExecKey.trim() !== '';

    return {
      testExecutionKey: hasExistingExecution ? testExecKey : undefined,
      info: {
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
        for (const result of test.results || []) {
          const xrayTest = await this.mapPlaywrightTestToXray(spec, result);
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
  async uploadToXray(xrayResult: XrayExecutionResult): Promise<XrayImportResponse | null> {
    try {
      const uploadStart = Date.now();
      const payloadSizeKB = (JSON.stringify(xrayResult).length / 1024).toFixed(1);

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
        body: JSON.stringify(xrayResult),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed (HTTP ${response.status}): ${errorText}`);
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
      console.log(`${this.styles.info} Environment: ${process.env.TARGET_ENV || 'qa1'}`);

      const testExecKey = process.env.TEST_EXECUTION_KEY || process.env.testExecKey;
      if (testExecKey && testExecKey !== 'none' && testExecKey.trim() !== '') {
        console.log(`${this.styles.info} Linking to Test Execution: ${testExecKey}`);
      } else {
        console.log(`${this.styles.info} Creating new Test Execution`);
      }

      const xrayResult = await this.convertPlaywrightJsonToXray(playwrightJsonPath);

      // Save converted result for debugging
      fs.writeFileSync('test-results/xray-execution.json', JSON.stringify(xrayResult, null, 2));
      console.log(`${this.styles.info} Saved Xray JSON to: test-results/xray-execution.json`);

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

    const testExecKey = process.env.TEST_EXECUTION_KEY || process.env.testExecKey;
    if (env.XRAY_CLIENT_ID && env.XRAY_CLIENT_SECRET && testExecKey && testExecKey !== 'none') {
      const jsonPath = 'test-results/last-run.json';
      if (fs.existsSync(jsonPath)) {
        await this.processAndUpload(jsonPath);
      }
    }
  }
}

export default XrayJsonReporter;
