/**
 * Schema definition for API endpoints
 */
export interface EndpointSchema {
  url: string | RegExp;
  method: string;
  expectedStatus?: number;
  responseSchema?: any;
  requestSchema?: any;
  validationFields?: string[];
  requiredFields?: string[];
}

/**
 * Schema for profile metadata GET endpoint
 */
export const getProfileMetadataSchema: EndpointSchema = {
  url: /\/metadata\/.*\/profile$/,
  method: 'GET',
  expectedStatus: 200,
  responseSchema: {
    fullName: 'string',
    patient: 'object',
  },
  validationFields: [
    'fullName',
    'patient.fullName',
    'patient.birthday',
    'patient.diagnosisDate',
    'patient.diagnosisType',
    'patient.targetDevices',
    'patient.targetTimezone',
    'patient.about',
    'patient.isOtherPerson',
    'patient.mrn',
    'patient.biologicalSex',
    'email',
    'patient.email',
    'patient.emails',
    'emails',
  ],
  requiredFields: [
    'fullName', // Profile endpoint must have fullName
  ],
};

/**
 * Schema for profile metadata PUT endpoint
 */
export const putProfileMetadataSchema: EndpointSchema = {
  url: /\/metadata\/.*\/profile$/,
  method: 'PUT',
  expectedStatus: 200,
  requestSchema: {
    fullName: 'string',
    patient: 'object',
  },
  responseSchema: {
    fullName: 'string',
    patient: 'object',
  },
  validationFields: [
    'fullName',
    'patient.fullName',
    'patient.birthday',
    'patient.diagnosisDate',
    'patient.diagnosisType',
    'patient.targetDevices',
    'patient.targetTimezone',
    'patient.about',
    'patient.isOtherPerson',
    'patient.mrn',
    'patient.biologicalSex',
    'email',
    'patient.email',
    'patient.emails',
    'emails',
  ],
  requiredFields: [
    'fullName', // Profile endpoint must have fullName
  ],
};

/**
 * Schema for patient data GET endpoint
 */
export const getPatientDataSchema: EndpointSchema = {
  url: /\/data\/[^/]+\?.*$/,
  method: 'GET',
  expectedStatus: 200,
  responseSchema: {
    // Patient data array - structure will vary
  },
  validationFields: [
    // Data array validation fields would go here based on specific data types
  ],
};

/**
 * Schema for metrics/analytics endpoint
 */
export const getMetricsSchema: EndpointSchema = {
  url: /\/metrics\/thisuser\/.*$/,
  method: 'GET',
  expectedStatus: 200,
  validationFields: [
    // Metrics-specific validation fields would go here
  ],
};

/**
 * Schema for message notes endpoint
 */
export const getMessageNotesSchema: EndpointSchema = {
  url: /\/message\/notes\/[^/]+\?.*$/,
  method: 'GET',
  expectedStatus: 200, // We'll handle 404 as acceptable in the validation logic
  validationFields: [
    // Message notes validation fields would go here
  ],
};
