import type { Metadata } from "next";
import { PhoneLoginForm } from "@/components/phone-login-form";
import { AuthShell } from "@/components/auth-shell";

export const metadata: Metadata = { title: "ورود" };

export default function LoginPage() {
  return (
    <AuthShell
      title="ورود به آراما"
      subtitle="شماره تلفنت را وارد کن تا کد ورود را برایت پیامک کنیم. امن، سریع، بدون رمز."
      aside={
        <p className="mt-8 border-t border-line pt-6 text-center text-sm text-soft">
          با ورود به آراما،{" "}
          <a href="#" className="font-bold text-brand-ink underline-offset-4 hover:underline">
            قوانین حریم خصوصی
          </a>{" "}
          را می‌پذیری. داده‌هایت محرمانه می‌ماند.
        </p>
      }
    >
      <PhoneLoginForm />
    </AuthShell>
  );
}
