// Hands freshly-created test accounts from prerequisite tests to the tests that depend on
// them, keyed by role. A create-* prerequisite writes its account here (plus a logged-in
// storageState); dependent projects read it and/or load the storageState via `use.storageState`.
//
// This is the "state passing" half of test dependencies — Playwright's project `dependencies`
// guarantee ordering, but the created account's identity has to be shared explicitly.
import fs from 'node:fs';
import path from 'node:path';

export type AccountRole = 'personal' | 'clinician' | 'claimed' | 'shared';

export interface CreatedAccount {
  role: AccountRole;
  email: string;
  password: string;
  /** Path to the logged-in storageState captured right after the account was set up. */
  storageStatePath: string;
}

const RECORD_DIR = 'test-results'; // git-ignored
const recordPath = (role: AccountRole) => path.join(RECORD_DIR, `created-${role}.json`);

/** The storageState path a dependent project should load for a given role. */
export const storageStateFor = (role: AccountRole): string =>
  path.join('tests', '.auth', `created-${role}.json`);

/** Persist a created account so tests that depend on its create-* prerequisite can consume it. */
export function saveAccount(account: CreatedAccount): void {
  fs.mkdirSync(RECORD_DIR, { recursive: true });
  fs.writeFileSync(recordPath(account.role), JSON.stringify(account, null, 2));
}

/** Load the account created by the role's create-* prerequisite. Throws if it hasn't run. */
export function loadAccount(role: AccountRole): CreatedAccount {
  const p = recordPath(role);
  if (!fs.existsSync(p)) {
    throw new Error(`No created ${role} account at ${p} — its create-${role} prerequisite must run first.`);
  }
  return JSON.parse(fs.readFileSync(p, 'utf-8')) as CreatedAccount;
}
