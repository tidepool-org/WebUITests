/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-useless-escape */
/* eslint-disable n/no-sync */
/* eslint-disable class-methods-use-this */

import { Page, Route, Request, Response, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

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
  async saveCapturesTo(filename: string): Promise<void> {
    const logDir = path.join(process.cwd(), 'log');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const filepath = path.join(logDir, filename);
    const captureData = {
      timestamp: new Date().toISOString(),
      totalCaptures: this.captures.length,
      captures: this.captures,
    };

    fs.writeFileSync(filepath, JSON.stringify(captureData, null, 2));
    console.log(`📄 Network captures saved to: ${filepath}`);
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
   * Save API response as JSON file with endpoint metadata
   */
  async saveApiResponse(
    response: any,
    endpoint: string,
    method: string,
    filePath: string,
  ): Promise<void> {
    const responseData = {
      _request: {
        method,
        endpoint,
      },
      ...response,
    };

    await fs.promises.writeFile(filePath, JSON.stringify(responseData, null, 2), 'utf8');
  }
}

export function createNetworkHelper(page: Page): NetworkHelper {
  return new NetworkHelper(page);
}
