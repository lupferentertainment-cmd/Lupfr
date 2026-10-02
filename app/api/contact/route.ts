import { NextResponse } from "next/server";
import { getResendClient, CONTACT_FORM_TO_EMAIL, RESEND_FROM_EMAIL } from "@/lib/resend";
import { contactFormEmail } from "@/lib/email-templates";
import { isValidEmail, sanitizeEmail, sanitizeName } from "@/lib/contact-input";
import { createRateLimitKey, enforceRateLimit } from "@/lib/rate-limit";

export interface ContactBody {
  inquiryType: string;
  name: string;
  email: string;
  company?: string;
  budget?: string;
  message: string;
  // "Start Planning" wizard fields (2026-10-02 literal design-file port) —
  // all optional/additive so the pre-wizard required-field contract above
  // (inquiryType/name/email/message) is unchanged.
  phone?: string;
  services?: string[];
  guestCount?: string;
  eventDate?: string;
  flexibleDate?: boolean;
  city?: string;
  venue?: string;
}

export async function POST(request: Request) {
  const rateLimited = enforceRateLimit({
    key: createRateLimitKey(request, "api-contact"),
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

  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const inquiryType = typeof body.inquiryType === "string" ? body.inquiryType.trim() : "";
  const name = sanitizeName(typeof body.name === "string" ? body.name : "");
  const email = sanitizeEmail(typeof body.email === "string" ? body.email : "");
  const company = typeof body.company === "string" ? body.company.trim() : undefined;
  const budget = typeof body.budget === "string" ? body.budget.trim() : undefined;
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() || undefined : undefined;
  const services = Array.isArray(body.services)
    ? body.services.filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    : undefined;
  const guestCount = typeof body.guestCount === "string" ? body.guestCount.trim() || undefined : undefined;
  const eventDate = typeof body.eventDate === "string" ? body.eventDate.trim() || undefined : undefined;
  const flexibleDate = typeof body.flexibleDate === "boolean" ? body.flexibleDate : undefined;
  const city = typeof body.city === "string" ? body.city.trim() || undefined : undefined;
  const venue = typeof body.venue === "string" ? body.venue.trim() || undefined : undefined;

  if (!inquiryType || !name || !email || !message) {
    return NextResponse.json(
      { error: "Missing required fields: inquiryType, name, email, message" },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const html = contactFormEmail({
    inquiryType,
    name,
    email,
    company,
    budget,
    message,
    phone,
    services: services?.length ? services : undefined,
    guestCount,
    eventDate,
    flexibleDate,
    city,
    venue,
  });

  let data: { id?: string } | undefined;
  let sendError: { message?: string } | undefined;
  try {
    const result = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: CONTACT_FORM_TO_EMAIL,
      replyTo: email,
      subject: `[LUPFR] ${inquiryType} – ${name}`,
      html,
    });
    data = result.data ?? undefined;
    sendError = result.error ?? undefined;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  if (sendError) {
    return NextResponse.json(
      { error: sendError.message ?? "Failed to send email" },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true, id: data?.id });
}
