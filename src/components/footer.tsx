import Link from "next/link";
import { Camera, Heart, Mail, Phone, Send } from "lucide-react";
import { Logo } from "./logo";

const columns = [
  {
    title: "محصول",
    links: ["گفتگوی هوش مصنوعی", "ردیابی خلق‌وخو", "مدیتیشن و تمرین", "تعرفه‌ها"],
    hrefs: ["/#features", "/#features", "/#features", "/#pricing"],
  },
  {
    title: "آراما",
    links: ["دربارهٔ ما", "مجله آراما", "روایت کاربران", "تماس با ما"],
    hrefs: ["/about", "/magazine", "/#stories", "mailto:support@arama.life"],
  },
  {
    title: "پشتیبانی",
    links: ["حریم خصوصی", "قوانین استفاده", "راهنمای بحران", "ورود به حساب"],
    hrefs: ["/privacy", "/terms", "#crisis", "/login"],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-card/60">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Logo size="md" />
            <p className="mt-5 max-w-xs text-sm leading-7 text-soft">
              آراما، همراه هوشمند سلامت روان؛ ساخته‌شده با عشق در ایران، برای همهٔ فارسی‌زبانانی که به یک هم‌صحبت امن نیاز دارند.
            </p>
            <address className="mt-6 flex items-center gap-2.5 not-italic">
              {[
                { icon: Camera, label: "اینستاگرام آراما", href: "https://instagram.com/arama.life" },
                { icon: Send, label: "تلگرام آراما", href: "https://t.me/arama_life" },
                { icon: Mail, label: "ایمیل پشتیبانی آراما", href: "mailto:support@arama.life" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={s.label}
                  className="grid size-10 place-items-center rounded-full border border-line bg-card text-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:text-brand-ink"
                >
                  <s.icon className="size-4.5" />
                </a>
              ))}
            </address>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((c) => (
              <nav key={c.title} aria-label={c.title}>
                <h3 className="text-sm font-extrabold text-ink">{c.title}</h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {c.links.map((l, i) => {
                    const href = c.hrefs[i];
                    const isInternal = href.startsWith("/") && !href.startsWith("/#");
                    return (
                      <li key={l}>
                        {isInternal ? (
                          <Link
                            href={href}
                            className="text-sm text-soft transition-colors duration-300 hover:text-brand-ink"
                          >
                            {l}
                          </Link>
                        ) : (
                          <a
                            href={href}
                            className="text-sm text-soft transition-colors duration-300 hover:text-brand-ink"
                          >
                            {l}
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* mental health disclaimer */}
        <div id="crisis" className="mt-14 scroll-mt-28 rounded-3xl border border-sand bg-sand-soft/60 p-6 sm:p-7">
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-clay">
            <Phone className="size-4" />
            تو مهم هستی — راهنمای بحران
          </h3>
          <p className="mt-3 text-xs leading-6 text-soft sm:text-[13px] sm:leading-7">
            آراما یک ابزار همراهی و پیشگیری است و جایگزین تشخیص یا درمان تخصصی نیست. اگر تو یا عزیزت در بحران روانی
            حاد، افکار آسیب به خود یا اضطرار هستید، لطفاً همین حالا با
            <strong className="text-ink"> اورژانس اجتماعی ۱۲۳ </strong>،
            <strong className="text-ink"> صدای مشاور ۱۴۸۰ </strong>
            یا نزدیک‌ترین مرکز درمانی تماس بگیرید. تنها نیستید.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8 text-xs text-faint">
          <p>© ۱۴۰۴ آراما · تمامی حقوق محفوظ است.</p>
          <p className="inline-flex items-center gap-1.5">
            ساخته‌شده با
            <Heart className="size-3.5 fill-clay text-clay" />
            برای آرامشِ تو
          </p>
        </div>
      </div>
    </footer>
  );
}
