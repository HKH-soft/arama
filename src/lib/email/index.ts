import { Resend } from "resend";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured — skipping email");
    return false;
  }
  try {
    const resend = getResend();
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@arama.app",
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log("Email sent:", data.data!.id);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}
