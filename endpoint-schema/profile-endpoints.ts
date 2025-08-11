/**
 * Schema definition for API endpoints
 */
export interface EndpointSchema {
  url: string | RegExp;
  method: string;
  expectedStatus?: number;
  responseSchema?: any;
  requestSchema?: any;
}

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
};

/**
 * Schema for metrics/analytics endpoint
 */
export const getMetricsSchema: EndpointSchema = {
  url: /\/metrics\/thisuser\/.*$/,
  method: 'GET',
  expectedStatus: 200,
};

/**
 * Schema for message notes endpoint
 */
export const getMessageNotesSchema: EndpointSchema = {
  url: /\/message\/notes\/[^/]+\?.*$/,
  method: 'GET',
  expectedStatus: 200, // We'll handle 404 as acceptable in the validation logic
};
