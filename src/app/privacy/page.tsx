import { Metadata } from "next";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "حریم خصوصی | آراما",
  description: "سیاست حفظ حریم خصوصی آراما و نحوه نگهداری از داده‌های شما.",
};

export default function PrivacyPage() {
  return (
    <AppShell>
      <main className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8">
        <h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl">حریم خصوصی</h1>
        
        <div className="mt-10 space-y-8 text-sm leading-8 text-soft sm:text-base">
          <section>
            <h2 className="text-xl font-black text-ink mb-3">۱. داده‌هایی که جمع‌آوری می‌کنیم</h2>
            <p>
              در آراما، ما به حریم خصوصی شما احترام می‌گذاریم. تنها داده‌هایی که ذخیره می‌کنیم شامل شماره موبایل (برای ورود)، پیام‌های متنی شما در چت، ثبت احساسات روزانه و اطلاعات پایه پروفایل شماست تا بتوانیم تجربه‌ای شخصی‌سازی‌شده و امن به شما ارائه دهیم.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-ink mb-3">۲. اشخاص ثالث و سرویس‌های همکار</h2>
            <p>
              ما برای ارائه خدمات بهتر از سرویس‌های ثالث معتبر استفاده می‌کنیم:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-2 marker:text-brand">
              <li><strong>ملی‌پیامک:</strong> جهت ارسال کدهای ورود یک‌بارمصرف.</li>
              <li><strong>زرین‌پال:</strong> برای پردازش امن پرداخت‌های شما. آراما هیچ‌گونه اطلاعات بانکی را ذخیره نمی‌کند.</li>
              <li><strong>هوش مصنوعی:</strong> پیام‌های شما به‌صورت ناشناس و بدون اتصال به هویت اصلی‌تان برای تحلیل و تولید پاسخ‌های درمانی به ارائه‌دهندگان هوش مصنوعی ارسال می‌شود. هیچ‌یک از این داده‌ها برای آموزش مدل‌های عمومی استفاده نخواهد شد.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-ink mb-3">۳. حقوق شما</h2>
            <p>
              شما مالک داده‌های خود هستید. در هر زمان می‌توانید از طریق صفحه تنظیمات حساب کاربری خود، تمامی تاریخچه چت‌ها یا کل حساب کاربری خود را برای همیشه حذف کنید. این عملیات غیرقابل بازگشت است و تمام سوابق شما از سرورهای ما پاک خواهد شد.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-ink mb-3">۴. هشدار پزشکی</h2>
            <p className="text-faint font-medium">
              آراما جایگزین روانپزشک یا روان‌درمانگر متخصص نیست. در شرایط بحرانی روانی، لطفاً فوراً با اورژانس اجتماعی ۱۲۳ یا مراکز تخصصی تماس بگیرید.
            </p>
          </section>
        </div>
      </main>
    </AppShell>
  );
}
