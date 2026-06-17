import Link from "next/link";
import { SiInstagram, SiX } from "react-icons/si";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border/40 pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                آ
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">آراما</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6">
              هم‌صحبت امن روزهای سخت. دستیار هوشمند سلامت روان که همیشه در کنار توست.
            </p>
            <div className="flex space-x-4 space-x-reverse">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <SiX className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <SiInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4">محصول</h3>
            <ul className="space-y-2">
              <li><Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">امکانات</Link></li>
              <li><Link href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">قیمت‌گذاری</Link></li>
              <li><Link href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">چطور کار می‌کند</Link></li>
              <li><Link href="/#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">نظرات کاربران</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4">شرکت</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">درباره ما</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">تماس با ما</Link></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">وبلاگ</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">فرصت‌های شغلی</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4">پشتیبانی</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">مرکز راهنما</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">حریم خصوصی</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">شرایط استفاده</a></li>
              <li><Link href="/#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">سوالات متداول</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © ۱۴۰۳ آراما. تمامی حقوق محفوظ است.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            ساخته شده با <span className="text-red-500">♥</span> برای سلامت روان
          </div>
        </div>
      </div>
    </footer>
  );
}
