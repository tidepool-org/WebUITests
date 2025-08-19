/**
 * Test Tags Fixture
 *
 * Simple tag definitions for test organization and Xray integration.
 */

export const TEST_TAGS = {
  /**
   * Generate a Jira-related tag for linking tests to Jira tickets.
   * Usage: TEST_TAGS.RELATED('JIRA-1234') => '@jira(JIRA-1234)'
   */
  RELATED: (jiraId: string) => {
    // Accepts formats like ABC-1234 or JIRA-1234
    const jiraPattern = /^[A-Z][A-Z0-9]+-\d+$/;
    if (!jiraPattern.test(jiraId)) {
      throw new Error(`Invalid Jira ID: ${jiraId}. Must match pattern ABC-1234.`);
    }
    return `@jira(${jiraId})`;
  },
  // Backend Services
  BACK_SHORELINE: '@back-shoreline',
  BACK_CLINIC: '@back-clinic',
  BACK_HIGHWATER: '@back-highwater',
  BACK_HYDROPHONE: '@back-hydrophone',
  BACK_PLATFORM: '@back-platform',
  BACK_SEAGULL: '@back-seagull',
  BACK_TIDEWHISPERER: '@back-tidewhisperer',
  BACK_MESSAGEAPI: '@back-messageapi',
  BACK_JELLYFISH: '@back-jellyfish',
  BACK_GATEKEEPER: '@back-gatekeeper',
  BACK_EXPORT: '@back-export',
  BACK_KEYCLOAK: '@back-keycloak',

  // User Types
  PATIENT: '@patient',
  CLINICIAN: '@clinician',
 
  // User-Subtypes
  CUSTODIAL: '@custodial',
  SHARED_MEMBER: '@shared_member',
  PERSONAL: '@personal',
  CLAIMED: '@claimed',

  // Test Types
  API: '@api',
  UI: '@ui',
  SMOKE: '@smoke',
  REGRESSION: '@regression',

  // Priority
  CRITICAL: '@critical',
  HIGH: '@high',
  MEDIUM: '@medium',
  LOW: '@low',

  // Endpoint API Testing
  API_PROFILE: '@api_profile',
  API_USER: '@api_user',
};

// Tag Categories for Validation
export const TAG_CATEGORIES = {
  USER_TYPES: [TEST_TAGS.PATIENT, TEST_TAGS.CLINICIAN],
  TEST_TYPES: [TEST_TAGS.API, TEST_TAGS.UI, TEST_TAGS.SMOKE, TEST_TAGS.REGRESSION],
  PRIORITIES: [TEST_TAGS.CRITICAL, TEST_TAGS.HIGH, TEST_TAGS.MEDIUM, TEST_TAGS.LOW],
};

/**
 * Validates that tags include at least one from each required category
 * @param tags Array of tags to validate
 * @returns Object with validation results
 */
export function validateRequiredTags(tags: string[]) {
  const hasUserType = tags.some(tag => TAG_CATEGORIES.USER_TYPES.includes(tag));
  const hasTestType = tags.some(tag => TAG_CATEGORIES.TEST_TYPES.includes(tag));
  const hasPriority = tags.some(tag => TAG_CATEGORIES.PRIORITIES.includes(tag));

  const isValid = hasUserType && hasTestType && hasPriority;

  const missing = [];
  if (!hasUserType) missing.push('User Type');
  if (!hasTestType) missing.push('Test Type');
  if (!hasPriority) missing.push('Priority');

  return {
    isValid,
    missing,
    message: isValid ? 'All required tags present' : `Missing required tags: ${missing.join(', ')}`,
  };
}

/**
 * Helper function to create tags with validation
 * Throws error if required tags are missing
 */
export function createValidatedTags(tags: string[]) {
  const validation = validateRequiredTags(tags);
  if (!validation.isValid) {
    throw new Error(`Test tags validation failed: ${validation.message}`);
  }
  return tags;
}
