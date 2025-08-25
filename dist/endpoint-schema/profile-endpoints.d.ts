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
export declare const getProfileMetadataSchema: EndpointSchema;
/**
 * Schema for profile metadata PUT endpoint
 */
export declare const putProfileMetadataSchema: EndpointSchema;
/**
 * Schema for patient data GET endpoint
 */
export declare const getPatientDataSchema: EndpointSchema;
/**
 * Schema for metrics/analytics endpoint
 */
export declare const getMetricsSchema: EndpointSchema;
/**
 * Schema for message notes endpoint
 */
export declare const getMessageNotesSchema: EndpointSchema;
