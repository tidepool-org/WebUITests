"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPatientSettingsSchema = exports.uploadPatientDataSchema = exports.getPatientDataSchema = void 0;
/**
 * Schema for patient data GET endpoint
 */
exports.getPatientDataSchema = {
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
    validationFields: ['data', 'meta.count', 'meta.size'],
};
/**
 * Schema for uploading patient data
 */
exports.uploadPatientDataSchema = {
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
    validationFields: ['id', 'success'],
};
/**
 * Schema for getting patient settings
 */
exports.getPatientSettingsSchema = {
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
    validationFields: ['bgTarget.low', 'bgTarget.high', 'units.bg', 'siteChangeSource'],
};
