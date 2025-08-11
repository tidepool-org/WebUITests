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
export default function addTestAnnotations(testInfo: TestInfo, annotations: TestAnnotations): void {
  testInfo.annotations.push({
    type: 'test_key',
    description: annotations.testKey,
  });
  testInfo.annotations.push({
    type: 'test_summary',
    description: annotations.testSummary,
  });
  testInfo.annotations.push({
    type: 'requirements',
    description: annotations.requirements,
  });
  testInfo.annotations.push({
    type: 'test_description',
    description: annotations.testDescription,
  });
}
