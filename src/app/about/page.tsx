import { Metadata } from "next";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "دربارهٔ ما | آراما",
  description: "داستان شکل‌گیری آراما و ماموریت ما برای بهبود سلامت روان.",
};

export default function AboutPage() {
  return (
    <AppShell>
      <main className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8">
        <h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl">دربارهٔ آراما</h1>
        
        <div className="mt-10 space-y-8 text-sm leading-8 text-soft sm:text-base">
          <section>
            <h2 className="text-xl font-black text-ink mb-3">داستان ما</h2>
            <p>
              آراما از یک نیاز ساده اما عمیق متولد شد: نیاز به شنیده شدن در لحظاتی که هیچ‌کس دیگری در دسترس نیست. ما باور داریم که مراقبت از سلامت روان نباید یک کالای لوکس یا یک پروسه پیچیده باشد. در دنیای پرشتاب امروز، دسترسی به یک فضای امن، بدون قضاوت و همیشه بیدار، حق هر انسانی است.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-ink mb-3">ماموریت آراما</h2>
            <p>
              ماموریت ما در آراما این است که تکنولوژی را با همدلی ترکیب کنیم. ما می‌خواهیم با ارائه ابزارهای مبتنی بر روان‌شناسی (مانند ذهن‌آگاهی، ردیابی خلق‌وخو و تکنیک‌های CBT)، به شما کمک کنیم تا احساسات خود را بهتر بشناسید، استرس روزمره را مدیریت کنید و قدم‌های کوچکی برای حالِ بهتر بردارید.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-ink mb-3">تعهد به امنیت و حریم خصوصی</h2>
            <p>
              صحبت‌های شما با آراما کاملاً محرمانه است. ما می‌دانیم که اعتماد، پایه و اساس هر رابطه درمانی یا حمایتی است. به همین دلیل، امنیت داده‌ها و حفظ حریم شخصی کاربران برای ما در بالاترین اولویت قرار دارد.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-ink mb-3">آراما جایگزین درمانگر نیست</h2>
            <p>
              با وجود تمام قابلیت‌های هوشمند، آراما هرگز نمی‌تواند و نمی‌خواهد جایگزین ارتباط عمیق انسانی و تخصص یک روان‌درمانگر حرفه‌ای شود. ما اینجا هستیم تا در فاصله بین جلسات تراپی، یا برای کسانی که به حمایت‌های اولیه نیاز دارند، یک پل ارتباطی و یک جعبه‌ابزار کمکی باشیم.
            </p>
          </section>
        </div>
      </main>
    </AppShell>
  );
}
