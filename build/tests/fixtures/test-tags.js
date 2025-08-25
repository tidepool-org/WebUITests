"use strict";
/**
 * Test Tags Fixture
 *
 * Simple tag definitions for test organization and Xray integration.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TAG_CATEGORIES = exports.TEST_TAGS = void 0;
exports.validateRequiredTags = validateRequiredTags;
exports.createValidatedTags = createValidatedTags;
exports.TEST_TAGS = {
    /**
     * Generate a Jira-related tag for linking tests to Jira tickets.
     * Usage: TEST_TAGS.RELATED('JIRA-1234') => '@jira(JIRA-1234)'
     */
    RELATED: (jiraId) => {
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
exports.TAG_CATEGORIES = {
    USER_TYPES: [exports.TEST_TAGS.PATIENT, exports.TEST_TAGS.CLINICIAN],
    TEST_TYPES: [exports.TEST_TAGS.API, exports.TEST_TAGS.UI, exports.TEST_TAGS.SMOKE, exports.TEST_TAGS.REGRESSION],
    PRIORITIES: [exports.TEST_TAGS.CRITICAL, exports.TEST_TAGS.HIGH, exports.TEST_TAGS.MEDIUM, exports.TEST_TAGS.LOW],
};
/**
 * Validates that tags include at least one from each required category
 * @param tags Array of tags to validate
 * @returns Object with validation results
 */
function validateRequiredTags(tags) {
    const hasUserType = tags.some(tag => exports.TAG_CATEGORIES.USER_TYPES.includes(tag));
    const hasTestType = tags.some(tag => exports.TAG_CATEGORIES.TEST_TYPES.includes(tag));
    const hasPriority = tags.some(tag => exports.TAG_CATEGORIES.PRIORITIES.includes(tag));
    const isValid = hasUserType && hasTestType && hasPriority;
    const missing = [];
    if (!hasUserType)
        missing.push('User Type');
    if (!hasTestType)
        missing.push('Test Type');
    if (!hasPriority)
        missing.push('Priority');
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
function createValidatedTags(tags) {
    const validation = validateRequiredTags(tags);
    if (!validation.isValid) {
        throw new Error(`Test tags validation failed: ${validation.message}`);
    }
    return tags;
}
