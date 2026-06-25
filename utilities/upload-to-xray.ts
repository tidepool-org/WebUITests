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
// Import the constant from its side-effect-free module, NOT from create-execution.ts:
// importing create-execution.ts runs its top-level main(), which would create a second
// (duplicate, blank) frontload execution inside this upload job.
import { EXEC_KEY_FILE } from './exec-key-file';

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

  // If the pre-run frontload step created an execution, import results INTO it; otherwise
  // the reporter auto-creates a fresh one and links it to the trigger ticket.
  if (!process.env.XRAY_TARGET_EXECUTION && fs.existsSync(EXEC_KEY_FILE)) {
    const key = fs.readFileSync(EXEC_KEY_FILE, 'utf8').trim();
    if (key) {
      process.env.XRAY_TARGET_EXECUTION = key;
      console.log(`ℹ️ Importing results into pre-created (frontload) execution ${key}.`);
    }
  }

  if (!fs.existsSync(jsonPath)) {
    throw new Error(
      `Merged results not found at "${jsonPath}". Did the merge-reports step run and produce it?`,
    );
  }

  const reporter = new XrayJsonReporter();
  const automatedExecKey = await reporter.processAndUpload(jsonPath);

  // SOP: on a Jira-triggered CI run that had failures, create a separate "Manual Confirmation"
  // execution containing just the failed tests (status TO DO, no results), linked to the
  // automated execution. Guarded by CIRCLECI so it NEVER runs for a local execution. Non-fatal
  // — the results upload above already succeeded and decides the verdict.
  if (process.env.CIRCLECI && automatedExecKey) {
    try {
      const failedTitles = await reporter.getFailedTestTitles(jsonPath);
      if (failedTitles.length > 0) {
        console.log(
          `ℹ️ ${failedTitles.length} failed test(s) — creating a Manual Confirmation execution for ${automatedExecKey}.`,
        );
        const confirmKey = await reporter.createManualConfirmationExecution(
          failedTitles,
          automatedExecKey,
          // The issue under test that triggered the automation — link the manual confirmation
          // to it too (discovered from this execution key's "Test" link).
          execKey,
        );
        if (confirmKey) {
          console.log(
            `✅ Manual Confirmation execution ${confirmKey} created and linked to automated execution ${automatedExecKey} and the triggering ticket.`,
          );
        }
      } else {
        console.log('ℹ️ No failed tests — skipping Manual Confirmation execution.');
      }
    } catch (error) {
      console.error(
        `⚠️ Could not create the Manual Confirmation execution (non-fatal): ${(error as Error).message}`,
      );
    }
  }
}

// Fail the CI job (non-zero exit) on any upload error, without process.exit().
main().catch(error => {
  console.error(`❌ Xray upload failed: ${(error as Error).message}`);
  process.exitCode = 1;
});
