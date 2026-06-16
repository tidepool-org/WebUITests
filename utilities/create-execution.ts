/**
 * Pre-run step (CI): before any tests execute, determine which tests WILL run from the
 * tag filter, pre-create the Xray execution containing those (status TO DO, with their
 * existing step definitions auto-populated by Xray), link it to the triggering ticket,
 * and persist its key so the post-run upload imports results into the SAME execution.
 *
 * New tests (not yet known to Xray) are skipped here and appear with full steps + results
 * after the run. Non-fatal: on any failure we skip, and the post-run upload auto-creates
 * a fresh execution as a fallback.
 *
 * Run via jiti: `jiti utilities/create-execution.ts`
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import XrayJsonReporter from './xray-json-reporter.js';
// NOTE: do not re-export EXEC_KEY_FILE from this module. This file runs main() at import
// time, so any importer must take the constant from './exec-key-file' to avoid kicking off
// a duplicate frontload execution.
import { EXEC_KEY_FILE } from './exec-key-file';

/** Mirror the CI grep logic: TEST_TAGS lowercased + `@`-prefixed, default `@`. */
function resolveGrep(): string {
  const raw = process.env.TEST_TAGS?.trim();
  if (!raw) return '@';
  const lower = raw.toLowerCase();
  return lower.startsWith('@') ? lower : `@${lower}`;
}

/** List the test titles that will run (without running them) via Playwright `--list`.
 *  Note: `playwright test --list` exits non-zero even on success, but still writes the
 *  JSON report to stdout — so we read stdout regardless of the exit status. */
function listTestTitles(grep: string): string[] {
  const res = spawnSync(
    'npx',
    ['playwright', 'test', '--list', '--reporter=json', '--grep', grep, '--grep-invert', '@wip'],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  );
  const out = res.stdout?.trim();
  if (!out) {
    throw new Error(
      `playwright --list produced no output (status ${res.status}): ${(res.stderr || '').slice(0, 300)}`,
    );
  }
  const report = JSON.parse(out) as { suites?: unknown[] };
  const titles: string[] = [];
  const walk = (s: { specs?: Array<{ title?: string }>; suites?: unknown[] }) => {
    (s.specs ?? []).forEach(sp => sp.title && titles.push(sp.title));
    (s.suites ?? []).forEach(child => walk(child as Parameters<typeof walk>[0]));
  };
  (report.suites ?? []).forEach(s => walk(s as Parameters<typeof walk>[0]));
  return titles;
}

async function main(): Promise<void> {
  const originalExecKey = process.env.TEST_EXECUTION_KEY;
  if (!originalExecKey || originalExecKey === 'none' || originalExecKey.trim() === '') {
    console.log('ℹ️ No TEST_EXECUTION_KEY provided — skipping frontload pre-creation.');
    return;
  }

  const grep = resolveGrep();
  console.log(`ℹ️ Listing tests with grep "${grep}" (excluding @wip)...`);
  const titles = listTestTitles(grep);
  console.log(`ℹ️ ${titles.length} test(s) will run.`);
  if (titles.length === 0) return;

  const reporter = new XrayJsonReporter();
  const key = await reporter.createFrontloadExecution(titles, originalExecKey);
  if (key) {
    mkdirSync('test-results', { recursive: true });
    writeFileSync(EXEC_KEY_FILE, key);
    console.log(`✅ Frontload execution ${key} created; wrote ${EXEC_KEY_FILE} for the post-run upload.`);
  } else {
    console.log('ℹ️ No frontload execution created; the post-run upload will auto-create one.');
  }
}

// Non-fatal: never block the pipeline on the pre-create step — the post-run upload
// auto-creates a fresh execution if no key file is present.
main().catch(err => {
  console.error(`⚠️ Frontload pre-create failed (non-fatal): ${(err as Error).message}`);
});
