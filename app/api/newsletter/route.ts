import { NextResponse } from "next/server";
import { getResendClient, RESEND_TO_EMAIL, RESEND_FROM_EMAIL } from "@/lib/resend";
import { newsletterSignupEmail, newsletterWelcomeEmail } from "@/lib/email-templates";
import { isValidEmail, sanitizeEmail } from "@/lib/contact-input";
import { createRateLimitKey, enforceRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rateLimited = enforceRateLimit({
    key: createRateLimitKey(request, "api-newsletter"),
    limit: 5,
    windowMs: 60_000,
  });
  if (rateLimited) return rateLimited;

  let resend;
  try {
    resend = getResendClient();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Resend not configured.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  let body: { email?: string };
  try {
    body = (await request.json()) as { email?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = sanitizeEmail(typeof body.email === "string" ? body.email : "");
  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const internalHtml = newsletterSignupEmail({ email });
  const welcomeHtml = newsletterWelcomeEmail({ email });

  let internalResult: Awaited<ReturnType<typeof resend.emails.send>>;
  let welcomeResult: Awaited<ReturnType<typeof resend.emails.send>>;
  try {
    [internalResult, welcomeResult] = await Promise.all([
      resend.emails.send({
        from: RESEND_FROM_EMAIL,
        to: RESEND_TO_EMAIL,
        replyTo: email,
        subject: `[LUPFR] Newsletter signup – ${email}`,
        html: internalHtml,
      }),
      resend.emails.send({
        from: RESEND_FROM_EMAIL,
        to: email,
        subject: "You're on the list – LUPFR Entertainment",
        html: welcomeHtml,
      }),
    ]);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  if (internalResult.error) {
    return NextResponse.json(
      { error: internalResult.error.message ?? "Failed to send" },
      { status: 502 }
    );
  }
  if (welcomeResult.error) {
    return NextResponse.json(
      { error: welcomeResult.error.message ?? "Failed to send welcome email" },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true, id: internalResult.data?.id });
}
