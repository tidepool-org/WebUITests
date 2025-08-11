import { EndpointSchema } from './profile-endpoints';

/**
 * Schema for patient data GET endpoint
 */
export const getPatientDataSchema: EndpointSchema = {
  url: /\/v1\/patients\/[^/]+\/data$/,
  method: 'GET',
  expectedStatus: 200,
  responseSchema: {
    data: 'object',
    meta: {
      count: 'number',
      size: 'number',
    },
  },
};

/**
 * Schema for uploading patient data
 */
export const uploadPatientDataSchema: EndpointSchema = {
  url: /\/v1\/patients\/[^/]+\/data$/,
  method: 'POST',
  expectedStatus: 201,
  requestSchema: {
    data: 'object',
    deviceId: 'string',
    uploadId: 'string',
  },
  responseSchema: {
    id: 'string',
    success: 'boolean',
  },
};

/**
 * Schema for getting patient settings
 */
export const getPatientSettingsSchema: EndpointSchema = {
  url: /\/v1\/patients\/[^/]+\/settings$/,
  method: 'GET',
  expectedStatus: 200,
  responseSchema: {
    bgTarget: {
      low: 'number',
      high: 'number',
    },
    units: {
      bg: 'string',
    },
    siteChangeSource: 'string',
  },
};
