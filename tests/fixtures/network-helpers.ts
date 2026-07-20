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

export interface ClinicCreationCapture {
  // The id the clinic service assigns to the newly created workspace.
  clinicId?: string;
  // The headers the app sent on the create call (incl. x-tidepool-session-token), replayed on
  // the DELETE so cleanup authenticates exactly as the app does.
  authHeaders: Record<string, string>;
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

  private clinicCreation: ClinicCreationCapture = { authHeaders: {} };

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Start listening for the clinic-creation POST (/v1/clinics) so the workspace it creates can
   * later be deleted via {@link deleteCreatedClinic}. Call this BEFORE submitting the
   * create-clinic form. Captures the new clinic's id from the response and the auth headers the
   * app sent (incl. x-tidepool-session-token). Passive by design — it never throws or fails the
   * test; if the create call is never seen, deleteCreatedClinic() reports the missing data.
   */
  captureClinicCreation(): void {
    this.page.on('response', async (response: Response) => {
      try {
        const request = response.request();
        if (request.method() === 'POST' && /\/v1\/clinics(\?.*)?$/.test(response.url())) {
          this.clinicCreation.authHeaders = await request.allHeaders();
          const body = await response.json().catch(() => undefined);
          this.clinicCreation.clinicId =
            body?.id ?? body?.clinicId ?? body?.clinic?.id ?? this.clinicCreation.clinicId;
          console.log(
            `🏥 Captured clinic create: id=${this.clinicCreation.clinicId ?? 'UNKNOWN'} ` +
              `(POST ${response.url()} -> ${response.status()})`,
          );
        }
      } catch {
        // Never let capture break the test; deleteCreatedClinic() reports missing data instead.
      }
    });
  }

  /** The clinic id captured by {@link captureClinicCreation}, if the create call was seen. */
  getCreatedClinicId(): string | undefined {
    return this.clinicCreation.clinicId;
  }

