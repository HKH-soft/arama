import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
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