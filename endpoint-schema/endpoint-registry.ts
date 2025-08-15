import {
  EndpointSchema,
  getProfileMetadataSchema,
  putProfileMetadataSchema,
  getPatientDataSchema as profileGetPatientDataSchema,
  getMetricsSchema as profileGetMetricsSchema,
  getMessageNotesSchema as profileGetMessageNotesSchema,
} from './profile-endpoints';
import { getPatientDataSchema, uploadPatientDataSchema } from './patient-data-endpoints';
// Import other endpoint schemas as they're created
// import { ... } from './auth-endpoints';

/**
 * Centralized endpoint registry for all API validation
 * This allows network helpers to work with any endpoint by name
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

  // Add more endpoints as needed...
  // 'auth-login': authLoginSchema,
  // 'auth-logout': authLogoutSchema,
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
