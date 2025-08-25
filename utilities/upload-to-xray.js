#!/usr/bin/env node

/**
 * Standalone utility to upload Playwright JSON results to Xray
 * Usage: node utilities/upload-to-xray.js [path-to-json-results]
 */

const fs = require('fs');
const path = require('path');

// Import the compiled TypeScript reporter
async function uploadResults() {
  try {
    // Import compiled CommonJS module
    const XrayJsonReporter = require('../build/utilities/xray-json-reporter.js').default;
    
    const jsonPath = process.argv[2] || 'test-results/last-run.json';
    
    if (!fs.existsSync(jsonPath)) {
      console.error(`❌ JSON results file not found: ${jsonPath}`);
      process.exit(1);
    }

    console.log(`🚀 Processing Playwright results from: ${jsonPath}`);
    
    const reporter = new XrayJsonReporter();
    await reporter.processAndUpload(jsonPath);
    
    console.log('✅ Xray upload completed successfully');
  } catch (error) {
    console.error('❌ Failed to upload to Xray:', error);
    process.exit(1);
  }
}

uploadResults();