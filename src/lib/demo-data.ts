import { db } from "@/db";
import {
  conversations,
  exercises,
  meditationTracks,
  messages,
  moodEntries,
  plans,
  profiles,
  subscriptions,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "./auth-helpers";

export const DEMO_USER_ID = "demo-user";

export const demoTracks = [
  // ── خواب و ریلکسیشن (Sleep & Deep Relaxation) ──
  {
    title: "فرکانس ۴۳۲ هرتز خواب عمیق",
    category: "خواب و ریلکسیشن",
    durationSeconds: 600,
    coverArt: "/images/meditation/night-safe.jpg",
    audioUrl: "/audio/deep-sleep-432hz.wav",
    description: "فرکانس التیام‌بخش ۴۳۲ هرتز به همراه امواج دلتا برای خاموش کردن فعالیت مغز و خواب عمیق.",
  },
  {
    title: "صدای باران ملایم پشت پنجره",
    category: "خواب و ریلکسیشن",
    durationSeconds: 480,
    coverArt: "/images/meditation/forest-ambience.jpg",
    audioUrl: "/audio/rain-window.wav",
    description: "صدای پیوسته و لطیف برخورد قطرات باران به شیشه برای ایجاد حس امنیت و گرما در رختخواب.",
  },
  {
    title: "کلبهٔ چوبی و شومینهٔ هیزمی",
    category: "خواب و ریلکسیشن",
    durationSeconds: 420,
    coverArt: "/images/meditation/night-safe.jpg",
    audioUrl: "/audio/fireplace-cabin.wav",
    description: "ترق‌وتروق آرام سوختن چوب در بخاری هیزمی و فضایی دنج برای رها کردن خستگی روز.",
  },
  {
    title: "قطار شبانه در مسیر خواب",
    category: "خواب و ریلکسیشن",
    durationSeconds: 540,
    coverArt: "/images/meditation/night-safe.jpg",
    audioUrl: "/audio/night-train.wav",
    description: "ریتم یکنواخت، خواب‌آور و هیپنوتیزمی حرکت قطار بر ریل در دل سکوت شب.",
  },
  {
    title: "ریلکسیشن عضلانی پیشرونده (جیکوبسن)",
    category: "خواب و ریلکسیشن",
    durationSeconds: 360,
    coverArt: "/images/meditation/step-pause.jpg",
    audioUrl: "/audio/jacobson-relaxation.wav",
    description: "تکنیک علمی انقباض و رهایش تک‌تک عضلات از نوک پا تا عضلات صورت برای رهایی از تنش شبانه.",
  },

  // ── کاهش اضطراب و پانیک (Anxiety & Panic Relief) ──
  {
    title: "مهار فوری اضطراب حاد و پانیک (SOS)",
    category: "کاهش اضطراب و پانیک",
    durationSeconds: 180,
    coverArt: "/images/meditation/step-pause.jpg",
    audioUrl: "/audio/step-pause.wav",
    description: "راهنمای صوتی سریع برای کاهش ضربان قلب و زمین‌گیری حسی در لحظات هجوم اضطراب شدید.",
  },
  {
    title: "تنفس در ساحل آرام",
    category: "کاهش اضطراب و پانیک",
    durationSeconds: 300,
    coverArt: "/images/meditation/ocean-calm.jpg",
    audioUrl: "/audio/ocean-waves-deep.wav",
    description: "هماهنگ کردن ریتم دم و بازدم با پیش‌روی و پس‌روی امواج عمیق و آرام اقیانوس.",
  },
  {
    title: "رهایی از نشخوار فکری و بار منفی",
    category: "کاهش اضطراب و پانیک",
    durationSeconds: 240,
    coverArt: "/images/meditation/step-pause.jpg",
    audioUrl: "/audio/step-pause.wav",
    description: "تمرین مشاهدهٔ بدون قضاوت افکار و تماشای عبور آن‌ها بدون گیر افتادن در طوفان ذهنی.",
  },
  {
    title: "آرامش قبل از اتفاقات حساس و مصاحبه",
    category: "کاهش اضطراب و پانیک",
    durationSeconds: 200,
    coverArt: "/images/meditation/step-pause.jpg",
    audioUrl: "/audio/step-pause.wav",
    description: "تخلیه بار روانی و تقویت اعتمادبه‌نفس درونی درست پیش از رویدادها و مکالمات مهم کاری و فردی.",
  },
  {
    title: "رها کردن کنترل و پذیرش واقعیت",
    category: "کاهش اضطراب و پانیک",
    durationSeconds: 320,
    coverArt: "/images/meditation/bell-vibrant.jpg",
    audioUrl: "/audio/bell-vibrant.wav",
    description: "پذیرش مرز بین چیزهایی که در توان ماست و مسائلی که باید به جریان زندگی سپرد.",
  },

  // ── تمرکز و مطالعه (Focus, Flow & Study) ──
  {
    title: "نویز قهوه‌ای عمیق برای کار و مطالعه",
    category: "تمرکز و مطالعه",
    durationSeconds: 600,
    coverArt: "/images/meditation/forest-ambience.jpg",
    audioUrl: "/audio/brown-noise-focus.wav",
    description: "طیف صوتی قهوه‌ای (Brown Noise) با فرکانس گرم برای مسدودسازی نویزهای محیطی و تثبیت تمرکز (ADHD Friendly).",
  },
  {
    title: "کاسهٔ تبتی ۵۲۸ هرتز و زنگ حضور",
    category: "تمرکز و مطالعه",
    durationSeconds: 240,
    coverArt: "/images/meditation/bell-vibrant.jpg",
    audioUrl: "/audio/tibetan-singing-bowl.wav",
    description: "پژواک پرطنین کاسه تبتی ۵۲۸ هرتز برای بازگرداندن ذهن پراکنده به نقطهٔ تمرکز در لحظهٔ حال.",
  },
  {
    title: "جنگل بارانی و جریان روان رودخانه",
    category: "تمرکز و مطالعه",
    durationSeconds: 480,
    coverArt: "/images/meditation/forest-ambience.jpg",
    audioUrl: "/audio/forest-birds-stream.wav",
    description: "محیط زندهٔ طبیعت با زمزمهٔ آب و پرندگان دوردست برای غوطه‌وری در مطالعه و پروژه‌های فکری.",
  },
  {
    title: "مکث ذهن‌آگاه در میان کار روزانه",
    category: "تمرکز و مطالعه",
    durationSeconds: 150,
    coverArt: "/images/meditation/bell-vibrant.jpg",
    audioUrl: "/audio/bell-vibrant.wav",
    description: "یک زنگ حضور کوتاه ۵ دقیقه‌ای برای شستن خستگی مغز بین ساعت‌های کاری طولانی.",
  },

  // ── تنفس و ذهن‌آگاهی (Breathing & Mindfulness) ──
  {
    title: "تنفس جعبه‌ای هدایت‌شده (Box 4-4-4-4)",
    category: "تنفس و ذهن‌آگاهی",
    durationSeconds: 240,
    coverArt: "/images/meditation/breath-guide.jpg",
    audioUrl: "/audio/box-breathing-guide.wav",
    description: "تکنیک ۴ ثانیه دم، ۴ ثانیه حبس، ۴ ثانیه بازدم و ۴ ثانیه مکث برای مهار تپش قلب و بازتنظیم مغز.",
  },
  {
    title: "اسکن حسی و ذهن‌آگاهی بدن",
    category: "تنفس و ذهن‌آگاهی",
    durationSeconds: 360,
    coverArt: "/images/meditation/breath-guide.jpg",
    audioUrl: "/audio/body-scan-zen.wav",
    description: "سفر آگاهانه در بدن با هدایت صوتی آرام برای شناسایی و رها کردن انقباض‌های پنهان شانه، گردن و فک.",
  },
  {
    title: "تنفس آرامش‌بخش ۴-۷-۸",
    category: "تنفس و ذهن‌آگاهی",
    durationSeconds: 210,
    coverArt: "/images/meditation/breath-guide.jpg",
    audioUrl: "/audio/breath-guide.wav",
    description: "تکنیک دکتر وایل برای ترشح هورمون‌های آرام‌بخش؛ ۴ ثانیه دم، ۷ ثانیه مکث و ۸ ثانیه بازدم آرام.",
  },
  {
    title: "تنفس عمیق شکمی دیافراگمی",
    category: "تنفس و ذهن‌آگاهی",
    durationSeconds: 180,
    coverArt: "/images/meditation/breath-guide.jpg",
    audioUrl: "/audio/breath-guide.wav",
    description: "فعال‌سازی شاخهٔ پاراسمپاتیک از طریق پر کردن بخش پایینی ریه‌ها و کاهش اضطراب قفسه سینه.",
  },

  // ── شکرگزاری و آرامش (Gratitude & Calm) ──
  {
    title: "مدیتیشن صبحگاهی امواج آلفا (۱۰ هرتز)",
    category: "شکرگزاری و آرامش",
    durationSeconds: 300,
    coverArt: "/images/meditation/bell-vibrant.jpg",
    audioUrl: "/audio/morning-sun-alpha.wav",
    description: "بیدارباش آرام ذهن با فرکانس‌های آلفا و تنظیم قصد و نیت مثبت برای آغاز یک روز سرشار از آرامش.",
  },
  {
    title: "شفقت به خود در لحظات سخت (Self-Compassion)",
    category: "شکرگزاری و آرامش",
    durationSeconds: 360,
    coverArt: "/images/meditation/night-safe.jpg",
    audioUrl: "/audio/body-scan-zen.wav",
    description: "دست کشیدن از سرزنش‌های بی‌رحمانه درونی و تبدیل شدن به امن‌ترین دوست برای خود.",
  },
  {
    title: "لحظهٔ قدردانی و شکرگزاری روزانه",
    category: "شکرگزاری و آرامش",
    durationSeconds: 240,
    coverArt: "/images/meditation/ocean-calm.jpg",
    audioUrl: "/audio/ocean-calm.wav",
    description: "تمرکز بر داشته‌های ساده اما ارزشمند زندگی که در شلوغی و استرس‌های روزمره نادیده گرفته می‌شوند.",
  },
];

export const demoExercises = [
  {
    title: "زمین‌گیری ۵-۴-۳-۲-۱",
    category: "کاهش اضطراب",
    description: "با پنج حس خودت را به اکنون برگردان؛ مخصوص لحظه‌هایی که فکرها تند می‌شوند.",
    durationMinutes: 5,
    difficulty: "آسان",
    iconName: "anchor",
  },
  {
    title: "بازنویسی فکرهای سخت",
    category: "شناختی",
    description: "فکر خودکار را ببین، شواهدش را بررسی کن و یک جملهٔ مهربان‌تر بساز.",
    durationMinutes: 12,
    difficulty: "متوسط",
    iconName: "pen",
  },
  {
    title: "تنفس ۴-۷-۸",
    category: "تنفس",
    description: "ریتم بدن را آرام کن؛ دم چهار، مکث هفت و بازدم هشت ثانیه.",
    durationMinutes: 2,
    difficulty: "آسان",
    iconName: "wind",
  },
  {
    title: "نامه‌ای که نمی‌فرستی",
    category: "خودمراقبتی",
    description: "هرچه نگفته‌ای را بنویس؛ نه برای ارسال، فقط برای سبک‌شدن.",
    durationMinutes: 10,
    difficulty: "آسان",
    iconName: "heart",
  },
  {
    title: "مکث پیش از پاسخ",
    category: "روابط",
    description: "سه مرحلهٔ مکث، نام‌گذاری احساس و انتخاب پاسخ در یک گفتگوی دشوار.",
    durationMinutes: 8,
    difficulty: "متوسط",
    iconName: "pause",
  },
  {
    title: "سه چیز خوب",
    category: "قدردانی",
    description: "سه لحظهٔ کوچکِ امروز را پیدا کن و اجازه بده دیده شوند.",
    durationMinutes: 4,
    difficulty: "آسان",
    iconName: "sparkles",
  },
  {
    title: "تکنیک توقف (S.T.O.P)",
    category: "کاهش اضطراب",
    description: "توقف کن، نفس بکش، مشاهده کن و سپس آگاهانه پیش برو.",
    durationMinutes: 2,
    difficulty: "آسان",
    iconName: "pause",
  },
  {
    title: "در آغوش گرفتن پروانه (EMDR)",
    category: "کاهش اضطراب",
    description: "تکنیک ضربه زدن متناوب به شانه‌ها برای آرام‌سازی سریع سیستم عصبی.",
    durationMinutes: 5,
    difficulty: "متوسط",
    iconName: "heart",
  },
  {
    title: "بازسازی شناختی (CBT)",
    category: "شناختی",
    description: "شناسایی خطاهای فکری (مثل سیاه‌وسفید دیدن) و جایگزینی آن‌ها با افکار واقع‌بینانه.",
    durationMinutes: 15,
    difficulty: "سخت",
    iconName: "brain",
  },
  {
    title: "تجسم مکان امن",
    category: "کاهش اضطراب",
    description: "یک پناهگاه ذهنی با تمام جزئیات حسی بساز تا در مواقع استرس به آن پناه ببری.",
    durationMinutes: 10,
    difficulty: "متوسط",
    iconName: "sun",
  },
  {
    title: "قطب‌نمای ارزش‌ها (ACT)",
    category: "شناختی",
    description: "ارزش‌های اصلی زندگی‌ات را مشخص کن تا در روزهای سخت راهنما و قطب‌نمای تو باشند.",
    durationMinutes: 20,
    difficulty: "سخت",
    iconName: "compass",
  },
  {
    title: "پذیرش رادیکال (DBT)",
    category: "شناختی",
    description: "پذیرش عمیق و کامل واقعیتی که نمی‌توانی تغییر دهی، برای رهایی از رنج مضاعف.",
    durationMinutes: 15,
    difficulty: "سخت",
    iconName: "leaf",
  },
  {
    title: "تخلیه ذهن قبل از خواب",
    category: "خواب",
    description: "نوشتن تمام نگرانی‌ها و کارهای فردا روی کاغذ برای خاموش کردن موتور ذهن.",
    durationMinutes: 10,
    difficulty: "آسان",
    iconName: "moon",
  },
  {
    title: "تنفس لب‌غنچه‌ای",
    category: "تنفس",
    description: "تکنیکی ساده برای تخلیه کامل ریه‌ها و کنترل سریع تنگی نفس ناشی از اضطراب.",
    durationMinutes: 3,
    difficulty: "آسان",
    iconName: "wind",
  },
  {
    title: "ژورنال‌نویسی شکرگزاری",
    category: "قدردانی",
    description: "نوشتن روزانه درباره چیزهایی که بابتشان سپاسگزاری، ذهن را برای دیدن نیمه پر لیوان سیم‌کشی می‌کند.",
    durationMinutes: 10,
    difficulty: "آسان",
    iconName: "coffee",
  },
  {
    title: "نام‌گذاری احساسات",
    category: "شناختی",
    description: "نگاه کردن به احساس به عنوان یک مهمان گذرا: «من الان متوجه حضور حس خشم هستم.»",
    durationMinutes: 5,
    difficulty: "آسان",
    iconName: "eye",
  },
  {
    title: "مهربانی با خود در آینه",
    category: "خودمراقبتی",
    description: "نگاه کردن در چشم‌های خود در آینه و گفتن جملاتی که معمولاً به بهترین دوستت می‌گویی.",
    durationMinutes: 5,
    difficulty: "متوسط",
    iconName: "smile",
  },
  {
    title: "تعیین مرزهای سالم",
    category: "روابط",
    description: "تمرینِ «نه» گفتن بدون عذاب وجدان و محافظت از انرژی روانی در برابر دیگران.",
    durationMinutes: 12,
    difficulty: "سخت",
    iconName: "anchor",
  },
  {
    title: "مدیتیشن اسکن بدن",
    category: "ذهن‌آگاهی",
    description: "سفر ذهنی از نوک پا تا سر برای پیدا کردن و رهاسازی تنش‌های فیزیکی ذخیره‌شده.",
    durationMinutes: 20,
    difficulty: "متوسط",
    iconName: "activity",
  },
  {
    title: "نوشتن جریان سیال ذهن",
    category: "خودمراقبتی",
    description: "نوشتن بی‌وقفه و بدون سانسورِ هر چیزی که در ذهن می‌گذرد (Morning Pages).",
    durationMinutes: 15,
    difficulty: "آسان",
    iconName: "pen",
  },
  {
    title: "سم‌زدایی دیجیتال روزانه",
    category: "خودمراقبتی",
    description: "ایجاد یک ساعتِ بدونِ هیچ‌گونه صفحه نمایش (گوشی، لپ‌تاپ، تلویزیون) برای شارژ مجدد مغز.",
    durationMinutes: 60,
    difficulty: "متوسط",
    iconName: "battery",
  },
];

export const demoPlans = [
  {
    id: "1-month",
    name: "آغاز آرامش (۱ ماهه)",
    price: 335000,
    originalPrice: 390000,
    unit: "تومان",
    period: "ماهانه",
    description: "۳۰ روز مدیتیشن، گفتگو و تمرین‌های آراما",
    dailyEquivalentNote: "معادل روزانه ۱۱,۰۰۰ تومان",
    cta: "شروع ۱ ماهه",
    featured: false,
    isActive: true,
    features: [
      "گفتگوی نامحدود با آراما",
      "کتابخانهٔ کامل مدیتیشن و تمرین‌ها",
      "گزارش هفتگی رشد و الگوهای خلق",
      "یادآورهای مهربانانهٔ چک‌این"
    ],
    sortOrder: 1,
  },
  {
    id: "3-month",
    name: "مسیر آگاهی (۳ ماهه)",
    price: 819000,
    originalPrice: 1275000,
    unit: "تومان",
    period: "۳ ماهه",
    description: "۹۰ روز مدیتیشن، گفتگو و تمرین‌های آراما",
    dailyEquivalentNote: "معادل روزانه ۹,۱۰۰ تومان",
    cta: "شروع ۳ ماهه",
    featured: false,
    isActive: true,
    features: [
      "همهٔ امکانات اشتراک ۱ ماهه",
      "تخفیف ویژهٔ ۳ ماهه",
      "تحلیل عمیق ماهانهٔ روند روانی",
      "پشتیبانی اولویت‌دار"
    ],
    sortOrder: 2,
  },
  {
    id: "1-year",
    name: "تحول درونی (۱ ساله)",
    price: 990000,
    originalPrice: 2185000,
    unit: "تومان",
    period: "سالانه",
    description: "۳۶۵ روز مدیتیشن، گفتگو و تمرین‌های آراما",
    dailyEquivalentNote: "معادل ماهانه ۸۲,۵۰۰ تومان و روزانه فقط ۲,۷۵۰ تومان",
    cta: "شروع ۱ ساله",
    featured: true,
    isActive: true,
    features: [
      "همهٔ امکانات اشتراک ۳ ماهه",
      "بیشترین میزان صرفه‌جویی",
      "دسترسی زودهنگام به امکانات جدید",
      "گفتگوی صوتی زنده با آراما"
    ],
    sortOrder: 3,
  },
];

export async function ensurePlans() {
  await db.update(plans).set({ isActive: false });
  for (const plan of demoPlans) {
    await db
      .insert(plans)
      .values(plan as any)
      .onConflictDoUpdate({
        target: plans.id,
        set: plan as any,
      });
  }
}

export async function ensureMeditationTracks() {
  const existing = await db.select({ id: meditationTracks.id }).from(meditationTracks);
  if (existing.length !== demoTracks.length) {
    await db.delete(meditationTracks);
    await db.insert(meditationTracks).values(demoTracks);
  }
}

export async function ensureExercises() {
  const existing = await db.select({ id: exercises.id }).from(exercises);
  if (existing.length < demoExercises.length) {
    await db.delete(exercises);
    await db.insert(exercises).values(demoExercises);
  }
}

export async function ensurePlansAndTracksAndExercises() {
  await ensurePlans();
  await ensureMeditationTracks();
  await ensureExercises();
}