  /**
   * Delete the clinic workspace captured by {@link captureClinicCreation} via the clinic API,
   * reusing the auth header the app sent on the create call. Throws with a clear message if the
   * clinic id or an auth header was never captured, or if the API responds with a non-2xx status.
   * @param baseUrl - The environment host (e.g. env.BASE_URL); DELETE hits {baseUrl}/v1/clinics/{id}.
   * @returns The HTTP status code of the DELETE response.
   */
  async deleteCreatedClinic(baseUrl: string): Promise<number> {
    const { clinicId, authHeaders } = this.clinicCreation;
    if (!clinicId) {
      throw new Error(
        'No clinic id was captured from the create-clinic response; cannot delete the workspace. ' +
          'Call captureClinicCreation() before submitting the form, and check that creating a ' +
          'clinic still POSTs to /v1/clinics.',
      );
    }

    const sessionToken = authHeaders['x-tidepool-session-token'];
    const { authorization } = authHeaders;
    if (!sessionToken && !authorization) {
      throw new Error(
        'No auth header (x-tidepool-session-token / authorization) was captured from the create ' +
          'request; cannot authenticate the delete.',
      );
    }

    const deleteHeaders: Record<string, string> = {};
    if (sessionToken) deleteHeaders['x-tidepool-session-token'] = sessionToken;
    if (authorization) deleteHeaders.authorization = authorization;

    // baseUrl is the real environment host (e.g. https://qa2.development.tidepool.org); the
    // clinic service lives on that same host at /v1/clinics/{clinicId}.
    const deleteUrl = `${baseUrl.replace(/\/$/, '')}/v1/clinics/${clinicId}`;
    const response = await this.page.request.delete(deleteUrl, { headers: deleteHeaders });

    console.log(`🗑️  DELETE ${deleteUrl} -> ${response.status()}`);
    if (!response.ok()) {
      const bodyText = await response.text().catch(() => '');
      throw new Error(
        `Expected clinic deletion to succeed but got HTTP ${response.status()}: ${bodyText}`,
      );
    }
    return response.status();
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
  async saveCapturesTo(
    filename: string,
    testInfo?: import('@playwright/test').TestInfo,
  ): Promise<void> {
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
   * Wait for and get the most recent capture matching method and URL pattern after a specific timestamp
   * @param method - HTTP method to match
   * @param urlPattern - URL pattern to match
   * @param afterTimestamp - Only consider captures after this timestamp (defaults to now)
   * @param timeoutMs - Maximum time to wait in milliseconds (default 10000)
   * @returns Promise that resolves with the matching capture or rejects on timeout
   */
  async waitForCaptureMatching(
    method: string,
    urlPattern: RegExp,
    afterTimestamp: number = Date.now(),
    timeoutMs = 10000,
  ): Promise<NetworkCapture> {
    const startTime = Date.now();

    const capture = await new Promise<NetworkCapture>((resolve, reject) => {
      const checkForCapture = () => {
        // Look for captures after the specified timestamp
        const matches = this.captures
          .filter(
            c => c.method === method && urlPattern.test(c.url) && c.timestamp > afterTimestamp,
          )
          .sort((a, b) => b.timestamp - a.timestamp);

        if (matches.length > 0) {
          resolve(matches[0]);
          return;
        }

        // Check if we've exceeded the timeout
        if (Date.now() - startTime > timeoutMs) {
          reject(
            new Error(
              `Timeout waiting for ${method} request matching ${urlPattern} after timestamp ${afterTimestamp}. ` +
                `Total captures: ${this.captures.length}, ` +
                `Matching method/URL: ${this.captures.filter(c => c.method === method && urlPattern.test(c.url)).length}`,
            ),
          );
          return;
        }

        // Check again in 100ms
        setTimeout(checkForCapture, 100);
      };

      // Start checking
      checkForCapture();
    });

    // Attach the captured response as this step's JSON evidence (deduped per step), so
    // validation steps that only wait + compare still show their response in the report.
    await this.attachStepJson(capture.responseBody, capture.url, capture.method);
    return capture;
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

  // The step ordinal we last attached a JSON response for. Ensures at most one response
  // JSON per step, so a step that both waitForCaptureMatching()'s and
  // validateEndpointResponse()'s the same call doesn't attach a duplicate.
  private lastAttachedStepOrdinal = -1;

  /**
   * Attaches an API response as this step's JSON evidence, named by the CURRENT step ordinal
   * (so the reporter maps it to the right step). Deduped per step. This is what makes
   * validation steps that only wait+compare (no validateEndpointResponse) still show their
   * captured response in the report.
   */
  private async attachStepJson(responseBody: any, url: string, method: string): Promise<void> {
    if (!responseBody) return;
    const stepCounterObj = (globalThis as any).stepCounter;
    const { testInfo } = globalThis as any;
    if (!stepCounterObj || !testInfo) return;

    const ordinal = stepCounterObj.get();
    if (ordinal === this.lastAttachedStepOrdinal) return;
    this.lastAttachedStepOrdinal = ordinal;

    const currentStepName = stepCounterObj.getCurrentStepName();
    const stepNameForFile = currentStepName
      ? currentStepName.toLowerCase().replace(/[^a-z0-9]/g, '-')
      : 'response';
    const fileName = `step-${ordinal.toString().padStart(2, '0')}-${stepNameForFile}-response.json`;
    await this.saveApiResponse(responseBody, url, method, fileName, testInfo);
  }

  /**
   * Save API response as JSON attachment and to organized test-results folder
   */
  async saveApiResponse(
    response: any,
    endpoint: string,
    method: string,
    fileName: string,
    testInfo?: import('@playwright/test').TestInfo,
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
      await this.attachStepJson(request.responseBody, request.url, schema.method);
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
      const { testInfo } = globalThis as any;
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
    const defaultFields = ['fullName', 'patient.fullName', 'patient.birthday', 'email'];

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
   * @param path - The dot-notation path (e.g., 'patient.birthday' or 'patient.emails[0].address')
   * @returns The value at the path or undefined
   */
  private getNestedValue(obj: any, propertyPath: string): any {
    if (!obj || typeof obj !== 'object') return undefined;

    return propertyPath.split('.').reduce((current, key) => {
      if (current === null || current === undefined) return undefined;

      // Handle array notation like 'emails[0]'
      const arrayMatch = key.match(/^(\w+)\[(\d+)\]$/);
      if (arrayMatch) {
        const [, arrayKey, index] = arrayMatch;
        const array = current[arrayKey];
        return Array.isArray(array) ? array[parseInt(index, 10)] : undefined;
      }

      return current[key];
    }, obj);
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
      producerSchema.validationFields || ['fullName', 'email'];

    // Use consumer endpoint required fields, or producer endpoint required fields, or default
    const requiredFields = consumerSchema.requiredFields ||
      producerSchema.requiredFields || ['fullName'];

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

    this.validateDataConsistency(
      producerCapture,
      consumerCapture,
      validationFields,
      requiredFields,
    );
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
      consumerSchema.validationFields || ['fullName', 'patient.fullName', 'email'];

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
    const stepCounterObj = (globalThis as any).stepCounter;
    if (stepCounterObj) {
      // Use the CURRENT step ordinal (do not bump it) so this comparison JSON shares its
      // step's number; the step wrappers own bumping, once per step.
      const stepNumber = stepCounterObj.get();
      const currentStepName = stepCounterObj.getCurrentStepName();

      // Create comparison data object
      const comparisonData = {
        _comparison: {
          description: `Data consistency comparison for ${consumerEndpointName}`,
          timestamp: new Date().toISOString(),
          fieldsValidated: validationFields,
          requiredFields,
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
      const { testInfo } = globalThis as any;
      await this.saveApiResponse(
        comparisonData,
        consumerCapture.url,
        consumerCapture.method,
        fileName,
        testInfo,
      );
    }

    // Validate data consistency using the determined validation fields and required fields
    this.validateDataConsistency(
      producerCapture,
      consumerCapture,
      validationFields,
      requiredFields,
    );
  }

  /**
   * Reload the current page to trigger API calls again
   * @param waitUntil - Wait until a specific state before considering reload complete
   * @param timeout - Maximum time to wait for reload to complete (default 30s)
   */
  async reloadPage(
    waitUntil: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' = 'networkidle',
    timeout = 30000,
  ): Promise<void> {
    console.log('🔄 Reloading page to trigger API calls...');
    await this.page.reload({ waitUntil, timeout });
    console.log('✅ Page reloaded successfully');
  }

  /**
   * Validates that specific values appear in the correct fields of a captured response
   * @param capture - The captured network response to validate
   * @param expectedValues - Object mapping field paths to expected values
   * Example: { 'patient.fullName': 'John Doe', 'patient.mrn': '123456' }
   */
  validateResponseFields(capture: NetworkCapture, expectedValues: Record<string, any>): void {
    if (!capture || !capture.responseBody) {
      throw new Error('No response body available for field validation');
    }

    const { responseBody } = capture;
    const validationErrors: string[] = [];

    for (const [fieldPath, expectedValue] of Object.entries(expectedValues)) {
      const actualValue = this.getNestedValue(responseBody, fieldPath);

      if (actualValue === undefined) {
        validationErrors.push(`Field '${fieldPath}' not found in response`);
      } else {
        // Handle different comparison types
        let isMatch = false;

        if (expectedValue === actualValue) {
          isMatch = true;
        } else if (Array.isArray(actualValue)) {
          // For arrays, check if expected value is contained
          isMatch = actualValue.some(item =>
            typeof item === 'object' && item !== null
              ? Object.values(item).includes(expectedValue)
              : item === expectedValue,
          );
        } else if (typeof actualValue === 'string' && typeof expectedValue === 'string') {
          // For strings, allow partial matching (useful for emails, names with formatting)
          isMatch = actualValue.includes(expectedValue) || expectedValue.includes(actualValue);
        }

        if (!isMatch) {
          validationErrors.push(
            `Field '${fieldPath}' mismatch: expected '${expectedValue}', got '${actualValue}'`,
          );
        }
      }
    }

    if (validationErrors.length > 0) {
      throw new Error(`Field validation failed:\n${validationErrors.join('\n')}`);
    }

    console.log(`✅ All ${Object.keys(expectedValues).length} field validations passed`);
  }
}

export function createNetworkHelper(page: Page): NetworkHelper {
  return new NetworkHelper(page);
}
