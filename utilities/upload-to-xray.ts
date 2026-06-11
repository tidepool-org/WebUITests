/**
 * Standalone Xray uploader for the CI "merge and upload" job.
 *
 * Test shards run with XRAY_DEFER_UPLOAD=true so no shard uploads on its own. Their
 * Playwright blob reports are merged into a single JSON (`npm run merge-reports`),
 * and this script performs ONE sequential upload to Xray. This avoids the concurrent
 * per-shard uploads to the same Test Execution that caused HTTP 500
 * "Internal Application Error" failures.
 *
 * Run via jiti (a devDependency): `jiti utilities/upload-to-xray.ts`
 */
import fs from 'node:fs';
import XrayJsonReporter from './xray-json-reporter';

const DEFAULT_MERGED_PATH = 'test-results/merged.json';

async function main(): Promise<void> {
  const jsonPath = process.argv[2] || DEFAULT_MERGED_PATH;

  // Only upload when an execution is targeted. The Jira Automation flow always passes
  // a real TEST_EXECUTION_KEY; plain commits leave it as 'none', and we skip rather
  // than auto-create a throwaway execution on every build.
  const execKey = process.env.TEST_EXECUTION_KEY;
  if (!execKey || execKey === 'none' || execKey.trim() === '') {
    console.log('ℹ️ No TEST_EXECUTION_KEY provided — skipping Xray upload (nothing to link to).');
    return;
  }

  if (!fs.existsSync(jsonPath)) {
    throw new Error(
      `Merged results not found at "${jsonPath}". Did the merge-reports step run and produce it?`,
    );
  }

  const reporter = new XrayJsonReporter();
  await reporter.processAndUpload(jsonPath);
}

// Fail the CI job (non-zero exit) on any upload error, without process.exit().
main().catch(error => {
  console.error(`❌ Xray upload failed: ${(error as Error).message}`);
  process.exitCode = 1;
});
