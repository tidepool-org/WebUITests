/**
 * Test Tags Fixture
 *
 * Simple tag definitions for test organization and Xray integration.
 */
export declare const TEST_TAGS: {
    /**
     * Generate a Jira-related tag for linking tests to Jira tickets.
     * Usage: TEST_TAGS.RELATED('JIRA-1234') => '@jira(JIRA-1234)'
     */
    RELATED: (jiraId: string) => string;
    BACK_SHORELINE: string;
    BACK_CLINIC: string;
    BACK_HIGHWATER: string;
    BACK_HYDROPHONE: string;
    BACK_PLATFORM: string;
    BACK_SEAGULL: string;
    BACK_TIDEWHISPERER: string;
    BACK_MESSAGEAPI: string;
    BACK_JELLYFISH: string;
    BACK_GATEKEEPER: string;
    BACK_EXPORT: string;
    BACK_KEYCLOAK: string;
    PATIENT: string;
    CLINICIAN: string;
    CUSTODIAL: string;
    SHARED_MEMBER: string;
    PERSONAL: string;
    CLAIMED: string;
    API: string;
    UI: string;
    SMOKE: string;
    REGRESSION: string;
    CRITICAL: string;
    HIGH: string;
    MEDIUM: string;
    LOW: string;
    API_PROFILE: string;
    API_USER: string;
};
export declare const TAG_CATEGORIES: {
    USER_TYPES: string[];
    TEST_TYPES: string[];
    PRIORITIES: string[];
};
/**
 * Validates that tags include at least one from each required category
 * @param tags Array of tags to validate
 * @returns Object with validation results
 */
export declare function validateRequiredTags(tags: string[]): {
    isValid: boolean;
    missing: string[];
    message: string;
};
/**
 * Helper function to create tags with validation
 * Throws error if required tags are missing
 */
export declare function createValidatedTags(tags: string[]): string[];
