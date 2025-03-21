import fs from "fs";
import env from "./env";

/**
 * Reporter class for uploading test results to Xray
 */
class XRayReporter {
  constructor() {
    this.styles = {
      success: "✅",
      error: "❌",
      info: "ℹ️",
      warning: "⛔️",
      upload: "🚀",
      test: "🧪",
      separator: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    };
  }

  /**
   * Authenticates with Xray API using client credentials
   * @returns {Promise<string>} The authentication token
   * @throws {Error} If authentication fails
   */
  async authenticateWithXray() {
    try {
      console.log(`${this.styles.info} Authenticating with Xray...`);
      const response = await fetch("https://xray.cloud.getxray.app/api/v1/authenticate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: env.XRAY_CLIENT_ID,
          client_secret: env.XRAY_CLIENT_SECRET,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, ${response.body}`);
      }

      const data = await response.json();
      console.log(`${this.styles.success} Successfully authenticated with Xray`);
      return data.token;
    } catch (error) {
      console.error(`${this.styles.error} Failed to authenticate with Xray:`, error);
      throw error;
    }
  }

  /**
   * Uploads test results to Xray
   * @param {string} token - The authentication token
   * @param {string} xmlContent - The JUnit XML content to upload
   * @returns {Promise<void>}
   * @throws {Error} If upload fails
   */
  async uploadTestResults(token, xmlContent) {
    try {
      console.log(`${this.styles.info} Uploading test results to Xray...`);
      const response = await fetch(
        "https://xray.cloud.getxray.app/api/v2/import/execution/junit?projectKey=XT&testPlanKey=XT-380",
        {
          method: "POST",
          headers: {
            "Content-Type": "text/xml",
            Authorization: `Bearer ${token}`,
          },
          body: xmlContent,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, Response: ${errorText}`);
      }

      console.log(`${this.styles.success} Successfully uploaded test results to Xray`);
    } catch (error) {
      console.error(`${this.styles.error} Failed to upload test results to Xray:`, error);
      throw error;
    }
  }

  /**
   * Called when test run begins
   * @param {Object} config - Playwright configuration object
   * @param {Object} suite - Test suite object containing all tests
   */
  onBegin(config, suite) {
    console.log("\n" + this.styles.separator);
    console.log(`${this.styles.test} Starting test run with ${suite.allTests().length} tests`);
    console.log(this.styles.separator + "\n");
  }

  /**
   * Called when a test begins
   * @param {Object} test - Test case object
   * @param {Object} result - Test result object
   */
  onTestBegin(test, result) {
    console.log(`${this.styles.test} Starting: ${test.title}`);
  }

  /**
   * Called when a test ends
   * @param {Object} test - Test case object
   * @param {Object} result - Test result object containing status and other details
   */
  onTestEnd(test, result) {
    const statusEmoji = result.status === "passed" ? this.styles.success : this.styles.error;
    console.log(`${statusEmoji} Finished: ${test.title} (${result.status})`);
  }

  /**
   * Called when all tests have finished
   * @param {Object} result - Full test run result object containing status and duration
   */
  async onEnd(result) {
    console.log("\n" + this.styles.separator);
    console.log(`${this.styles.info} Test Run Summary:`);
    console.log(`Status: ${result.status === "passed" ? this.styles.success : this.styles.error} ${result.status}`);
    console.log(`Duration: ${result.duration}ms`);
    console.log(this.styles.separator + "\n");

    if (!(env.XRAY_CLIENT_ID || env.XRAY_CLIENT_SECRET)) {
      console.log(`${this.styles.warning} No Xray client ID or secret found, skipping upload to JIRA Xray`);
      return;
    }

    try {
      console.log(`${this.styles.info} Reading test results file...`);
      const testResults = fs.readFileSync("./test-results/test-results.xml", "utf8");

      const token = await this.authenticateWithXray();
      await this.uploadTestResults(token, testResults);
      console.log(`${this.styles.upload} Successfully uploaded test results to Xray`);
    } catch (error) {
      console.error(`${this.styles.error} Failed to process test results:`, error);
    }
    console.log(this.styles.separator + "\n");
  }
}

export default XRayReporter;
