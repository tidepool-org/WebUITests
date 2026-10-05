// Helpers for creating unique, mail-readable test accounts.
//
// New accounts are addressed as plus-aliases of NEW_ACCOUNT_USERNAME
// (e.g. webuiautomation+personal_20261115-141149-321@tidepool.org). Two wins:
//   1. every run gets a distinct address, so created accounts never collide; and
//   2. all plus-aliases deliver to the NEW_ACCOUNT_USERNAME inbox — the one the IMAP
//      reader (utilities/mail.ts) is authenticated against — so their Keycloak
//      verification emails are actually readable.
import env from './env';

/**
 * A compact, sortable, filename-safe timestamp: `YYYYMMDD-HHMMSS-mmm` (local time).
 * ISO-8601 ordered so aliases sort chronologically; ms suffix guards same-second collisions.
 */
export function timestampSlug(d: Date = new Date()): string {
  const p = (n: number, width = 2) => String(n).padStart(width, '0');
  return (
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
    `-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}` +
    `-${p(d.getMilliseconds(), 3)}`
  );
}

/**
 * Build a unique plus-aliased email off NEW_ACCOUNT_USERNAME.
 * @param label short tag for the account's purpose, e.g. 'personal' or 'admin' (sanitized).
 * @returns e.g. `webuiautomation+personal_20261115-141149-321@tidepool.org`
 */
export function newAccountEmail(label = 'newaccount'): string {
  const base = env.NEW_ACCOUNT_USERNAME;
  if (!base || !base.includes('@')) {
    throw new Error('NEW_ACCOUNT_USERNAME must be a full email address to build aliases from.');
  }
  const [local, domain] = base.split('@');
  const safeLabel = label.replace(/[^a-zA-Z0-9]/g, '') || 'newaccount';
  return `${local}+${safeLabel}_${timestampSlug()}@${domain}`;
}
