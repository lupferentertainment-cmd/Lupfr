import { NextResponse } from "next/server";
import { getResendClient, RESEND_TO_EMAIL, RESEND_FROM_EMAIL } from "@/lib/resend";
import { newsletterSignupEmail } from "@/lib/email-templates";

export async function POST(request: Request) {
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

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  const html = newsletterSignupEmail({ email });

  const { data, error } = await resend.emails.send({
    from: RESEND_FROM_EMAIL,
    to: RESEND_TO_EMAIL,
    replyTo: email,
    subject: `[LUPFR] Newsletter signup – ${email}`,
    html,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message ?? "Failed to send" },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true, id: data?.id });
}
