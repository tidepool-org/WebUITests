/**
 * Dynamic Test Runner Utility
 *
 * This utility builds and executes Playwright test commands dynamically based on:
 * - TARGET_ENV environment variable (defaults to qa1)
 * - TEST_TAGS environment variable (space or comma separated)
 * - Command line arguments for additional Playwright flags
 *
 * Usage:
 *   node utilities/test-runner.js                           # Run all tests on qa1
 *   TARGET_ENV=qa2 node utilities/test-runner.js            # Run all tests on qa2
 *   TEST_TAGS="@smoke @critical" node utilities/test-runner.js  # Run smoke AND critical tests
 *   TEST_TAGS="@api,@ui" node utilities/test-runner.js      # Run api OR ui tests (comma-separated = OR)
 *   node utilities/test-runner.js --debug                   # Pass additional flags to Playwright
 */

const { spawn } = require('node:child_process');
const { existsSync } = require('node:fs');
const path = require('node:path');

// Get environment variables with defaults
const targetEnv = process.env.TARGET_ENV || 'qa1';
const testTags = process.env.TEST_TAGS || '';
const circleCINodeIndex = process.env.CIRCLE_NODE_INDEX;
const circleCINodeTotal = process.env.CIRCLE_NODE_TOTAL;

// Get additional command line arguments (everything after the script name)
const additionalArgs = process.argv.slice(2);

/**
 * Parse test tags and build Playwright grep arguments
 * @param {string} tags - Space or comma separated tags
 * @returns {string[]} Array of grep arguments for Playwright
 */
function buildGrepArgs(tags) {
  if (!tags || tags.trim() === '') {
    return [];
  }

  // Normalize tags: remove @, handle both space and comma separation
  const tagList = tags
    .split(/[\s,]+/)
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .map(tag => (tag.startsWith('@') ? tag.slice(1) : tag));

  if (tagList.length === 0) {
    return [];
  }

  if (tagList.length === 1) {
    // Single tag: simple grep
    return ['--grep', `@${tagList[0]}`];
  }

  // Multiple tags: check if original input used commas (OR logic) or spaces (AND logic)
  const hasCommas = tags.includes(',');

  if (hasCommas) {
    // Comma-separated = OR logic: @tag1|@tag2|@tag3
    const orPattern = tagList.map(tag => `@${tag}`).join('|');
    return ['--grep', orPattern];
  }
  // Space-separated = AND logic: (?=.*@tag1)(?=.*@tag2)(?=.*@tag3)
  const andPattern = tagList.map(tag => `(?=.*@${tag})`).join('');
  return ['--grep', andPattern];
}

/**
 * Build the complete Playwright command
 * @returns {object} Command and arguments for spawning
 */
function buildPlaywrightCommand() {
  const baseArgs = ['test'];

  // Add sharding for CircleCI if available
  if (circleCINodeIndex !== undefined && circleCINodeTotal !== undefined) {
    baseArgs.push(`--shard=${circleCINodeIndex}/${circleCINodeTotal}`);
  }

  // Add grep arguments for tags
  const grepArgs = buildGrepArgs(testTags);
  baseArgs.push(...grepArgs);

  // Add any additional command line arguments
  baseArgs.push(...additionalArgs);

  return {
    command: 'npx',
    args: ['playwright', ...baseArgs],
    env: {
      ...process.env,
      TARGET_ENV: targetEnv,
    },
  };
}

/**
 * Main execution function
 */
function main() {
  const { command, args, env } = buildPlaywrightCommand();

  // Log the command being executed for transparency
  console.log(`🎭 Running Playwright tests:`);
  console.log(`   Environment: ${targetEnv}`);
  console.log(`   Tags: ${testTags || '(all tests)'}`);
  console.log(`   Command: ${command} ${args.join(' ')}`);
  console.log('');

  // Validate that we're in the right directory
  if (!existsSync('playwright.config.ts')) {
    console.error(
      '❌ Error: playwright.config.ts not found. Please run this script from the project root.',
    );
    process.exit(1);
  }

  // Spawn the Playwright process
  const playwrightProcess = spawn(command, args, {
    env,
    stdio: 'inherit', // Pass through all stdio streams
    shell: process.platform === 'win32', // Use shell on Windows
  });

  // Handle process events
  playwrightProcess.on('error', error => {
    console.error(`❌ Failed to start Playwright: ${error.message}`);
    process.exit(1);
  });

  playwrightProcess.on('close', code => {
    const emoji = code === 0 ? '✅' : '❌';
    console.log(`${emoji} Playwright tests completed with exit code: ${code}`);
    process.exit(code);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, terminating Playwright...');
    playwrightProcess.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, terminating Playwright...');
    playwrightProcess.kill('SIGTERM');
  });
}

// Export for testing
module.exports = { buildGrepArgs, buildPlaywrightCommand };

// Run if called directly
if (require.main === module) {
  main();
}
