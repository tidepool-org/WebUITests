/**
 * Standalone utility to upload Playwright JSON results to Xray
 * Usage: node utilities/upload-to-xray.js [path-to-json-results]
 */

const fs = require('node:fs');
const path = require('node:path');

// Import the compiled TypeScript reporter
async function uploadResults() {
  try {
    // Import compiled CommonJS module
    // eslint-disable-next-line n/global-require, import-x/extensions
    const XrayJsonReporter = require('../build/utilities/xray-json-reporter.js').default;

    const jsonPath = process.argv[2] || 'test-results/last-run.json';

    if (!fs.existsSync(jsonPath)) {
      console.error(`❌ JSON results file not found: ${jsonPath}`);
      // eslint-disable-next-line n/no-process-exit
      process.exit(1);
    }

    console.log(`🚀 Processing Playwright results from: ${jsonPath}`);

    const reporter = new XrayJsonReporter();
    await reporter.processAndUpload(jsonPath);

    console.log('✅ Xray upload completed successfully');
  } catch (error) {
    console.error('❌ Failed to upload to Xray:', error);
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }
}

uploadResults();
