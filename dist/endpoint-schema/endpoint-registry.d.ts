import { EndpointSchema } from './profile-endpoints';
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
export declare const ENDPOINT_REGISTRY: {
    readonly 'profile-metadata-get': EndpointSchema;
    readonly 'profile-metadata-put': EndpointSchema;
    readonly 'profile-patient-data-get': EndpointSchema;
    readonly 'profile-metrics-get': EndpointSchema;
    readonly 'profile-message-notes-get': EndpointSchema;
    readonly 'patient-data-get': EndpointSchema;
    readonly 'patient-data-upload': EndpointSchema;
    readonly 'auth-login': EndpointSchema;
    readonly 'auth-logout': EndpointSchema;
    readonly 'auth-refresh-token': EndpointSchema;
};
export type EndpointName = keyof typeof ENDPOINT_REGISTRY;
/**
 * Get endpoint schema by name
 */
export declare function getEndpointSchema(endpointName: EndpointName): EndpointSchema;
