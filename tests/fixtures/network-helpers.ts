import { Page, Route, Request, Response, expect, TestInfo } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  ENDPOINT_REGISTRY,
  getEndpointSchema,
  type EndpointName,
} from '../../endpoint-schema/endpoint-registry';

export interface NetworkCapture {
  url: string;
  method: string;
  requestBody?: any;
  responseBody?: any;
  statusCode?: number;
  timestamp: number;
}

const ENDPOINTS = {
  profile: /\/data\/[^\/]+$/, // GET requests for patient data
  profileUpdate: /\/data\/[^\/]+$/, // PUT requests for patient data updates
  profileMetrics: /\/metrics\/thisuser\//,
  profileMessage: /\/message\/notes\//,
};

/**
 * Simple network helper for API validation
 */
export class NetworkHelper {
  private page: Page;

  private captures: NetworkCapture[] = [];

  private isCapturing = false;

  constructor(page: Page) {
    this.page = page;
  }

  async startCapture(): Promise<void> {
    if (this.isCapturing) return;

    // Only intercept API requests we care about to avoid interfering with other requests
    const apiPatterns = [
      '**/data/**',
      '**/metrics/**',
      '**/message/**',
      '**/auth/**',
      '**/v1/**',
      '**/metadata/**',
      '**/user/**',
      '**/users/**',
      '**/profile/**',
    ];

    for (const pattern of apiPatterns) {
      await this.page.route(pattern, async (route: Route) => {
        const request = route.request();

        try {
          const response = await route.fetch();

          let requestBody: any;
          let responseBody: any;

          try {
            requestBody = request.postDataJSON();
          } catch {
            requestBody = request.postData();
          }

          try {
            responseBody = await response.json();
          } catch {
            responseBody = await response.text();
          }

          this.captures.push({
            url: request.url(),
            method: request.method(),
            requestBody,
            responseBody,
            statusCode: response.status(),
            timestamp: Date.now(),
          });

          await route.fulfill({ response });
        } catch (error) {
          // If there's an error, continue the request without handling
          try {
            await route.continue();
          } catch {
            // Route might already be handled, ignore
          }
        }
      });
    }

    this.isCapturing = true;
  }

  async stopCapture(): Promise<void> {
    if (!this.isCapturing) return;

    // Remove all API route handlers
    const apiPatterns = ['**/data/**', '**/metrics/**', '**/message/**', '**/auth/**', '**/v1/**'];

    for (const pattern of apiPatterns) {
      await this.page.unroute(pattern);
    }

    this.isCapturing = false;
  }

  async waitForEndpoint(
    endpointName: string,
    method: string,
    timeout = 30000,
  ): Promise<NetworkCapture> {
    const pattern = ENDPOINTS[endpointName as keyof typeof ENDPOINTS];
    if (!pattern) {
      throw new Error(`Unknown endpoint: ${endpointName}`);
    }

    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const matches = this.captures.filter(
        capture =>
          pattern.test(capture.url) && capture.method.toLowerCase() === method.toLowerCase(),
      );

      if (matches.length > 0) {
        return matches[matches.length - 1]; // Return latest match
      }

      await this.page.waitForTimeout(100);
    }

