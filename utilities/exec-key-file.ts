/**
 * Path (relative to the repo root / CI working_directory) where the pre-run
 * `create-execution` step writes the frontload Test Execution key, for the post-run
 * uploader to import results INTO that same execution.
 *
 * This lives in its own module with NO side effects: `create-execution.ts` runs `main()`
 * at import time, so the uploader must NOT import the constant from there — doing so would
 * re-run the entire frontload (creating a duplicate, blank execution) inside the upload job.
 */
export const EXEC_KEY_FILE = 'test-results/created-exec-key.txt';
