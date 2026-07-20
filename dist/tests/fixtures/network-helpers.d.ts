import { Page } from '@playwright/test';
import { type EndpointName } from '../../endpoint-schema/endpoint-registry';
export interface NetworkCapture {
    url: string;
    method: string;
    requestBody?: any;
    responseBody?: any;
    statusCode?: number;
    timestamp: number;
}
/**
 * Simple network helper for API validation
 */
export declare class NetworkHelper {
    private page;
    private captures;
    private isCapturing;
    constructor(page: Page);
    startCapture(): Promise<void>;
    stopCapture(): Promise<void>;
    waitForEndpoint(endpointName: string, method: string, timeout?: number): Promise<NetworkCapture>;
    getCaptures(): NetworkCapture[];
    /**
     * Simple helper to validate endpoint requests by URL pattern and method
     */
    validateEndpointRequests(urlPattern: string, method: string): NetworkCapture[];
    /**
     * Save all captures to a JSON file
     */
    saveCapturesTo(filename: string, testInfo?: import('@playwright/test').TestInfo): Promise<void>;
    /**
     * Print a summary of all captures to console
     */
    printCaptureSummary(): void;
    /**
     * Get captures filtered by status code
     */
    getCapturesByStatus(statusCode: number): NetworkCapture[];
    /**
     * Get the most recent capture matching method and URL pattern
     */
    getLatestCaptureMatching(method: string, urlPattern: RegExp): NetworkCapture | null;
    /**
     * Get all captures for a specific endpoint
     */
    getCapturesForEndpoint(endpointName: string): NetworkCapture[];
    /**
     * Get all captures
     */
    getAllCaptures(): NetworkCapture[];
    /**
     * Save API response as JSON attachment and to organized test-results folder
     */
    saveApiResponse(response: any, endpoint: string, method: string, fileName: string, testInfo?: import('@playwright/test').TestInfo): Promise<void>;
    /**
     * Validate and save API response for any endpoint defined in the endpoint registry
     * @param endpointName - The endpoint name from the registry (e.g., 'profile-metadata-get')
     * @returns The captured network request or null if not found
     */
    validateEndpointResponse(endpointName: EndpointName): Promise<NetworkCapture | null>;
    /**
     * Save network capture for producer/consumer test patterns
     * @param endpointName - The endpoint to save
     * @param testName - Name of the test (used for file naming)
     * @returns The saved network capture or null
     */
    saveForDependentTests(endpointName: EndpointName, testName: string): Promise<NetworkCapture | null>;
    /**
     * Load producer test data for consumer tests
     * @param testName - Name of the producer test (used for file naming)
     * @returns The loaded network capture or null
     */
    loadFromProducerTest(testName: string): NetworkCapture | null;
    /**
     * Validate data consistency between producer and consumer responses
     * @param producerCapture - The producer test network capture
     * @param consumerCapture - The consumer test network capture
     * @param fieldsToValidate - Array of field paths to validate (e.g., ['fullName', 'patient.birthday'])
     * @param requiredFields - Array of fields that must exist and match (defaults to common required fields)
     */
    validateDataConsistency(producerCapture: NetworkCapture, consumerCapture: NetworkCapture, fieldsToValidate?: string[], requiredFields?: string[]): void;
    /**
     * Helper method to get nested object values using dot notation
     * @param obj - The object to search
     * @param path - The dot-notation path (e.g., 'patient.birthday')
     * @returns The value at the path or undefined
     */
    private getNestedValue;
    /**
     * Validate producer-consumer data consistency for profile endpoints
     * @param producerEndpointName - The PUT endpoint name (e.g., 'profile-metadata-put')
     * @param consumerEndpointName - The GET endpoint name (e.g., 'profile-metadata-get')
     * @param fieldsToValidate - Optional array of fields to validate (overrides endpoint schema)
     * @throws Error if validation fails
     */
    validateProducerConsumerData(producerEndpointName: EndpointName, consumerEndpointName: EndpointName, fieldsToValidate?: string[]): Promise<void>;
    /**
     * Private method to validate endpoint response without generating JSON file
     * @param endpointName - The endpoint name from the registry
     * @returns The captured network request or null if not found
     */
    private validateEndpointResponseSilent;
    /**
     * Complete validation workflow for a user viewing profile data
     * Validates both API schema and data consistency in one call
     * @param consumerEndpointName - The GET endpoint name
     * @param producerCapture - The stored PUT capture from the producer
     * @param fieldsToValidate - Optional array of fields to validate (overrides endpoint schema)
     */
    compareEndpointResponse(consumerEndpointName: EndpointName, producerCapture: NetworkCapture, fieldsToValidate?: string[]): Promise<void>;
}
export declare function createNetworkHelper(page: Page): NetworkHelper;
