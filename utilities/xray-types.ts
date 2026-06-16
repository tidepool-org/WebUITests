/**
 * TypeScript type definitions for Xray Cloud API integration
 */

/**
 * Xray Evidence format (base64 encoded)
 */
export interface XrayEvidence {
  data: string; // base64 encoded content
  filename: string;
  contentType?: string;
}

/**
 * Test step definition (used in testInfo.steps to define the test)
 */
export interface XrayTestStepDefinition {
  action: string;
  data?: string;
  result?: string;
}

/**
 * Test step execution result (used in test.steps to record execution results)
 */
export interface XrayTestStepResult {
  status: 'PASSED' | 'FAILED' | 'TODO' | 'EXECUTING';
  comment?: string;
  actualResult?: string;
  evidence?: XrayEvidence[];
  defects?: string[];
}

/**
 * Xray Test Information (test definition/specification)
 */
export interface XrayTestInfo {
  summary: string;
  type: 'Manual' | 'Cucumber' | 'Generic';
  projectKey: string;
  requirementKeys?: string[];
  labels?: string[];
  steps?: XrayTestStepDefinition[];
}

/**
 * Xray Test format (test execution record)
 */
export interface XrayTest {
  testKey?: string;
  testInfo?: XrayTestInfo;
  start?: string;
  finish?: string;
  status: 'PASSED' | 'FAILED' | 'TODO' | 'EXECUTING';
  comment?: string;
  evidence?: XrayEvidence[];
  steps?: XrayTestStepResult[];
  defects?: string[];
}

/**
 * Xray Test Execution Information (goes in "info" object)
 */
export interface XrayExecutionInfo {
  project?: string;
  summary: string;
  description?: string;
  version?: string;
  revision?: string;
  user?: string;
  startDate?: string;
  finishDate?: string;
  testPlanKey?: string;
  testEnvironments?: string[];
}

/**
 * Xray Execution Result format (for JSON import)
 */
export interface XrayExecutionResult {
  testExecutionKey?: string;
  info?: XrayExecutionInfo;
  tests: XrayTest[];
}

/**
 * Xray API Import Response
 */
export interface XrayImportResponse {
  // Xray Cloud's /import/execution returns the execution issue at the TOP LEVEL
  // ({ id, key, self }); some responses/versions nest it under testExecIssue. Support both.
  id?: string;
  key?: string;
  self?: string;
  testExecIssue?: {
    id: string;
    key: string;
    self: string;
  };
  testIssues?: {
    id: string;
    key: string;
    self: string;
  }[];
}
