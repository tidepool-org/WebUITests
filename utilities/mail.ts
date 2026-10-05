// Reads the QA mailbox over IMAP (Google App Password) to pull Keycloak verification
// emails for freshly-created test accounts. All `qa+alias@tidepool.org` plus-aliases
// deliver to the NEW_ACCOUNT_USERNAME mailbox. Uses only imapflow — the raw message
// source is fetched and the verification URL is extracted with a regex (no MIME parser).
import { ImapFlow } from 'imapflow';
import env from './env';

const IMAP_HOST = 'imap.gmail.com';

function mailClient(): ImapFlow {
  const user = env.NEW_ACCOUNT_USERNAME;
  const pass = (env.NEW_ACCOUNT_APP_PASSWORD || '').replace(/\s+/g, ''); // strip display spaces
  if (!user || !pass) {
    throw new Error('Set NEW_ACCOUNT_USERNAME and NEW_ACCOUNT_APP_PASSWORD in .env to read mail.');
  }
  return new ImapFlow({ host: IMAP_HOST, port: 993, secure: true, auth: { user, pass }, logger: false });
}

export interface FindMailOptions {
  /** Recipient alias to match, e.g. `qa+Foo@tidepool.org`. */
  to?: string;
  /** Only match mail whose subject contains this (case-insensitive). */
  subjectContains?: string;
  /** Only match mail whose sender contains this (case-insensitive). */
  fromContains?: string;
  /** Ignore mail older than this many minutes (default 15). */
  sinceMinutes?: number;
  /** Poll up to this long for the mail to arrive (default 60_000 ms). */
  timeoutMs?: number;
  /** Delay between polls (default 3_000 ms). */
  intervalMs?: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Decode the quoted-printable artifacts that break URLs in raw email source: soft line
 * breaks (`=\r\n`), `=3D` for `=`, and HTML `&amp;`. Enough to recover a clickable link.
 */
function unwrapRaw(raw: string): string {
  return raw
    .replace(/=\r?\n/g, '')     // quoted-printable soft line breaks
    .replace(/=3D/gi, '=')      // QP-encoded '='
    .replace(/&amp;/gi, '&');   // HTML-encoded '&'
}

/** All http(s) URLs in a decoded raw message. */
function urlsIn(raw: string): string[] {
  const text = unwrapRaw(raw);
  return text.match(/https?:\/\/[^\s"'<>()]+/gi) ?? [];
}

/**
 * The newest message matching the filters, as decoded raw source — or null if none arrive
 * within the timeout. Polls, so it tolerates the delay before Keycloak's mail lands.
 */
async function findLatestRaw(opts: FindMailOptions): Promise<string | null> {
  const sinceMinutes = opts.sinceMinutes ?? 15;
  const timeoutMs = opts.timeoutMs ?? 60_000;
  const intervalMs = opts.intervalMs ?? 3_000;
  const since = new Date(Date.now() - sinceMinutes * 60_000);

  const client = mailClient();
  await client.connect();
  try {
    const lock = await client.getMailboxLock('INBOX');
    try {
      const deadline = Date.now() + timeoutMs;
      do {
        await client.noop(); // pull server updates (new EXISTS) into this session
        const criteria: Record<string, unknown> = { since };
        if (opts.to) criteria.to = opts.to;
        if (opts.subjectContains) criteria.subject = opts.subjectContains;
        if (opts.fromContains) criteria.from = opts.fromContains;

        const uids = (await client.search(criteria, { uid: true })) || [];
        if (uids.length) {
          // Newest UID wins (UIDs are monotonically increasing).
          const uid = Math.max(...uids);
          const msg = await client.fetchOne(String(uid), { source: true }, { uid: true });
          const src = msg && msg.source ? msg.source.toString('utf8') : '';
          if (src) return src; // original raw; callers decode as needed
        }
        if (Date.now() >= deadline) break;
        await sleep(intervalMs);
      } while (true);
      return null;
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => client.close());
  }
}

/**
 * Fetch the newest Keycloak verification link sent to `alias` (e.g. the `UPDATE_EMAIL`
 * action email). Returns the action-token URL to navigate to. Throws if none arrives.
 */
/** Decode quoted-printable: soft line breaks + `=XX` hex bytes → readable text. */
function decodeQuotedPrintable(s: string): string {
  return s
    .replace(/=\r?\n/g, '')
    .replace(/=([0-9A-Fa-f]{2})/g, (_m, h) => String.fromCharCode(parseInt(h, 16)));
}

/** Best-effort extraction of the text/html body from a raw MIME message (for evidence). */
function htmlPart(raw: string): string | null {
  const idx = raw.search(/Content-Type:\s*text\/html/i);
  if (idx !== -1) {
    const after = raw.slice(idx);
    const bodyStart = after.search(/\r?\n\r?\n/); // headers end at the first blank line
    let body = bodyStart === -1 ? after : after.slice(bodyStart + 2);
    const boundary = body.match(/\r?\n--[^\r\n]+/); // stop at the next MIME boundary
    if (boundary && boundary.index !== undefined) body = body.slice(0, boundary.index);
    return decodeQuotedPrintable(body).trim();
  }
  const m = raw.match(/<html[\s\S]*?<\/html>/i);
  return m ? decodeQuotedPrintable(m[0]).trim() : null;
}

export interface KeycloakEmail {
  /** The action-token verification URL to navigate to. */
  link: string;
  /** The email's HTML body (best-effort), for rendering into report evidence; null if none. */
  html: string | null;
}

/**
 * Fetch the latest Keycloak verification email sent to `alias`: both its action-token link
 * and (best-effort) its HTML body. The HTML lets tests render the received email into an
 * image for reporting, since the email is read over IMAP rather than in the browser.
 */
export async function getLatestKeycloakEmail(
  alias: string,
  opts: FindMailOptions = {},
): Promise<KeycloakEmail> {
  const raw = await findLatestRaw({ to: alias, ...opts });
  if (!raw) {
    throw new Error(`No verification email for ${alias} within ${(opts.timeoutMs ?? 60_000) / 1000}s.`);
  }
  // Keycloak action-token links look like:
  //   https://auth.<env>.tidepool.org/realms/<realm>/login-actions/action-token?key=<JWT>&client_id=...
  const link = urlsIn(raw).find(
    (u) => /login-actions\/action-token/i.test(u) || (/auth\.[^/]*tidepool\.org/i.test(u) && /[?&]key=/.test(u)),
  );
  if (!link) {
    throw new Error(`Found a message for ${alias} but no Keycloak action-token link in it.`);
  }
  return { link, html: htmlPart(raw) };
}

/** Convenience wrapper returning just the verification link. */
export async function getLatestKeycloakVerificationLink(
  alias: string,
  opts: FindMailOptions = {},
): Promise<string> {
  return (await getLatestKeycloakEmail(alias, opts)).link;
}

export interface ClaimEmail {
  /** The email's HTML body (best-effort) — render it and click the invitation button. */
  html: string | null;
  /** Best-effort invitation URL, as a fallback when clicking the rendered anchor isn't viable. */
  link: string | null;
}

/**
 * Fetch the latest clinic custodial-invitation email ("Share Diabetes data with your clinic")
 * sent to `alias`. Unlike the Keycloak verification email this is an app invitation, so there's
 * no action-token link to key on — prefer rendering `html` and clicking the invitation anchor by
 * its visible text; `link` is only a best-effort fallback.
 *
 * ⚠️ WIP: the invitation URL pattern (and the email's subject/sender) are unverified. Confirm on
 * a live env and tighten the `link` match / add subject/from filters once known.
 */
export async function getLatestClaimEmail(
  alias: string,
  opts: FindMailOptions = {},
): Promise<ClaimEmail> {
  const raw = await findLatestRaw({ to: alias, ...opts });
  if (!raw) {
    throw new Error(
      `No clinic invitation email for ${alias} within ${(opts.timeoutMs ?? 60_000) / 1000}s.`,
    );
  }
  // The custodial-claim button links to /login?signupEmail=…&signupKey=…&restrictedTokenId=…
  // Extract from the RAW message (urlsIn) — the HTML body's href is quoted-printable-decoded and
  // mangles the '=' signs, so never click the rendered anchor; navigate this clean link instead.
  const link = urlsIn(raw).find((u) => /[?&]signupKey=/.test(u)) ?? null;
  return { html: htmlPart(raw), link };
}

/** Low-level access for other flows (invitations, claim links, etc.). */
export const _mailInternals = { findLatestRaw, urlsIn, unwrapRaw, htmlPart, decodeQuotedPrintable };
