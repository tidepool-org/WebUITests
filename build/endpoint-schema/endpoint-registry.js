"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENDPOINT_REGISTRY = void 0;
exports.getEndpointSchema = getEndpointSchema;
const profile_endpoints_1 = require("./profile-endpoints");
const patient_data_endpoints_1 = require("./patient-data-endpoints");
const auth_endpoints_1 = require("./auth-endpoints");
// Import other endpoint schemas as they're created
/**
 * Centralized endpoint registry for all API validation
 * This allows network helpers to work with any endpoint by name
 *
 * ADDING NEW ENDPOINTS:
 * 1. Define the endpoint schema in the appropriate *-endpoints.ts file
 * 2. Include validationFields array for data consistency checking
 * 3. Add the endpoint to this registry
 * 4. The validationFields will automatically be used by NetworkHelper methods
 *
 * VALIDATION FIELDS:
 * - Use dot notation for nested fields (e.g., 'patient.fullName')
 * - Include all fields that should be validated for data consistency
 * - Different endpoints can have different validation requirements
 * - Fields are endpoint-specific and stored in the schema definition
 */
exports.ENDPOINT_REGISTRY = {
    // Profile endpoints
    'profile-metadata-get': profile_endpoints_1.getProfileMetadataSchema,
    'profile-metadata-put': profile_endpoints_1.putProfileMetadataSchema,
    'profile-patient-data-get': profile_endpoints_1.getPatientDataSchema,
    'profile-metrics-get': profile_endpoints_1.getMetricsSchema,
    'profile-message-notes-get': profile_endpoints_1.getMessageNotesSchema,
    // Patient data endpoints
    'patient-data-get': patient_data_endpoints_1.getPatientDataSchema,
    'patient-data-upload': patient_data_endpoints_1.uploadPatientDataSchema,
    // Auth endpoints
    'auth-login': auth_endpoints_1.loginSchema,
    'auth-logout': auth_endpoints_1.logoutSchema,
    'auth-refresh-token': auth_endpoints_1.refreshTokenSchema,
    // Add more endpoints as needed...
    // 'clinic-get': clinicGetSchema,
    // 'clinic-update': clinicUpdateSchema,
};
/**
 * Get endpoint schema by name
 */
function getEndpointSchema(endpointName) {
    const schema = exports.ENDPOINT_REGISTRY[endpointName];
    if (!schema) {
        throw new Error(`Endpoint schema not found: ${endpointName}`);
    }
    return schema;
}
