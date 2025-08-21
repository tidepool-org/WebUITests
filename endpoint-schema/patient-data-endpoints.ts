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
  validationFields: [
    'data',
    'meta.count',
    'meta.size',
  ],
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
  validationFields: [
    'id',
    'success',
  ],
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
  validationFields: [
    'bgTarget.low',
    'bgTarget.high',
    'units.bg',
    'siteChangeSource',
  ],
};