    throw new Error(`${method} request to ${endpointName} not found within ${timeout}ms`);
  }

  getCaptures(): NetworkCapture[] {
    return [...this.captures];
  }

  /**
   * Simple helper to validate endpoint requests by URL pattern and method
   */
  validateEndpointRequests(urlPattern: string, method: string): NetworkCapture[] {
    return this.captures.filter(c => c.url.includes(urlPattern) && c.method === method);
  }

  /**
   * Save all captures to a JSON file
   */
  async saveCapturesTo(filename: string, testInfo?: import('@playwright/test').TestInfo): Promise<void> {
    const logDir = path.join(process.cwd(), 'log');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Create capture data
    const captureData = {
      timestamp: new Date().toISOString(),
      totalCaptures: this.captures.length,
      captures: this.captures,
    };

    // Use Playwright's automatic attachment instead of manual file writing
    if (testInfo && typeof testInfo.attach === 'function') {
      await testInfo.attach(filename, {
        body: JSON.stringify(captureData, null, 2),
        contentType: 'application/json',
      });
      console.log(`📄 Network captures attached to Playwright report: ${filename}`);
    } else {
      console.log(`📄 Network captures ready (${this.captures.length} captures)`);
    }
  }

  /**
   * Print a summary of all captures to console
   */
  printCaptureSummary(): void {
    console.log(`\n📊 Network Capture Summary (${this.captures.length} total requests):`);
    console.log('='.repeat(60));

    this.captures.forEach((capture, index) => {
      const timestamp = new Date(capture.timestamp).toLocaleTimeString();
      console.log(`${index + 1}. ${capture.method} ${capture.statusCode} - ${capture.url}`);
      console.log(`   Time: ${timestamp}`);
      if (capture.requestBody) {
        console.log(`   Request: ${JSON.stringify(capture.requestBody).substring(0, 100)}...`);
      }
      console.log('');
    });
  }

  /**
   * Get captures filtered by status code
   */
  getCapturesByStatus(statusCode: number): NetworkCapture[] {
    return this.captures.filter(c => c.statusCode === statusCode);
  }

  /**
   * Get the most recent capture matching method and URL pattern
   */
  getLatestCaptureMatching(method: string, urlPattern: RegExp): NetworkCapture | null {
    const matches = this.captures
      .filter(c => c.method === method && urlPattern.test(c.url))
      .sort((a, b) => b.timestamp - a.timestamp);

    return matches.length > 0 ? matches[0] : null;
  }

  /**
   * Get all captures for a specific endpoint
   */
  getCapturesForEndpoint(endpointName: string): NetworkCapture[] {
    const pattern = ENDPOINTS[endpointName as keyof typeof ENDPOINTS];
    if (!pattern) {
      throw new Error(`Unknown endpoint: ${endpointName}`);
    }

    return this.captures.filter(c => pattern.test(c.url));
  }

  /**
   * Get all captures
   */
  getAllCaptures(): NetworkCapture[] {
    return [...this.captures];
  }

  /**
   * Save API response as JSON attachment and to organized test-results folder
   */
  async saveApiResponse(
    response: any,
    endpoint: string,
    method: string,
    fileName: string,
    testInfo?: import('@playwright/test').TestInfo
  ): Promise<void> {
    const responseData = {
      _request: {
        method,
        endpoint,
      },
      ...response,
    };

    const jsonContent = JSON.stringify(responseData, null, 2);

    // Attach to Playwright report AND save to organized test-results folder
    if (testInfo && typeof testInfo.attach === 'function') {
      await testInfo.attach(fileName, {
        body: jsonContent,
        contentType: 'application/json',
      });
      
      // Also save to test-results for organized viewing (like screenshots)
      const testResultsDir = path.join(testInfo.outputDir, 'attachments');
      await fs.promises.mkdir(testResultsDir, { recursive: true });
      const jsonPath = path.join(testResultsDir, fileName);
      await fs.promises.writeFile(jsonPath, jsonContent, 'utf8');
    }
  }

  /**
   * Validate and save API response for any endpoint defined in the endpoint registry
   * @param endpointName - The endpoint name from the registry (e.g., 'profile-metadata-get')
   * @returns The captured network request or null if not found
   */
  async validateEndpointResponse(endpointName: EndpointName): Promise<NetworkCapture | null> {
    const schema = getEndpointSchema(endpointName);
    const request = this.getLatestCaptureMatching(schema.method, schema.url as RegExp);

    if (request?.responseBody) {
      // Access the shared step counter from the stepScreenshoter fixture
      const stepCounterObj = (globalThis as any).__stepCounter;
      if (stepCounterObj) {
        const stepNumber = stepCounterObj.increment();
        const currentStepName = stepCounterObj.getCurrentStepName();

        // Create consistent filename with step number and step name (like screenshots)
        const stepNameForFile = currentStepName
          ? currentStepName.toLowerCase().replace(/[^a-z0-9]/g, '-')
          : endpointName.replace(/[^a-z0-9]/gi, '-');
        const fileName = `step-${stepNumber.toString().padStart(2, '0')}-${stepNameForFile}-response.json`;

        await this.saveApiResponse(
          request.responseBody,
          request.url,
          schema.method,
          fileName,
          (globalThis as any).testInfo
        );
      }
    }

    return request;
  }

  /**
   * Save network capture for producer/consumer test patterns
   * @param endpointName - The endpoint to save
   * @param testName - Name of the test (used for file naming)
   * @returns The saved network capture or null
   */
  async saveForDependentTests(
    endpointName: EndpointName,
    testName: string,
  ): Promise<NetworkCapture | null> {
    const schema = getEndpointSchema(endpointName);
    const capture = this.getLatestCaptureMatching(schema.method, schema.url as RegExp);

    if (capture) {
      // Create step-based filename for better organization
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const stepName = testName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const fileName = `step-api-${stepName}-${endpointName.replace(/[^a-z0-9]/gi, '-')}-${timestamp}.json`;

      console.log(`✅ Saved ${endpointName} response for dependent tests`);
      
      // Use Playwright's automatic attachment instead of file system
      const testInfo = (globalThis as any).testInfo;
      if (testInfo && typeof testInfo.attach === 'function') {
        await testInfo.attach(fileName, {
          body: JSON.stringify(capture, null, 2),
          contentType: 'application/json',
        });
      }
      
      return capture;
    }

    return null;
  }

  /**
   * Load producer test data for consumer tests
   * @param testName - Name of the producer test (used for file naming)
   * @returns The loaded network capture or null
   */
  loadFromProducerTest(testName: string): NetworkCapture | null {
    const filePath = path.join(
      process.cwd(),
      'log',
      'test-data-pipeline',
      `${testName}-response.json`,
    );

    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const capture = JSON.parse(fileContent);
      console.log(`✅ Loaded ${testName} response from producer test`);
      return capture;
    }
    throw new Error(
      `Producer test data not found at: ${filePath}. Please run ${testName} test first.`,
    );
  }

  /**
   * Validate data consistency between producer and consumer responses
   * @param producerCapture - The producer test network capture
   * @param consumerCapture - The consumer test network capture
   * @param fieldsToValidate - Array of field paths to validate (e.g., ['fullName', 'patient.birthday'])
   * @param requiredFields - Array of fields that must exist and match (defaults to common required fields)
   */
  validateDataConsistency(
    producerCapture: NetworkCapture,
    consumerCapture: NetworkCapture,
    fieldsToValidate?: string[],
    requiredFields: string[] = ['fullName'], // Only require fullName by default, but allow override
  ): void {
    // Use provided fields or fall back to a basic set for backward compatibility
    const defaultFields = [
      'fullName',
      'patient.fullName',
      'patient.birthday',
      'email',
    ];
    
    const fieldsToCheck = fieldsToValidate || defaultFields;
    const producerData = producerCapture.responseBody;
    const consumerData = consumerCapture.responseBody;

    if (!producerData || !consumerData) {
      throw new Error('Missing response data for consistency validation');
    }

    console.log('🔍 Validating data consistency:');
    // Only log full data in development mode
    if (process.env.VERBOSE_VALIDATION) {
      console.log('Producer:', JSON.stringify(producerData, null, 2));
      console.log('Consumer:', JSON.stringify(consumerData, null, 2));
    } else {
      console.log('Producer fullName:', producerData.fullName);
      console.log('Consumer fullName:', consumerData.fullName);
    }

    // Validate each specified field
    for (const fieldPath of fieldsToCheck) {
      const producerValue = this.getNestedValue(producerData, fieldPath);
      const consumerValue = this.getNestedValue(consumerData, fieldPath);

      // Check if this field is marked as required
      const isRequired = requiredFields.includes(fieldPath);
      
      if (isRequired) {
        if (producerValue === undefined || producerValue === null) {
          throw new Error(`Required field ${fieldPath} is missing in producer data`);
        }
        if (consumerValue === undefined || consumerValue === null) {
          throw new Error(`Required field ${fieldPath} is missing in consumer data`);
        }
      }

      // For optional fields: only validate if the field exists in producer data
      // If it exists in producer, it must also exist in consumer with same value
      if (producerValue !== undefined && producerValue !== null) {
        // Handle array comparison
        if (Array.isArray(producerValue) && Array.isArray(consumerValue)) {
          if (JSON.stringify(producerValue) !== JSON.stringify(consumerValue)) {
            throw new Error(
              `${fieldPath} mismatch - Expected: ${JSON.stringify(producerValue)}, Got: ${JSON.stringify(consumerValue)}`,
            );
          }
        } else if (producerValue !== consumerValue) {
          throw new Error(
            `${fieldPath} mismatch - Expected: ${producerValue}, Got: ${consumerValue}`,
          );
        }
      }
      // If producer value doesn't exist, consumer doesn't need to have it either (optional field)
    }

    console.log('✅ Data consistency validated: consumer data reflects producer changes');
  }

  /**
   * Helper method to get nested object values using dot notation
   * @param obj - The object to search
   * @param path - The dot-notation path (e.g., 'patient.birthday')
   * @returns The value at the path or undefined
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Validate producer-consumer data consistency for profile endpoints
   * @param producerEndpointName - The PUT endpoint name (e.g., 'profile-metadata-put')
   * @param consumerEndpointName - The GET endpoint name (e.g., 'profile-metadata-get')
   * @param fieldsToValidate - Optional array of fields to validate (overrides endpoint schema)
   * @throws Error if validation fails
   */
  async validateProducerConsumerData(
    producerEndpointName: EndpointName,
    consumerEndpointName: EndpointName,
    fieldsToValidate?: string[],
  ): Promise<void> {
    const producerSchema = getEndpointSchema(producerEndpointName);
    const consumerSchema = getEndpointSchema(consumerEndpointName);

    // Use provided fields, or consumer endpoint validation fields, or producer endpoint validation fields
    const validationFields = fieldsToValidate || 
                            consumerSchema.validationFields || 
                            producerSchema.validationFields ||
                            ['fullName', 'email'];

    // Use consumer endpoint required fields, or producer endpoint required fields, or default
    const requiredFields = consumerSchema.requiredFields || 
                          producerSchema.requiredFields || 
                          ['fullName'];

    const producerCapture = this.getLatestCaptureMatching(
      producerSchema.method,
      producerSchema.url as RegExp,
    );
    const consumerCapture = this.getLatestCaptureMatching(
      consumerSchema.method,
      consumerSchema.url as RegExp,
    );

    if (!producerCapture) {
      throw new Error(`No ${producerEndpointName} capture found for producer validation`);
    }

    if (!consumerCapture) {
      throw new Error(`No ${consumerEndpointName} capture found for consumer validation`);
    }

    this.validateDataConsistency(producerCapture, consumerCapture, validationFields, requiredFields);
  }

  /**
   * Private method to validate endpoint response without generating JSON file
   * @param endpointName - The endpoint name from the registry
   * @returns The captured network request or null if not found
   */
  private validateEndpointResponseSilent(endpointName: EndpointName): NetworkCapture | null {
    const schema = getEndpointSchema(endpointName);
    const request = this.getLatestCaptureMatching(schema.method, schema.url as RegExp);
    return request;
  }

  /**
   * Complete validation workflow for a user viewing profile data
   * Validates both API schema and data consistency in one call
   * @param consumerEndpointName - The GET endpoint name
   * @param producerCapture - The stored PUT capture from the producer
   * @param fieldsToValidate - Optional array of fields to validate (overrides endpoint schema)
   */
  async compareEndpointResponse(
    consumerEndpointName: EndpointName,
    producerCapture: NetworkCapture,
    fieldsToValidate?: string[],
  ): Promise<void> {
    // Get the endpoint schema to determine validation fields
    const consumerSchema = getEndpointSchema(consumerEndpointName);
    
    // Use provided fields, or endpoint-specific fields, or fall back to basic fields
    const validationFields = fieldsToValidate || 
                            consumerSchema.validationFields || 
                            ['fullName', 'patient.fullName', 'email'];

    // Use endpoint-specific required fields, or default to fullName for backward compatibility
    const requiredFields = consumerSchema.requiredFields || ['fullName'];

    // Validate GET response schema without generating JSON file
    const consumerCapture = this.validateEndpointResponseSilent(consumerEndpointName);

    if (!consumerCapture) {
      throw new Error(`No compare endpoint found`);
    }

    if (!producerCapture) {
      throw new Error('No base endpoint found');
    }

    // Generate comparison JSON file similar to validateEndpointResponse
    const stepCounterObj = (globalThis as any).__stepCounter;
    if (stepCounterObj) {
      // Increment for JSON file naming (this is correct behavior)
      const stepNumber = stepCounterObj.increment();
      const currentStepName = stepCounterObj.getCurrentStepName();

      // Create comparison data object
      const comparisonData = {
        _comparison: {
          description: `Data consistency comparison for ${consumerEndpointName}`,
          timestamp: new Date().toISOString(),
          fieldsValidated: validationFields,
          requiredFields: requiredFields,
        },
        original: {
          url: producerCapture.url,
          method: producerCapture.method,
          timestamp: producerCapture.timestamp,
          responseBody: producerCapture.responseBody,
        },
        new: {
          url: consumerCapture.url,
          method: consumerCapture.method,
          timestamp: consumerCapture.timestamp,
          responseBody: consumerCapture.responseBody,
        },
      };

      // Create consistent filename with step number and step name (like screenshots)
      const stepNameForFile = currentStepName
        ? currentStepName.toLowerCase().replace(/[^a-z0-9]/g, '-')
        : consumerEndpointName.replace(/[^a-z0-9]/gi, '-');
      const fileName = `step-${stepNumber.toString().padStart(2, '0')}-${stepNameForFile}-comparison.json`;

      // Save the comparison data using the unified approach
      const testInfo = (globalThis as any).testInfo;
      await this.saveApiResponse(
        comparisonData,
        consumerCapture.url,
        consumerCapture.method,
        fileName,
        testInfo
      );
    }

    // Validate data consistency using the determined validation fields and required fields
    this.validateDataConsistency(producerCapture, consumerCapture, validationFields, requiredFields);
  }
}

export function createNetworkHelper(page: Page): NetworkHelper {
  return new NetworkHelper(page);
}
