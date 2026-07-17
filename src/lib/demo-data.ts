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
    durationSeconds: 123,
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
    description: "سه دقیقه همراهی با ریتم طبیعت برای وقتی که ضربان قلب بالاست.",
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
  const existing = await db.select({ id: meditationTracks.id }).from(meditationTracks).limit(1);
  if (existing.length === 0) {
    await db.insert(meditationTracks).values(demoTracks);
  }
}

export async function ensureExercises() {
  const existing = await db.select({ id: exercises.id }).from(exercises).limit(1);
  if (existing.length === 0) {
    await db.insert(exercises).values(demoExercises);
  }
}

export async function ensurePlansAndTracksAndExercises() {
  await ensurePlans();
  await ensureMeditationTracks();
  await ensureExercises();
}
