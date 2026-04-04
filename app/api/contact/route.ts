import { NextResponse } from "next/server";
import { getResendClient, CONTACT_FORM_TO_EMAIL, RESEND_FROM_EMAIL } from "@/lib/resend";
import { contactFormEmail } from "@/lib/email-templates";

export interface ContactBody {
  inquiryType: string;
  name: string;
  email: string;
  company?: string;
  budget?: string;
  message: string;
}

export async function POST(request: Request) {
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

  const { inquiryType, name, email, company, budget, message } = body;
  if (!inquiryType?.trim() || !name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: "Missing required fields: inquiryType, name, email, message" },
      { status: 400 }
    );
  }

  const html = contactFormEmail({
    inquiryType,
    name,
    email,
    company,
    budget,
    message,
  });

  const { data, error } = await resend.emails.send({
    from: RESEND_FROM_EMAIL,
    to: CONTACT_FORM_TO_EMAIL,
    replyTo: email,
    subject: `[LUPFR] ${inquiryType} – ${name}`,
    html,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message ?? "Failed to send email" },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true, id: data?.id });
}
