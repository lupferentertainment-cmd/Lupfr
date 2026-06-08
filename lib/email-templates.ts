/**
 * LUPFR-branded email templates. Black + metallic gold aesthetic.
 * Inline styles and table layout for broad client support.
 */

const BRAND = {
  bg: "#0d0d12",
  card: "#141419",
  border: "#2a2a2e",
  gold: "#c9b45c",
  goldMuted: "#8a753c",
  text: "#f5f5f4",
  muted: "#a1a1a0",
  fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
} as const;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapLayout(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0; padding:0; background-color:${BRAND.bg}; font-family:${BRAND.fontFamily}; color:${BRAND.text}; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.bg}; min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
          <tr>
            <td style="padding-bottom:24px; border-bottom:1px solid ${BRAND.border};">
              <span style="font-size:11px; letter-spacing:0.25em; text-transform:uppercase; color:${BRAND.gold};">LUPFR Entertainment</span>
            </td>
          </tr>
          <tr>
            <td style="padding-top:32px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding-top:40px; border-top:1px solid ${BRAND.border}; font-size:12px; color:${BRAND.muted};">
              SF &amp; LA · Music events &amp; talent
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:8px 0 4px; font-size:12px; color:${BRAND.muted}; text-transform:uppercase; letter-spacing:0.05em;">${escapeHtml(label)}</td>
    </tr>
    <tr>
      <td style="padding:0 0 16px; font-size:15px; color:${BRAND.text}; line-height:1.5;">${escapeHtml(value)}</td>
    </tr>`;
}

/** Contact form submission – internal notification to team */
export function contactFormEmail(params: {
  inquiryType: string;
  name: string;
  email: string;
  company?: string;
  budget?: string;
  message: string;
}): string {
  const { inquiryType, name, email, company, budget, message } = params;
  const content = `
    <h1 style="margin:0 0 24px; font-size:22px; font-weight:600; color:${BRAND.text}; letter-spacing:-0.02em;">
      New inquiry
    </h1>
    <p style="margin:0 0 24px; font-size:14px; color:${BRAND.muted};">
      Someone reached out via the contact form.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.card}; border:1px solid ${BRAND.border}; border-radius:8px; padding:24px;">
      <tr><td>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${row("Inquiry type", inquiryType)}
          ${row("Name", name)}
          ${row("Email", email)}
          ${company ? row("Company / Venue", company) : ""}
          ${budget ? row("Budget", budget) : ""}
          <tr>
            <td style="padding:8px 0 4px; font-size:12px; color:${BRAND.muted}; text-transform:uppercase; letter-spacing:0.05em;">Message</td>
          </tr>
          <tr>
            <td style="padding:0; font-size:15px; color:${BRAND.text}; line-height:1.6; white-space:pre-wrap;">${escapeHtml(message)}</td>
          </tr>
        </table>
      </td></tr>
    </table>
    <p style="margin:20px 0 0; font-size:13px; color:${BRAND.muted};">
      Reply directly to this email to respond to ${escapeHtml(name)}.
    </p>`;
  return wrapLayout(content, `Inquiry: ${inquiryType}`);
}

/** Newsletter signup – internal notification to team */
export function newsletterSignupEmail(params: { email: string }): string {
  const { email } = params;
  const content = `
    <h1 style="margin:0 0 24px; font-size:22px; font-weight:600; color:${BRAND.text}; letter-spacing:-0.02em;">
      Newsletter signup
    </h1>
    <p style="margin:0 0 24px; font-size:14px; color:${BRAND.muted};">
      New signup from the footer &quot;Stay in the loop&quot; form.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.card}; border:1px solid ${BRAND.border}; border-radius:8px;">
      <tr><td style="padding:24px;">
        ${row("Email", email)}
      </td></tr>
    </table>`;
  return wrapLayout(content, "Newsletter signup");
}

/** Welcome email sent to the subscriber after they join the list */
export function newsletterWelcomeEmail(params: { email: string }): string {
  const content = `
    <h1 style="margin:0 0 24px; font-size:22px; font-weight:600; color:${BRAND.text}; letter-spacing:-0.02em;">
      You're on the list
    </h1>
    <p style="margin:0 0 16px; font-size:15px; color:${BRAND.text}; line-height:1.6;">
      Thanks for signing up. We'll notify you about upcoming events and exclusive presales.
    </p>
    <p style="margin:0; font-size:14px; color:${BRAND.muted}; line-height:1.6;">
      Stay tuned — LUPFR Entertainment
    </p>`;
  return wrapLayout(content, "You're on the list – LUPFR Entertainment");
}
