import { TestInfo } from "@playwright/test";

/**
 * Add test annotations to the test info for JIRA integration
 * @param {TestInfo} testInfo
 * @param {{testKey: string, testSummary: string, requirements: string, testDescription: string}} annotations
 */
export function addTestAnnotations(testInfo, annotations) {
  testInfo.annotations.push({
    type: "test_key",
    description: annotations.testKey,
  });
  testInfo.annotations.push({
    type: "test_summary",
    description: annotations.testSummary,
  });
  testInfo.annotations.push({
    type: "requirements",
    description: annotations.requirements,
  });
  testInfo.annotations.push({
    type: "test_description",
    description: annotations.testDescription,
  });
}
