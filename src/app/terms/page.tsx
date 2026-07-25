import { Metadata } from "next";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "شرایط استفاده | آراما",
  description: "شرایط و قوانین استفاده از خدمات و پلتفرم آراما.",
};

export default function TermsPage() {
  return (
    <AppShell>
      <main className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8">
        <h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl">شرایط استفاده</h1>
        
        <div className="mt-10 space-y-8 text-sm leading-8 text-soft sm:text-base">
          <section>
            <h2 className="text-xl font-black text-ink mb-3">۱. پذیرش شرایط</h2>
            <p>
              با ایجاد حساب کاربری و استفاده از خدمات آراما، شما موافقت خود را با تمامی شرایط و قوانین مندرج در این صفحه اعلام می‌کنید. اگر با هر یک از این شرایط موافق نیستید، مجاز به استفاده از پلتفرم نخواهید بود.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-ink mb-3">۲. ماهیت خدمات (تکذیب‌نامه پزشکی)</h2>
            <p className="text-danger font-medium">
              آراما یک ابزار پشتیبانی سلامت روان است و به هیچ عنوان جایگزین خدمات روانپزشکی، روان‌درمانی یا اورژانس پزشکی نمی‌شود. در صورت داشتن افکار آسیب به خود یا دیگران، استفاده از این پلتفرم متوقف شده و لطفاً بلافاصله با شماره‌های اورژانس (مثل ۱۲۳) تماس بگیرید.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-ink mb-3">۳. حساب کاربری</h2>
            <p>
              شما موظف هستید اطلاعات صحیح وارد کنید. مسئولیت حفظ امنیت حساب و کد ورود یک‌بارمصرف بر عهده شماست. آراما حق دارد در صورت مشاهده فعالیت‌های غیرقانونی یا نقض قوانین، حساب کاربری را بدون اطلاع قبلی مسدود کند.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-ink mb-3">۴. پرداخت و اشتراک</h2>
            <p>
              هزینه‌های پرداخت‌شده برای اشتراک غیرقابل استرداد هستند، مگر اینکه به دلیل نقص فنی مستند در سیستم ما خدمات ارائه نشده باشد. اشتراک‌ها برای استفاده فردی است و فروش مجدد حساب کاربری مجاز نیست.
            </p>
          </section>
        </div>
      </main>
    </AppShell>
  );
}
