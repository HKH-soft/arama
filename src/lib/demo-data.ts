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
  {
    title: "جنگل بعد از باران",
    category: "خواب",
    durationSeconds: 60,
    coverArt: "/images/blog-sleep.jpg",
    audioUrl: "/audio/forest-ambience.wav",
    description: "صدای آرام جنگل و باران برای خاموش‌کردن چراغ‌های ذهن.",
  },
  {
    title: "زنگِ حضور",
    category: "تمرکز",
    durationSeconds: 30,
    coverArt: "/images/blog-meditation.jpg",
    audioUrl: "/audio/bell-vibrant.wav",
    description: "یک صدای کشیده و گرم برای برگشتن به همین لحظه.",
  },
  {
    title: "تنفس کنار آب",
    category: "کاهش اضطراب",
    durationSeconds: 45,
    coverArt: "/images/blog-selftalk.jpg",
    audioUrl: "/audio/ocean-calm.wav",
    description: "چند دقیقه همراهی با ریتم طبیعت برای وقتی که ضربان قلب بالاست.",
  },
  {
    title: "شروعِ یک نفس",
    category: "تنفس",
    durationSeconds: 20,
    coverArt: "/images/blog-meditation.jpg",
    audioUrl: "/audio/breath-guide.wav",
    description: "یک زنگ آغاز و پایان برای تمرین تنفس کوتاه روزانه.",
  },
  {
    title: "شبِ امن",
    category: "خواب",
    durationSeconds: 50,
    coverArt: "/images/blog-sleep.jpg",
    audioUrl: "/audio/night-safe.wav",
    description: "فضایی نرم برای جداشدن از شلوغی روز و آماده‌شدن برای خواب.",
  },
  {
    title: "فقط همین قدم",
    category: "کاهش اضطراب",
    durationSeconds: 25,
    coverArt: "/images/blog-selftalk.jpg",
    audioUrl: "/audio/step-pause.wav",
    description: "یک مکث کوتاه برای پیدا کردن کوچک‌ترین قدمِ قابل انجام.",
  },
  {
    title: "خواب عمیق در طبیعت",
    category: "خواب",
    durationSeconds: 120,
    coverArt: "/images/blog-sleep.jpg",
    audioUrl: "/audio/forest-ambience.wav",
    description: "تلفیق صدای باد در درختان و جریان ملایم آب برای یک خواب عمیق.",
  },
  {
    title: "رهایی از تنش‌های روزانه",
    category: "کاهش اضطراب",
    durationSeconds: 90,
    coverArt: "/images/blog-selftalk.jpg",
    audioUrl: "/audio/step-pause.wav",
    description: "تمرینی برای رها کردن گرفتگی‌های عضلانی و ذهنی پس از یک روز سخت.",
  },
  {
    title: "تمرکز بر جریان تنفس",
    category: "تنفس",
    durationSeconds: 60,
    coverArt: "/images/blog-meditation.jpg",
    audioUrl: "/audio/breath-guide.wav",
    description: "یک راهنمای ساده برای دنبال کردن مسیر هوا در بدن.",
  },
  {
    title: "موج‌های آرام اقیانوس",
    category: "خواب",
    durationSeconds: 180,
    coverArt: "/images/blog-sleep.jpg",
    audioUrl: "/audio/ocean-calm.wav",
    description: "صدای پیوسته و آرام‌بخش امواج برای غرق شدن در خواب.",
  },
  {
    title: "مدیتیشن صبحگاهی",
    category: "تمرکز",
    durationSeconds: 120,
    coverArt: "/images/blog-meditation.jpg",
    audioUrl: "/audio/bell-vibrant.wav",
    description: "تنظیم نیت روزانه و جمع کردن حواس برای شروع یک روز پربار.",
  },
  {
    title: "عبور از افکار مزاحم",
    category: "کاهش اضطراب",
    durationSeconds: 75,
    coverArt: "/images/blog-selftalk.jpg",
    audioUrl: "/audio/step-pause.wav",
    description: "چگونه افکار را مانند ابرهای آسمان تماشا کنیم و اجازه دهیم عبور کنند.",
  },
  {
    title: "تنفس جعبه‌ای (Box Breathing)",
    category: "تنفس",
    durationSeconds: 40,
    coverArt: "/images/blog-meditation.jpg",
    audioUrl: "/audio/breath-guide.wav",
    description: "تکنیک ۴-۴-۴-۴ برای تنظیم سریع سیستم عصبی در مواقع بحرانی.",
  },
  {
    title: "صدای باران پشت پنجره",
    category: "خواب",
    durationSeconds: 240,
    coverArt: "/images/blog-sleep.jpg",
    audioUrl: "/audio/forest-ambience.wav",
    description: "صدای برخورد قطرات باران به شیشه برای ایجاد حس امنیت و خواب.",
  },
  {
    title: "آرامش در محل کار",
    category: "تمرکز",
    durationSeconds: 50,
    coverArt: "/images/blog-meditation.jpg",
    audioUrl: "/audio/bell-vibrant.wav",
    description: "یک مکث کوتاه بین جلسات کاری برای بازیابی تمرکز و انرژی.",
  },
  {
    title: "رها کردن کنترل",
    category: "کاهش اضطراب",
    durationSeconds: 80,
    coverArt: "/images/blog-selftalk.jpg",
    audioUrl: "/audio/step-pause.wav",
    description: "تمرینی برای پذیرش چیزهایی که در کنترل ما نیستند.",
  },
  {
    title: "اسکن بدن قبل از خواب",
    category: "خواب",
    durationSeconds: 150,
    coverArt: "/images/blog-sleep.jpg",
    audioUrl: "/audio/night-safe.wav",
    description: "آرام کردن تک‌تک اعضای بدن از نوک پا تا سر برای خوابی راحت.",
  },
  {
    title: "تنفس برای کاهش ضربان قلب",
    category: "تنفس",
    durationSeconds: 45,
    coverArt: "/images/blog-meditation.jpg",
    audioUrl: "/audio/breath-guide.wav",
    description: "تکنیک بازدم‌های طولانی‌تر از دم برای آرام‌سازی فوری.",
  },
  {
    title: "تمرکز بر یک نقطه",
    category: "تمرکز",
    durationSeconds: 60,
    coverArt: "/images/blog-meditation.jpg",
    audioUrl: "/audio/bell-vibrant.wav",
    description: "تمرین تمرکز تک‌نقطه‌ای (Trataka) برای جلوگیری از حواس‌پرتی.",
  },
  {
    title: "صدای سوختن هیزم",
    category: "خواب",
    durationSeconds: 200,
    coverArt: "/images/blog-sleep.jpg",
    audioUrl: "/audio/night-safe.wav",
    description: "حس گرمای آتش و صدای ترق‌وتروق چوب در یک کلبه زمستانی.",
  },
  {
    title: "پذیرش احساسات",
    category: "کاهش اضطراب",
    durationSeconds: 85,
    coverArt: "/images/blog-selftalk.jpg",
    audioUrl: "/audio/step-pause.wav",
    description: "ایجاد فضای امن درونی برای تجربه کردن احساساتِ سخت بدون قضاوت.",
  },
  {
    title: "بازگشت به لحظه حال",
    category: "تمرکز",
    durationSeconds: 35,
    coverArt: "/images/blog-meditation.jpg",
    audioUrl: "/audio/bell-vibrant.wav",
    description: "استفاده از حواس پنج‌گانه برای خروج از گذشته و آینده.",
  },
  {
    title: "تنفس عمیق شکمی",
    category: "تنفس",
    durationSeconds: 55,
    coverArt: "/images/blog-meditation.jpg",
    audioUrl: "/audio/breath-guide.wav",
    description: "تنفس دیافراگمی برای اکسیژن‌رسانی بهتر به مغز و کاهش استرس.",
  },
  {
    title: "قطار شبانه",
    category: "خواب",
    durationSeconds: 180,
    coverArt: "/images/blog-sleep.jpg",
    audioUrl: "/audio/night-safe.wav",
    description: "ریتم یکنواخت و آرام‌بخش حرکت قطار برای مسافرت به دنیای خواب.",
  },
  {
    title: "آرامش قبل از مصاحبه",
    category: "کاهش اضطراب",
    durationSeconds: 40,
    coverArt: "/images/blog-selftalk.jpg",
    audioUrl: "/audio/step-pause.wav",
    description: "یک فایل صوتی سریع برای افزایش اعتمادبه‌نفس پیش از رویدادهای مهم.",
  },
  {
    title: "جریان ملایم رودخانه",
    category: "تمرکز",
    durationSeconds: 110,
    coverArt: "/images/blog-meditation.jpg",
    audioUrl: "/audio/ocean-calm.wav",
    description: "صدای آب روان برای مسدود کردن صداهای مزاحم محیطی هنگام کار.",
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
    id: "free",
    name: "شروع آرام",
    price: 0,
    unit: "رایگان",
    period: "برای همیشه",
    description: "برای آشنایی با آراما و ساختن عادت روزانهٔ توجه به خود.",
    cta: "شروع رایگان",
    featured: false,
    features: ["۱۰ گفتگوی هوش مصنوعی در ماه", "چک‌این روزانهٔ خلق‌وخو", "۳ مدیتیشن و تمرین پایه", "نمودار سادهٔ هفتگی خلق"],
    sortOrder: 1,
  },
  {
    id: "plus",
    name: "آرامش پلاس",
    price: 98000,
    unit: "تومان / ماه",
    period: "با پرداخت سالانه: دو ماه هدیه",
    description: "همراهی کامل و نامحدود برای روزهایی که بیشتر به آرامش نیاز داری.",
    cta: "شروع آرامش پلاس",
    featured: true,
    features: ["گفتگوی نامحدود با آراما", "کتابخانهٔ کامل مدیتیشن و تمرین‌ها", "گزارش هفتگی رشد و الگوهای خلق", "یادآورهای مهربانانهٔ چک‌این", "پشتیبانی اولویت‌دار انسانی"],
    sortOrder: 2,
  },
  {
    id: "pro",
    name: "آرامش حرفه‌ای",
    price: 214000,
    unit: "تومان / ماه",
    period: "با پرداخت سالانه: دو ماه هدیه",
    description: "عمیق‌ترین تجربهٔ آراما، با برنامهٔ شخصی و تحلیل ماهانه.",
    cta: "انتخاب حرفه‌ای",
    featured: false,
    features: ["همهٔ امکانات آرامش پلاس", "برنامهٔ درمانی شخصی‌سازی‌شده", "تحلیل عمیق ماهانهٔ روند روانی", "گفتگوی صوتی زنده با آراما", "دسترسی به کارگاه‌های اختصاصی"],
    sortOrder: 3,
  },
];

export async function ensurePlans() {
  const existing = await db.select({ id: plans.id }).from(plans).limit(1);
  if (existing.length === 0) {
    await db.insert(plans).values(demoPlans);
  }
}

export async function ensureMeditationTracks() {
  const existing = await db.select({ id: meditationTracks.id }).from(meditationTracks);
  if (existing.length < demoTracks.length) {
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
