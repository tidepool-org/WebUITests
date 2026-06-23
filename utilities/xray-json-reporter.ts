import fs from 'node:fs';
import path from 'node:path';
import type {
  FullConfig,
  FullResult,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
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
   * Link to the overall CircleCI WORKFLOW (so the reader sees every job's progress, not
   * just the single job that wrote the description). Falls back to the per-job build URL
   * when the workflow id isn't available (e.g. running outside CircleCI).
   */
  private getPipelineUrl(): string | undefined {
    const workflowId = process.env.CIRCLE_WORKFLOW_ID;
    if (workflowId) return `https://app.circleci.com/pipelines/workflows/${workflowId}`;
    return process.env.CIRCLE_BUILD_URL;
  }

  /** The tag filter used to choose the tests, for the execution description. "ALL" when
   *  no tag was applied. Mirrors the CI grep normalization (lowercased, `@`-prefixed). */
  private testTagLabel(): string {
    const raw = process.env.TEST_TAGS?.trim();
    if (!raw) return 'ALL';
    const lower = raw.toLowerCase();
    return lower.startsWith('@') ? lower : `@${lower}`;
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
  private shouldIncludeEvidence(
    attachment: any,
    _testStatus: string,
    contentType: string,
  ): boolean {
    // Check if attachment has embedded base64 data (from JSON) or file path
    const hasData = !!attachment.body || (attachment.path && fs.existsSync(attachment.path));

    if (!hasData) {
      return false;
    }

    // Videos: never sent to Xray. Base64-encoded videos dominate the payload and are
    // the main cause of oversized requests / Xray HTTP 500s. They remain available in
    // the CircleCI artifacts and the Playwright HTML report.
    if (contentType.includes('video')) {
      return false;
    }

    // Everything else is kept: JSON API responses, other non-visual attachments, and ALL
    // screenshots — every step, pass or fail — for full media capture (so passing steps
    // can be reviewed to confirm/deny false negatives). The per-item size cap in
    // collectStepEvidence still applies.
    return true;
  }

  // Xray step status used for steps that never ran because an earlier step failed. This
  // MUST match a step status defined in the Xray project — confirm the exact spelling/casing
  // in the project's settings (override here or via XRAY_SKIPPED_STEP_STATUS if it differs).
  // NOTE: 'SKIPPED' was rejected (steps stayed TODO); trying 'SKIP'.
  private readonly SKIPPED_STEP_STATUS = process.env.XRAY_SKIPPED_STEP_STATUS?.trim() || 'SKIP';

  private isGivenStep(stepName: string): boolean {
    return stepName.toLowerCase().startsWith('given ');
  }

  private isWhenStep(stepName: string): boolean {
    return stepName.toLowerCase().startsWith('when ');
  }

  private isThenStep(stepName: string): boolean {
    return stepName.toLowerCase().startsWith('then ');
  }

  // "And" continues whatever the previous keyword was: after a When it extends the action,
  // after a Then it extends the expected. (Playwright itself doesn't parse these — only this
  // reporter does.)
  private isAndStep(stepName: string): boolean {
    return stepName.toLowerCase().startsWith('and ');
  }

  private parseDuration(duration: string): number {
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Parses a step annotation's description. The fixture now encodes it as JSON
   * (`{"durationMs":123,"status":"passed|failed|skipped"}`); older runs used a plain
   * "123ms" string, which we treat as a passed step.
   */
  private parseStepAnnotation(description: string): {
    durationMs: number;
    status: 'passed' | 'failed' | 'skipped';
    detail?: string;
  } {
    try {
      const parsed = JSON.parse(description);
      if (parsed && typeof parsed === 'object' && 'status' in parsed) {
        return {
          durationMs: Number(parsed.durationMs) || 0,
          status: parsed.status,
          detail: typeof parsed.detail === 'string' ? parsed.detail : undefined,
        };
      }
    } catch {
      // Not JSON — fall through to the legacy "<n>ms" format.
    }
    return { durationMs: this.parseDuration(description), status: 'passed' };
  }

  /**
   * Formats an Xray step Action/Result cell as a bold header (the step text) followed by an
   * optional tester-facing detail on a new line. Uses Jira-wiki bold (`*…*`), which Xray
   * Cloud renders in step fields.
   */
  private formatStepCell(header: string, detail?: string): string {
    const bold = `*${header}*`;
    return detail && detail.trim() ? `${bold}\n${detail.trim()}` : bold;
  }

  /** Maps an internal step outcome to the Xray step status to upload. */
  private toXrayStepStatus(status: 'passed' | 'failed' | 'skipped'): XrayTestStepResult['status'] {
    if (status === 'failed') return 'FAILED';
    if (status === 'skipped') return this.SKIPPED_STEP_STATUS;
    return 'PASSED';
  }

  /** Combined status for a grouped step (a When plus its Then/And steps). */
  private combineStepStatuses(
    statuses: ('passed' | 'failed' | 'skipped')[],
  ): 'passed' | 'failed' | 'skipped' {
    if (statuses.includes('failed')) return 'failed';
    if (statuses.length > 0 && statuses.every(s => s === 'skipped')) return 'skipped';
    return 'passed';
  }

  /** Friendly phrase for a Playwright/expect matcher (e.g. toContainText -> "contain text"). */
  private describeMatcher(matcher: string): string {
    const map: Record<string, string> = {
      toContainText: 'contain text',
      toHaveText: 'have text',
      toHaveValue: 'have value',
      toHaveAttribute: 'have attribute',
      toHaveClass: 'have class',
      toHaveURL: 'have URL',
      toHaveTitle: 'have title',
      toHaveCount: 'have count',
      toBe: 'equal',
      toEqual: 'equal',
      toContain: 'contain',
      toBeVisible: 'be visible',
      toBeHidden: 'be hidden',
      toBeEnabled: 'be enabled',
      toBeDisabled: 'be disabled',
      toBeChecked: 'be checked',
      toBeFocused: 'be focused',
      toBeEmpty: 'be empty',
    };
    if (map[matcher]) return map[matcher];
    // Fallback: drop leading "to", split camelCase into words.
    return (
      matcher
        .replace(/^to/, '')
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .toLowerCase() || matcher
    );
  }

  /** Pulls a readable target out of a locator string (e.g. locator('#x') -> "#x"). */
  private describeLocator(locator?: string): string {
    if (!locator) return '';
    const m = locator.match(/locator\((['"`])([\s\S]*?)\1\)/);
    return (m ? m[2] : locator).trim();
  }

  private clip(value: string, max = 500): string {
    const v = value.trim();
    return v.length > max ? `${v.slice(0, max)}…` : v;
  }

  /**
   * Turns a raw Playwright/Node error message into a concise, plain-English line suitable
   * for an Xray step's "Actual Result" / the test comment. Web-first assertion failures
   * (expect(locator).toX(...)) become "Expected <target> to <matcher> <expected>, but found
   * <received>"; other errors fall back to their first meaningful line. The verbose "Call
   * log:" section and ANSI colour codes are stripped. Never throws.
   */
  private humanizeError(raw?: string): string {
    if (!raw) return 'Test failed';
    try {
      // Strip ANSI colour codes and drop the verbose call log.
      // eslint-disable-next-line no-control-regex -- the ESC byte is required to match ANSI
      let msg = raw.replace(/\[[0-9;]*m/g, '');
      const callLogIdx = msg.indexOf('Call log:');
      if (callLogIdx !== -1) msg = msg.slice(0, callLogIdx);
      msg = msg.trim();

      // Capture the matcher from any "expect(...).matcher(...)" line (with or without the
      // trailing "failed"), so visibility/equality assertions condense too.
      const matcherMatch = msg.match(/expect\([^)]*\)\.(\w+)\(/i);
      const expectedMatch = msg.match(/Expected(?: (?:substring|string|pattern|value))?:\s*(.+)/i);
      const receivedMatch = msg.match(/Received(?: (?:string|value))?:\s*(.+)/i);
      const locatorMatch = msg.match(/Locator:\s*(.+)/i);
      const timeoutMatch = msg.match(/Timeout:\s*(\d+)ms/i);

      if (matcherMatch) {
        const matcher = this.describeMatcher(matcherMatch[1]);
        const target = this.describeLocator(locatorMatch?.[1]) || 'the value';
        let result = `Expected ${target} to ${matcher}`;
        if (expectedMatch) result += ` ${this.clip(expectedMatch[1])}`;
        if (receivedMatch) result += `, but found ${this.clip(receivedMatch[1])}`;
        if (timeoutMatch) result += ` (after ${timeoutMatch[1]}ms)`;
        return result.trim();
      }

      // Non-assertion error (thrown Error, navigation, schema check, …): first real line.
      const firstLine = msg
        .split('\n')
        .map(l => l.trim())
        .find(Boolean);
      return this.clip((firstLine || 'Test failed').replace(/^Error:\s*/i, ''), 600);
    } catch {
      return this.clip(raw, 600);
    }
  }

  /**
   * Collects inline evidence for given step indices
   */
  private async collectStepEvidence(
    indices: number[],
    attachments: any[],
    testStatus: string,
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
        const isImage = contentType.includes('image');

        // Videos are excluded by shouldIncludeEvidence. JSON (and other non-image) evidence
        // is always collected; screenshots are collected only when the caller asks for them
        // (the block decides: Then screenshots on a pass, every screenshot on a failure).
        // There is intentionally NO per-item size cap.
        const eligible =
          this.shouldIncludeEvidence(attachment, testStatus, contentType) &&
          (!isImage || includeImages);

        if (eligible) {
          let base64Data: string | null = null;
          let filename = attachment.name || 'attachment';

          if (attachment.body) {
            base64Data =
              typeof attachment.body === 'string'
                ? attachment.body
                : attachment.body.toString('base64');
          } else if (attachment.path && fs.existsSync(attachment.path)) {
            base64Data = await this.fileToBase64(attachment.path);
            filename = path.basename(attachment.path);
          }

          if (base64Data) {
            evidence.push({ data: base64Data, filename, contentType });
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

    interface StepInfo {
      name: string;
      duration: number;
      index: number;
      status: 'passed' | 'failed' | 'skipped';
      detail?: string;
    }
    // Each block becomes ONE Xray step row. A block's `actions` (a When/Given plus any
    // following "And" steps) form the Action cell; its `results` (a Then plus any following
    // "And" steps) form the Expected/Result cell. "And" continues whichever section was last
    // appended to, so "When … / And …" condenses into a single action rather than leaving a
    // blank Expected. A Given (or a When with no Then) simply has no Expected, which is fine.
    interface Block {
      actions: StepInfo[];
      results: StepInfo[];
    }
    const blocks: Block[] = [];
    let current: Block | null = null;
    let lastSection: 'action' | 'result' = 'action';

    const makeBlock = (step: StepInfo): Block => {
      const block: Block = { actions: [step], results: [] };
      blocks.push(block);
      lastSection = 'action';
      return block;
    };

    for (let i = 0; i < stepAnnotations.length; i += 1) {
      const stepAnn = stepAnnotations[i];
      const stepName = stepAnn.type.replace('Step Duration: ', '');
      const {
        durationMs: duration,
        status,
        detail,
      } = this.parseStepAnnotation(stepAnn.description);
      const step: StepInfo = { name: stepName, duration, index: i, status, detail };

      if (this.isAndStep(stepName)) {
        // Continue the current block's most-recently-extended section (action or expected).
        if (!current) {
          current = makeBlock(step);
        } else if (lastSection === 'result') {
          current.results.push(step);
        } else {
          current.actions.push(step);
        }
      } else if (this.isThenStep(stepName)) {
        // Expected for the current block; an orphan Then (no action yet) starts its own block.
        if (!current) {
          current = makeBlock(step);
        } else {
          current.results.push(step);
          lastSection = 'result';
        }
      } else {
        // Given / When / anything else begins a new action block.
        current = makeBlock(step);
      }
    }

    for (const block of blocks) {
      const allSteps = [...block.actions, ...block.results];

      // Action cell = each action step as a bold header + its detail; Result cell likewise.
      const stepDef: XrayTestStepDefinition = {
        action: block.actions.map(s => this.formatStepCell(s.name, s.detail)).join('\n'),
      };
      if (block.results.length > 0) {
        stepDef.result = block.results.map(s => this.formatStepCell(s.name, s.detail)).join('\n');
      }
      stepDefinitions.push(stepDef);

      const groupStatus = this.combineStepStatuses(allSteps.map(s => s.status));
      const totalDuration = allSteps.reduce((sum, s) => sum + s.duration, 0);
      const stepResult: XrayTestStepResult = {
        status: this.toXrayStepStatus(groupStatus),
        comment:
          groupStatus === 'skipped'
            ? 'Skipped — a previous step failed'
            : `Duration: ${totalDuration}ms`,
      };

      // Evidence (skipped steps never ran, so they have none):
      // - Always attach JSON (API-check) evidence from every step in the block.
      // - Attach screenshots for When, And, and Then steps (the action/expected of the work),
      //   plus every step in a FAILED block so a failure is fully captured.
      // - DO NOT attach Given screenshots (preconditions) unless the block failed. A block
      //   whose first action is a Given is treated as a precondition block.
      if (groupStatus !== 'skipped') {
        const blockFailed = groupStatus === 'failed';
        const isGivenBlock = this.isGivenStep(block.actions[0]?.name ?? '');
        // Result steps (Then/And): JSON + screenshots, always.
        const resultEvidence = await this.collectStepEvidence(
          block.results.map(s => s.index),
          attachments,
          testStatus,
          true,
        );
        // Action steps: JSON always; screenshots for When/And action steps (i.e. not a Given
        // block) or whenever the block failed.
        const actionEvidence = await this.collectStepEvidence(
          block.actions.map(s => s.index),
          attachments,
          testStatus,
          blockFailed || !isGivenBlock,
        );
        const evidence = [...actionEvidence, ...resultEvidence];
        if (evidence.length > 0) {
          stepResult.evidence = evidence;
        }
      }

      stepResults.push(stepResult);
    }

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

    // Attach the failure detail to the step that actually failed. extractSteps already set
    // per-step statuses from the fixture annotations (PASSED / FAILED / skipped), so we just
    // record the error message on the FAILED step's actualResult. Fallback: if the test
    // failed but no step was flagged (e.g. a failure outside any test.step), mark the last
    // step failed so the failure is still visible.
    // Condense the raw Playwright assertion dump into a readable one-liner for Xray.
    const failureSummary = this.humanizeError(testResult.error?.message);
    if (testStatus !== 'passed' && stepResults.length > 0) {
      const failedStep = stepResults.find(s => s.status === 'FAILED');
      if (failedStep) {
        failedStep.actualResult = failureSummary;
      } else {
        const lastStep = stepResults[stepResults.length - 1];
        lastStep.status = 'FAILED';
        lastStep.actualResult = failureSummary;
      }
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
      comment: testStatus !== 'passed' ? failureSummary : testResult.error?.message,
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

    const targetEnv = env.TARGET_ENV;

    const passedCount = tests.filter(t => t.status === 'PASSED').length;
    const failedCount = tests.filter(t => t.status === 'FAILED').length;
    const todoCount = tests.filter(t => t.status === 'TODO').length;

    const pipelineUrl = this.getPipelineUrl();
    // Description shown on the execution issue. The env line carries the tag filter used
    // to pick the tests ("ALL" when none was applied), and we link the whole workflow.
    const description =
      `Automated test execution for ${targetEnv} environment | Test tag: ${this.testTagLabel()}\n\n` +
      `Results: ${passedCount} passed, ${failedCount} failed, ${todoCount} skipped${
        pipelineUrl ? `\n\nCircleCI pipeline: ${pipelineUrl}` : ''
      }`;

    // If the pre-run frontload step created an execution, import results INTO it (it's
    // Xray-created, so import-ready, and already linked to the trigger ticket). We pass
    // `info` so this import also UPDATES the description from the frontload's
    // "queued — results pending" text to the real pass/fail/skip counts.
    const targetExec = process.env.XRAY_TARGET_EXECUTION?.trim();
    if (targetExec) {
      return {
        testExecutionKey: targetExec,
        info: { summary: `Playwright Test Execution - ${new Date().toISOString()}`, description },
        tests,
      };
    }

    // Otherwise auto-create a new execution. Test Executions created by the Jira Automation
    // aren't registered in Xray's backend ("test execution ... not found"), so they reject
    // every import; an Xray-created execution is import-ready immediately. We link this new
    // execution to the triggering ticket after upload (see linkExecutionToTrigger).
    return {
      testExecutionKey: undefined,
      info: {
        summary: `Playwright Test Execution - ${new Date().toISOString()}`,
        description,
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
    const maxBatchSizeBytes = (env.XRAY_BATCH_SIZE_MB || 1) * 1024 * 1024; // Convert MB to bytes
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

  // Jira link type connecting a Test Execution to the ticket it tests (outward "tests").
  private readonly EXECUTION_LINK_TYPE = 'Test';

  /** Derives the Jira base URL (origin) from an issue's `self` URL. */
  private baseUrlFrom(selfUrl: string): string | undefined {
    try {
      return new URL(selfUrl).origin;
    } catch {
      console.log(`${this.styles.warning} Could not derive Jira base URL from "${selfUrl}".`);
      return undefined;
    }
  }

  /**
   * POSTs a Jira issue link of the configured type (outward "tests" → inward "is tested by")
   * between two issues. Non-fatal: logs and returns on any failure.
   */
  private async linkIssues(baseUrl: string, outwardKey: string, inwardKey: string): Promise<void> {
    if (!env.JIRA_EMAIL || !env.JIRA_API_KEY) {
      console.log(`${this.styles.warning} JIRA_EMAIL/JIRA_API_KEY not set — skipping issue link.`);
      return;
    }
    const auth = Buffer.from(`${env.JIRA_EMAIL}:${env.JIRA_API_KEY}`).toString('base64');
    try {
      const response = await fetch(`${baseUrl}/rest/api/3/issueLink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
        body: JSON.stringify({
          type: { name: this.EXECUTION_LINK_TYPE },
          outwardIssue: { key: outwardKey },
          inwardIssue: { key: inwardKey },
        }),
      });
      if (response.ok || response.status === 201) {
        console.log(
          `${this.styles.success} Linked ${outwardKey} → ${inwardKey} ("${this.EXECUTION_LINK_TYPE}").`,
        );
      } else {
        const text = await response.text();
        console.log(
          `${this.styles.warning} Failed to link ${outwardKey} → ${inwardKey} (HTTP ${response.status}): ${text.slice(0, 200)}`,
        );
      }
    } catch (error) {
      console.log(
        `${this.styles.warning} Error linking ${outwardKey} → ${inwardKey}: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Links the freshly auto-created execution to the ORIGINAL TRIGGERING TICKET (the
   * Task/Story that fired the Jira Automation), using the same "Test" link the automation
   * applies to its own execution. The triggering ticket is discovered from the original
   * (Jira-created) execution's "Test" link, so this stays correct if that ticket changes.
   * Non-fatal: results are already uploaded regardless of whether linking succeeds.
   */
  private async linkExecutionToTrigger(
    newKey: string,
    originalExecKey: string,
    selfUrl: string,
  ): Promise<void> {
    if (!env.JIRA_EMAIL || !env.JIRA_API_KEY) {
      console.log(`${this.styles.warning} JIRA_EMAIL/JIRA_API_KEY not set — skipping issue link.`);
      return;
    }
    let baseUrl: string;
    try {
      baseUrl = new URL(selfUrl).origin;
    } catch {
      console.log(`${this.styles.warning} Could not derive Jira base URL from "${selfUrl}".`);
      return;
    }
    const auth = Buffer.from(`${env.JIRA_EMAIL}:${env.JIRA_API_KEY}`).toString('base64');
    const headers = { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` };

    // Find the triggering ticket via the original execution's "Test" link.
    let triggerKey: string | undefined;
    try {
      const res = await fetch(`${baseUrl}/rest/api/3/issue/${originalExecKey}?fields=issuelinks`, {
        headers,
      });
      if (res.ok) {
        const data = (await res.json()) as {
          fields?: {
            issuelinks?: {
              type?: { name?: string };
              outwardIssue?: { key: string };
              inwardIssue?: { key: string };
            }[];
          };
        };
        const testLink = (data.fields?.issuelinks ?? []).find(
          l => l.type?.name === this.EXECUTION_LINK_TYPE,
        );
        triggerKey = (testLink?.outwardIssue ?? testLink?.inwardIssue)?.key;
      } else {
        console.log(
          `${this.styles.warning} Could not read links of ${originalExecKey} (HTTP ${res.status}).`,
        );
      }
    } catch (error) {
      console.log(
        `${this.styles.warning} Error reading links of ${originalExecKey}: ${(error as Error).message}`,
      );
    }

    if (!triggerKey) {
      console.log(
        `${this.styles.warning} No "${this.EXECUTION_LINK_TYPE}" link found on ${originalExecKey}; cannot identify the triggering ticket. Skipping link for ${newKey}.`,
      );
      return;
    }

    // Replicate the automation's link: triggering ticket as the outward ("tests") side,
    // the new execution as the inward ("is tested by") side.
    await this.linkIssues(baseUrl, triggerKey, newKey);
  }

  /**
   * Sets a Test Execution's description directly via the Jira REST API. Used after results
   * are imported INTO a pre-created (frontload) execution: Xray does not reliably apply the
   * import's `info` object to an already-existing execution, so the frontload's
   * "queued — results pending" text would otherwise never update to the final counts.
   * Uses REST v2 (accepts a plain-text description, which Jira Cloud stores as ADF).
   * Non-fatal: the results are already uploaded regardless of whether this succeeds.
   */
  private async updateExecutionDescription(
    key: string,
    description: string,
    selfUrl: string,
  ): Promise<void> {
    if (!env.JIRA_EMAIL || !env.JIRA_API_KEY) {
      console.log(
        `${this.styles.warning} JIRA_EMAIL/JIRA_API_KEY not set — skipping description update for ${key}.`,
      );
      return;
    }
    let baseUrl: string;
    try {
      baseUrl = new URL(selfUrl).origin;
    } catch {
      console.log(`${this.styles.warning} Could not derive Jira base URL from "${selfUrl}".`);
      return;
    }
    const auth = Buffer.from(`${env.JIRA_EMAIL}:${env.JIRA_API_KEY}`).toString('base64');
    try {
      const res = await fetch(`${baseUrl}/rest/api/2/issue/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
        body: JSON.stringify({ fields: { description } }),
      });
      if (res.ok || res.status === 204) {
        console.log(`${this.styles.success} Updated description of ${key} with final results.`);
      } else {
        const text = await res.text();
        console.log(
          `${this.styles.warning} Failed to update description of ${key} (HTTP ${res.status}): ${text.slice(0, 200)}`,
        );
      }
    } catch (error) {
      console.log(
        `${this.styles.warning} Error updating description of ${key}: ${(error as Error).message}`,
      );
    }
  }

  /** Fetch the set of existing Test summaries in the project (paginated). */
  private async fetchExistingTestSummaries(): Promise<Set<string>> {
    const token = await this.authenticateWithXray();
    const project = env.XRAY_PROJECT_KEY || 'QAE';
    const summaries = new Set<string>();
    const limit = 100;
    let start = 0;
    for (;;) {
      const query = `query{getTests(jql:"project = ${project} AND issuetype = Test",limit:${limit},start:${start}){total results{jira(fields:["summary"])}}}`;
      const res = await fetch('https://xray.cloud.getxray.app/api/v2/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ query }),
      });
      const json = (await res.json()) as {
        data?: { getTests?: { total?: number; results?: { jira?: { summary?: string } }[] } };
      };
      const data = json.data?.getTests;
      if (!data) break;
      (data.results ?? []).forEach(r => {
        if (r.jira?.summary) summaries.add(r.jira.summary);
      });
      start += limit;
      if (start >= (data.total ?? 0)) break;
    }
    return summaries;
  }

  /**
   * Pre-run "frontload": create a NEW execution containing the tests that WILL run, as
   * status TO DO with no results — so the ticket shows the queued tests (and their existing
   * step definitions, which Xray fills in automatically) while the automation runs. Only
   * tests already known to Xray are included; brand-new tests are skipped here and appear
   * with full steps+results in the post-run import. Links the execution to the triggering
   * ticket. Returns the new execution key.
   */
  async createFrontloadExecution(
    testTitles: string[],
    originalExecKey: string,
  ): Promise<string | null> {
    if (!(env.XRAY_CLIENT_ID && env.XRAY_CLIENT_SECRET)) {
      console.log(`${this.styles.warning} No Xray credentials — skipping frontload.`);
      return null;
    }
    const existing = await this.fetchExistingTestSummaries();
    const known = [...new Set(testTitles)].filter(t => existing.has(t));
    const skipped = testTitles.length - known.length;
    console.log(
      `${this.styles.info} Frontload: ${known.length} known test(s) to pre-load; ${skipped} new test(s) skipped (they'll appear with results after the run).`,
    );
    if (known.length === 0) {
      console.log(
        `${this.styles.warning} No already-known tests to frontload; skipping pre-creation.`,
      );
      return null;
    }
    const pipelineUrl = this.getPipelineUrl();
    const payload: XrayExecutionResult = {
      info: {
        summary: `Playwright Test Execution - ${new Date().toISOString()}`,
        description:
          `Automated test execution for ${env.TARGET_ENV} environment | Test tag: ${this.testTagLabel()}\n\n` +
          `${known.length} test(s) queued — results pending.${
            pipelineUrl ? `\n\nCircleCI pipeline: ${pipelineUrl}` : ''
          }`,
      },
      tests: known.map(summary => ({
        testInfo: { summary, type: 'Manual' as const, projectKey: env.XRAY_PROJECT_KEY || 'QAE' },
        status: 'TODO' as const,
      })),
    };
    const resp = await this.uploadSingleBatch(payload, 'frontload');
    const issue = resp.testExecIssue ?? resp;
    const newKey = issue?.key;
    const newSelf = issue?.self;
    if (
      newKey &&
      newSelf &&
      originalExecKey &&
      originalExecKey !== 'none' &&
      originalExecKey.trim() !== ''
    ) {
      await this.linkExecutionToTrigger(newKey, originalExecKey, newSelf);
    }
    return newKey ?? null;
  }

  /** Summaries (titles) of the tests that FAILED in a Playwright results file. */
  async getFailedTestTitles(playwrightJsonPath: string): Promise<string[]> {
    const playwrightResult = JSON.parse(fs.readFileSync(playwrightJsonPath, 'utf8'));
    const tests: XrayTest[] = [];
    for (const suite of playwrightResult.suites || []) {
      await this.processSuite(suite, tests);
    }
    const failed = tests
      .filter(t => t.status === 'FAILED')
      .map(t => t.testInfo?.summary)
      .filter((s): s is string => !!s);
    return [...new Set(failed)];
  }

  /**
   * SOP follow-up for a Jira-triggered run with failures: create a NEW Test Execution that
   * holds ONLY the failed tests, each referenced by name (so Xray fills in their steps) with
   * status TO DO and no results — a clean slate for a tester to manually re-run/confirm the
   * failures. The execution is named after, and linked ("Test") to, the automated execution
   * it confirms. Returns the new execution key. (Caller decides when to invoke this; it is
   * NOT run on local executions.)
   */
  async createManualConfirmationExecution(
    failedTitles: string[],
    automatedExecKey: string,
  ): Promise<string | null> {
    if (!(env.XRAY_CLIENT_ID && env.XRAY_CLIENT_SECRET)) {
      console.log(
        `${this.styles.warning} No Xray credentials — skipping manual-confirmation execution.`,
      );
      return null;
    }
    const titles = [...new Set(failedTitles)];
    if (titles.length === 0) return null;

    const pipelineUrl = this.getPipelineUrl();
    const payload: XrayExecutionResult = {
      info: {
        summary: `Manual Confirmation of Automated Execution: ${automatedExecKey}`,
        description:
          `Manual confirmation of ${titles.length} failed test(s) from automated execution ${automatedExecKey}.\n\n` +
          `Re-run these by hand to confirm whether each failure is real or a false negative.${
            pipelineUrl ? `\n\nCircleCI pipeline: ${pipelineUrl}` : ''
          }`,
      },
      tests: titles.map(summary => ({
        testInfo: { summary, type: 'Manual' as const, projectKey: env.XRAY_PROJECT_KEY || 'QAE' },
        status: 'TODO' as const,
      })),
    };

    const resp = await this.uploadSingleBatch(payload, 'manual-confirmation');
    const issue = resp.testExecIssue ?? resp;
    const newKey = issue?.key;
    const newSelf = issue?.self;
    if (newKey && newSelf) {
      // Link the manual-confirmation execution to the automated execution it confirms:
      // manual-confirmation ("tests") → automated execution ("is tested by").
      const baseUrl = this.baseUrlFrom(newSelf);
      if (baseUrl) await this.linkIssues(baseUrl, newKey, automatedExecKey);
    }
    return newKey ?? null;
  }

  async uploadToXray(xrayResult: XrayExecutionResult): Promise<XrayImportResponse | null> {
    // Check if batching is needed
    const totalSize = this.calculatePayloadSize(xrayResult);
    const maxBatchSizeBytes = (env.XRAY_BATCH_SIZE_MB || 1) * 1024 * 1024;

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
    return this.uploadSingleBatch(xrayResult, 'single');
  }

  private async uploadInBatches(
    fullResult: XrayExecutionResult,
  ): Promise<XrayImportResponse | null> {
    const testBatches = this.createTestBatches(fullResult.tests);
    let firstUploadResult: XrayImportResponse | null = null;
    const failures: string[] = [];

    console.log(`${this.styles.info} Uploading ${testBatches.length} batches sequentially...`);

    for (let i = 0; i < testBatches.length; i += 1) {
      const batchNumber = i + 1;
      const batch = testBatches[i];

      // Create batch payload
      const batchResult: XrayExecutionResult = {
        ...fullResult,
        tests: batch,
      };

      // For subsequent batches after the first, link to the same test execution that
      // batch 1 auto-created (Xray returns the issue at the top level; fall back to nested).
      const firstKey = (firstUploadResult?.testExecIssue ?? firstUploadResult)?.key;
      if (i > 0 && firstKey) {
        batchResult.testExecutionKey = firstKey;
        // Remove info object for updates (only needed for creation)
        delete batchResult.info;
      }

      console.log(
        `${this.styles.upload} Uploading batch ${batchNumber}/${testBatches.length} (${batch.length} tests)...`,
      );

      try {
        const batchResponse = await this.uploadSingleBatch(batchResult, `batch-${batchNumber}`);
        if (i === 0) {
          firstUploadResult = batchResponse;
        }
        console.log(`${this.styles.success} Batch ${batchNumber} uploaded successfully`);
      } catch (error) {
        failures.push(`Batch ${batchNumber}: ${(error as Error).message}`);
        console.log(
          `${this.styles.error} Batch ${batchNumber} failed: ${(error as Error).message}`,
        );
        // Continue so remaining batches still attempt, but the overall upload is failed.
      }

      // Small gap before the next batch so Xray finishes processing this one against
      // the same execution (imports are processed asynchronously server-side).
      if (i < testBatches.length - 1) {
        await new Promise<void>(resolve => {
          setTimeout(resolve, 2000);
        });
      }
    }

    if (failures.length > 0) {
      throw new Error(
        `${failures.length}/${testBatches.length} Xray batch(es) failed:\n${failures.join('\n')}`,
      );
    }

    return firstUploadResult;
  }

  /**
   * Persists the exact request body and Xray's full response for a failed upload
   * attempt so they can be inspected from the CI artifacts (test-results/ is stored
   * even when the upload step fails). The Authorization header is never written.
   */
  private saveUploadDebugInfo(
    label: string,
    attempt: number,
    requestBody: string,
    response: Response,
    responseBody: string,
  ): void {
    try {
      fs.mkdirSync('test-results', { recursive: true });

      const requestPath = `test-results/xray-failed-request-${label}.json`;
      fs.writeFileSync(requestPath, requestBody);

      const responseHeaders: string[] = [];
      response.headers.forEach((value, key) => {
        responseHeaders.push(`${key}: ${value}`);
      });

      const responsePath = `test-results/xray-failed-response-${label}.log`;
      const entry = [
        `--- attempt ${attempt} @ ${new Date().toISOString()} ---`,
        `HTTP ${response.status} ${response.statusText}`,
        ...responseHeaders,
        '',
        responseBody,
        '',
        '',
      ].join('\n');
      fs.appendFileSync(responsePath, entry);

      console.log(
        `${this.styles.info} Saved failed request to ${requestPath} and response to ${responsePath}`,
      );
    } catch (error) {
      console.log(
        `${this.styles.warning} Could not save Xray debug info: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Uploads a single payload, retrying on HTTP 500 with exponential backoff + jitter.
   * Uses an iterative loop (not recursion) so a failure is logged exactly once and the
   * stack trace stays shallow.
   */
  private async uploadSingleBatch(
    xrayResult: XrayExecutionResult,
    label = 'single',
    maxAttempts = 4,
  ): Promise<XrayImportResponse> {
    const body = JSON.stringify(xrayResult, (key, value) => {
      // Skip circular references in upload payload
      if (key === 'parent' || key === 'suite' || key === '_parentSuite' || key === '_project') {
        return undefined;
      }
      return value;
    });
    const payloadSizeKB = (body.length / 1024).toFixed(1);

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const uploadStart = Date.now();
      console.log(`${this.styles.info} Uploading test execution to Xray...`);
      console.log(
        `${this.styles.info} Payload: ${xrayResult.tests.length} tests, ${payloadSizeKB} KB (attempt ${attempt}/${maxAttempts})`,
      );

      const token = await this.authenticateWithXray();

      const response = await fetch('https://xray.cloud.getxray.app/api/v2/import/execution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body,
      });

      if (response.ok) {
        const result: XrayImportResponse = await response.json();
        const uploadDuration = Date.now() - uploadStart;
        console.log(`${this.styles.success} Successfully uploaded to Xray (${uploadDuration}ms)`);
        console.log(
          `${this.styles.success} Test Execution Key: ${(result.testExecIssue ?? result)?.key || 'N/A'}`,
        );
        return result;
      }

      const errorText = await response.text();
      lastError = new Error(`Upload failed (HTTP ${response.status}): ${errorText}`);

      console.log(
        `${this.styles.warning} Xray responded HTTP ${response.status} ${response.statusText} (attempt ${attempt}/${maxAttempts}): ${errorText}`,
      );
      this.saveUploadDebugInfo(label, attempt, body, response, errorText);

      // Retry only on 500 (Xray internal error) with exponential backoff + jitter.
      if (response.status !== 500 || attempt >= maxAttempts) {
        break;
      }

      const delay = 5000 * attempt + Math.floor(Math.random() * 3000); // 5/10/15s + 0-3s jitter
      console.log(
        `${this.styles.warning} Xray 500 on attempt ${attempt}/${maxAttempts}, retrying in ${(delay / 1000).toFixed(1)}s...`,
      );
      await new Promise<void>(resolve => {
        setTimeout(resolve, delay);
      });
    }

    // Logged exactly once, after all retries are exhausted.
    console.error(`${this.styles.error} Failed to upload to Xray: ${lastError?.message}`);
    throw lastError ?? new Error('Unknown Xray upload failure');
  }

  /**
   * Main method to process and upload results
   */
  async processAndUpload(playwrightJsonPath: string): Promise<string | undefined> {
    if (!(env.XRAY_CLIENT_ID && env.XRAY_CLIENT_SECRET)) {
      console.log(`${this.styles.warning} No Xray credentials found, skipping upload to JIRA Xray`);
      return undefined;
    }

    try {
      const processStart = Date.now();
      console.log(`\n${this.styles.separator}`);
      console.log(`${this.styles.info} Processing Playwright results for Xray...`);
      console.log(`${this.styles.info} Project Key: ${env.XRAY_PROJECT_KEY || 'SAND'}`);
      console.log(`${this.styles.info} Environment: ${env.TARGET_ENV}`);

      const testExecKey = env.TEST_EXECUTION_KEY;
      if (testExecKey && testExecKey !== 'none' && testExecKey.trim() !== '') {
        console.log(
          `${this.styles.info} Auto-creating a new execution; will link it back to ${testExecKey}`,
        );
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
        return undefined;
      }

      // Auto-creates a new execution (see convertPlaywrightJsonToXray) and returns it.
      const uploadResult = await this.uploadToXray(xrayResult);

      // Link the new auto-created execution to the original triggering ticket (found via
      // the original Jira-created execution's "Test" link), matching the automation.
      const originalExecKey = testExecKey;
      // Xray returns the execution at the top level ({id,key,self}); fall back to the
      // nested testExecIssue shape just in case.
      const execIssue = uploadResult?.testExecIssue ?? uploadResult;
      const newKey = execIssue?.key;
      const newSelf = execIssue?.self;
      // Only link when we auto-created here. If results went into a pre-created frontload
      // execution (XRAY_TARGET_EXECUTION), it was already linked in the pre-run step.
      if (
        !process.env.XRAY_TARGET_EXECUTION?.trim() &&
        newKey &&
        newSelf &&
        originalExecKey &&
        originalExecKey !== 'none' &&
        originalExecKey.trim() !== '' &&
        newKey !== originalExecKey
      ) {
        await this.linkExecutionToTrigger(newKey, originalExecKey, newSelf);
      }

      // If results were imported INTO a pre-created frontload execution, refresh its
      // description from "queued — results pending" to the final pass/fail/skip counts.
      const targetKey = process.env.XRAY_TARGET_EXECUTION?.trim();
      if (targetKey && newSelf && xrayResult.info?.description) {
        await this.updateExecutionDescription(targetKey, xrayResult.info.description, newSelf);
      }

      const totalDuration = Date.now() - processStart;
      console.log(`${this.styles.upload} Xray upload completed successfully (${totalDuration}ms)`);
      console.log(`${this.styles.separator}\n`);

      // The execution the results landed in (the frontload target, or the auto-created one).
      return newKey ?? process.env.XRAY_TARGET_EXECUTION?.trim() ?? undefined;
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

    // In sharded CI runs each shard would otherwise upload its own slice to the SAME
    // execution concurrently, which makes Xray return HTTP 500. When XRAY_DEFER_UPLOAD
    // is set, shards skip upload; a dedicated job merges all shard reports and uploads
    // once (see utilities/upload-to-xray.ts + the merge-and-upload-xray CI job).
    if (process.env.XRAY_DEFER_UPLOAD === 'true') {
      console.log(
        `${this.styles.info} XRAY_DEFER_UPLOAD=true — skipping inline upload; results will be merged and uploaded in a separate job.`,
      );
      return;
    }

    const testExecKey = env.TEST_EXECUTION_KEY;
    if (env.XRAY_CLIENT_ID && env.XRAY_CLIENT_SECRET && testExecKey && testExecKey !== 'none') {
      // Local/inline run (e.g. from the VS Code test explorer): import results DIRECTLY into
      // the execution named in TEST_EXECUTION_KEY (.env) instead of auto-creating a new one.
      // The CI flow never reaches here — its shards defer (XRAY_DEFER_UPLOAD=true) and the
      // merge job uses upload-to-xray.ts, which handles frontload/auto-create separately.
      if (!process.env.XRAY_TARGET_EXECUTION?.trim()) {
        process.env.XRAY_TARGET_EXECUTION = testExecKey;
      }
      console.log(`${this.styles.info} Updating Test Execution directly: ${testExecKey}`);

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
