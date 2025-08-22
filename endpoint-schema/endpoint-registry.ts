import {
  EndpointSchema,
  getProfileMetadataSchema,
  putProfileMetadataSchema,
  getPatientDataSchema as profileGetPatientDataSchema,
  getMetricsSchema as profileGetMetricsSchema,
  getMessageNotesSchema as profileGetMessageNotesSchema,
} from './profile-endpoints';
import { getPatientDataSchema, uploadPatientDataSchema } from './patient-data-endpoints';
import { loginSchema, logoutSchema, refreshTokenSchema } from './auth-endpoints';
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
export const ENDPOINT_REGISTRY = {
  // Profile endpoints
  'profile-metadata-get': getProfileMetadataSchema,
  'profile-metadata-put': putProfileMetadataSchema,
  'profile-patient-data-get': profileGetPatientDataSchema,
  'profile-metrics-get': profileGetMetricsSchema,
  'profile-message-notes-get': profileGetMessageNotesSchema,

  // Patient data endpoints
  'patient-data-get': getPatientDataSchema,
  'patient-data-upload': uploadPatientDataSchema,

  // Auth endpoints
  'auth-login': loginSchema,
  'auth-logout': logoutSchema,
  'auth-refresh-token': refreshTokenSchema,

  // Add more endpoints as needed...
  // 'clinic-get': clinicGetSchema,
  // 'clinic-update': clinicUpdateSchema,
} as const;

export type EndpointName = keyof typeof ENDPOINT_REGISTRY;

/**
 * Get endpoint schema by name
 */
export function getEndpointSchema(endpointName: EndpointName): EndpointSchema {
  const schema = ENDPOINT_REGISTRY[endpointName];
  if (!schema) {
    throw new Error(`Endpoint schema not found: ${endpointName}`);
  }
  return schema;
}
