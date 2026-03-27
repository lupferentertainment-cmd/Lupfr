import { Resend } from "resend";

/** Recipient for all site emails (contact, newsletter). Use env to override; defaults to events inbox. */
export const RESEND_TO_EMAIL =
  (typeof process !== "undefined" && process.env.RESEND_TO_EMAIL?.trim()) ||
  "will@lupfr.com";

/** Sender: verified lupfr.com domain. */
export const RESEND_FROM_EMAIL = "LUPFR Entertainment <hello@lupfr.com>";

function getApiKey(): string | undefined {
  return process.env.RESEND_API_KEY?.trim();
}

function getClient(): Resend {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not set. Add it to .env.local (e.g. RESEND_API_KEY=re_xxxxxxxxx) with your real Resend API key."
    );
  }
  return new Resend(apiKey);
}

/**
 * Single Resend client for the request. Use in API routes only.
 * Throws if RESEND_API_KEY is missing.
 */
export function getResendClient(): Resend {
  return getClient();
}

/**
 * Check whether Resend is configured (for conditional UI or error messages).
 */
export function isResendConfigured(): boolean {
  return Boolean(getApiKey());
}
