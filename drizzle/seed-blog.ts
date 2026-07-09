import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { drizzle as drizzleNeonHttp } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { blogCategories, blogPosts } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import * as dotenv from "dotenv";

type NodeEnv = "development" | "production" | "test" | "staging";

const nodeEnv: NodeEnv = (process.env.NODE_ENV as NodeEnv) || "development";
let envFileName = ".env";

switch (nodeEnv) {
  case "production":
    envFileName = ".env.production";
    break;
  case "staging":
    envFileName = ".env.staging";
    break;
  case "test":
    envFileName = ".env.test";
    break;
  default:
    envFileName = ".env.local";
}

dotenv.config({ path: ".env" });
dotenv.config({ path: envFileName });

// ── Driver selection ──────────────────────────────────────────
const driver = (process.env.DATABASE_DRIVER || "turso").toLowerCase();

let db: ReturnType<typeof drizzleLibsql>;

if (driver === "neon") {
  const sql = neon(process.env.DATABASE_URL!);
  db = drizzleNeonHttp(sql);
} else {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  db = drizzleLibsql(client);
}

const now = Math.floor(Date.now() / 1000);
const daysAgo = (days: number) => now - days * 24 * 60 * 60;

const categories = [
  {
    name: "سلامت روان",
    slug: "mental-health",
    color: "#10b77f",
    description: "مقاله‌های تخصصی درباره سلامت روان و بهزیستی",
  },
  {
    name: "هوش مصنوعی",
    slug: "ai",
    color: "#6366f1",
    description: "آخرین اخبار و مقالات هوش مصنوعی",
  },
  {
    name: "زندگی سالم",
    slug: "healthy-living",
    color: "#f59e0b",
    description: "نکات و راهکارهای زندگی سالم",
  },
  {
    name: "مدیتیشن",
    slug: "meditation",
    color: "#8b5cf6",
    description: "آموزش و راهنمای مدیتیشن و آرامش ذهن",
  },
];

const posts = [
  {
    title: "چگونه با هوش مصنوعی سلامت روان خود را مدیریت کنیم",
    slug: "ai-mental-health-management",
    excerpt:
      "هوش مصنوعی ابزارهای جدیدی برای مدیریت سلامت روان ارائه می‌دهد. در این مقاله با روش‌های نوین استفاده از AI برای بهبود وضعیت روانی آشنا می‌شوید.",
    content: `<h2>نقش هوش مصنوعی در سلامت روان</h2>
<p>هوش مصنوعی در سال‌های اخیر پیشرفت‌های چشمگیری در حوزه سلامت روان داشته است. از چت‌بات‌های هوشمند گرفته تا ابزارهای تحلیل احساسات، فناوری‌های جدید به افراد کمک می‌کنند تا بهتر وضعیت روانی خود را درک و مدیریت کنند.</p>

<h2>مزایای استفاده از ابزارهای هوش مصنوعی</h2>
<p>استفاده از ابزارهای هوش مصنوعی مزایای متعددی دارد. اول اینکه این ابزارها در دسترس هستند و می‌توانید در هر زمانی از آن‌ها استفاده کنید. دوم اینکه بدون قضاوت به شما گوش می‌دهند و پیشنهادات سازنده ارائه می‌دهند.</p>

<h2>چطور شروع کنیم؟</h2>
<p>شروع کار با ابزارهای هوش مصنوعی برای سلامت روان بسیار ساده است. کافی است یک پلتفرم معتبر مانند آراما را انتخاب کنید و با یک گفتگوی ساده، تجربه مدیریت سلامت روان متفاوتی را تجربه کنید.</p>

<h3>نکات مهم</h3>
<ul>
<li>از ابزارهای هوش مصنوعی به عنوان مکمل مشاوره حرفه‌ای استفاده کنید</li>
<li>اطلاعات خصوصی خود را فقط در پلتفرم‌های معتبر وارد کنید</li>
<li>به صورت منظم از این ابزارها استفاده کنید تا نتایج بهتری بگیرید</li>
</ul>

<blockquote>سلامت روان شما مهم‌ترین سرمایه زندگی شماست. با استفاده از فناوری‌های مدرن، می‌توانید قدم‌های مؤثری در این مسیر بردارید.</blockquote>`,
    authorName: "تیم آراما",
    categorySlug: "ai",
    tags: ["هوش مصنوعی", "سلامت روان", "فناوری"],
    readTime: 8,
    isFeatured: true,
    daysAgo: 2,
  },
  {
    title: "۵ تکنیک ساده برای کاهش اضطراب در زندگی روزمره",
    slug: "anxiety-reduction-techniques",
    excerpt:
      "اضطراب بخش طبیعی زندگی است، اما می‌توان با تکنیک‌های ساده آن را مدیریت کرد. با این پنج روش مؤثر آشنا شوید.",
    content: `<h2>اضطراب و تأثیر آن بر زندگی</h2>
<p>اضطراب یکی از شایع‌ترین مشکلات روانی در دنیای امروز است. شلوغی شهرها، فشار کاری و مشکلات مالی همگی می‌توانند باعث افزایش سطح اضطراب شوند.</p>

<h2>تکنیک اول: تنفس عمیق</h2>
<p>تنفس عمیق یکی از ساده‌ترین و مؤثرترین روش‌ها برای کاهش اضطراب است. با ۴ ثانیه نفس عمیق بکشید، ۴ ثانیه نگه دارید و ۴ ثانیه بازدم کنید. این تکنیک سیستم عصبی پاراسمپاتیک را فعال می‌کند.</p>

<h2>تکنیک دوم: مدیتیشن ذهن آگاه</h2>
<p>مدیتیشن ذهن آگاه به شما کمک می‌کند تا در لحظه حال حضور داشته باشید و از نگرانی‌های بی‌مورد دوری کنید. حتی ۵ دقیقه در روز می‌تواند تأثیر قابل توجهی داشته باشد.</p>

<h2>تکنیک سوم: ورزش منظم</h2>
<p>ورزش منظم باعث ترشح اندورفین می‌شود که به عنوان مسکن طبیعی بدن شناخته می‌شود. پیاده‌روی ۳۰ دقیقه در روز می‌تواند سطح اضطراب را به طور قابل توجهی کاهش دهد.</p>

<h2>تکنیک چهارم: نوشتن روزانه</h2>
<p>نوشتن افکار و احساسات در یک دفترچه می‌تواند به شما کمک کند تا افکار منفی را شناسایی و مدیریت کنید. هر شب قبل از خواب، چند خط درباره روز خود بنویسید.</p>

<h2>تکنیک پنجم: محدود کردن مصرف اخبار</h2>
<p>مصرف بیش از حد اخبار منفی می‌تواند اضطراب را افزایش دهد. زمانی را برای بررسی اخبار تعیین کنید و از شبکه‌های اجتماعی فاصله بگیرید.</p>`,
    authorName: "دکتر سارا احمدی",
    categorySlug: "mental-health",
    tags: ["اضطراب", "سلامت روان", "آرامش"],
    readTime: 6,
    isFeatured: false,
    daysAgo: 5,
  },
  {
    title: "راهنمای کامل مدیتیشن برای مبتدی‌ها",
    slug: "meditation-guide-beginners",
    excerpt:
      "اگر تا به حال مدیتیشن نکرده‌اید، نگران نباشید. این راهنمای قدم‌به‌قدم به شما کمک می‌کند تا از صفر شروع کنید.",
    content: `<h2>مدیتیشن چیست؟</h2>
<p>مدیتیشن تمرین تمرکز ذهن و آگاهی از لحظه حال است. این تمرین هزاران سال است که توسط انسان‌ها انجام می‌شود و امروزه تحقیقات علمی فواید بسیاری از آن را تأیید کرده‌اند.</p>

<h2>چرا مدیتیشن کنیم؟</h2>
<p>تحقیقات نشان داده‌اند که مدیتیشن منظم می‌تواند استرس را کاهش دهد، تمرکز را افزایش دهد، کیفیت خواب را بهبود بخشد و حتی درد مزمن را کاهش دهد.</p>

<h2>قدم اول: آماده‌سازی</h2>
<p>مکانی آرام و راحت پیدا کنید. لباس راحتی بپوشید و تلفن همراه خود را بی‌صدا کنید. زمان اولیه را روی ۵ دقیقه تنظیم کنید.</p>

<h2>قدم دوم: نشستن</h2>
<p>روی زمین یا روی صندلی بنشینید. ستون فقرات خود را صاف نگه دارید اما راحت باشید. دست‌ها را روی زانوها قرار دهید.</p>

<h2>قدم سوم: تنفس</h2>
<p>چشم‌های خود را ببندید و روی تنفس خود تمرکز کنید. فقط نفس‌های خود را بشمارید. وقتی ذهنتان پرت شد، آرام به تنفس برگردید.</p>

<h2>قدم چهارم: تمرین منظم</h2>
<p>هر روز در ساعت مشخصی مدیتیشن کنید. با ۵ دقیقه شروع کنید و به تدریج زمان را افزایش دهید. مهم‌تر از همه، صبور باشید و خودتان را قضاوت نکنید.</p>`,
    authorName: "تیم آراما",
    categorySlug: "meditation",
    tags: ["مدیتیشن", "آرامش", "تمرین"],
    readTime: 7,
    isFeatured: false,
    daysAgo: 7,
  },
  {
    title: "تأثیر خواب بر سلامت روان: چرا ۸ ساعت خواب مهم است",
    slug: "sleep-mental-health",
    excerpt:
      "خواب کافی یکی از ارکان اصلی سلامت روان است. بی‌خوابی مزمن می‌تواند منجر به افسردگی، اضطراب و مشکلات شناختی شود.",
    content: `<h2>رابطه خواب و سلامت روان</h2>
<p>خواب و سلامت روان ارتباط تنگاتنگی با هم دارند. مطالعات نشان داده‌اند که افرادی که خواب کافی (۷ تا ۹ ساعت) دارند، سلامت روان بهتری تجربه می‌کنند.</p>

<h2>عوارض بی‌خوابی</h2>
<p>بی‌خوابی مزمن می‌تواند منجر به مشکلات جدی از جمله افزایش خطر افسردگی، اختلال در تمرکز و حافظه، تضعیف سیستم ایمنی و افزایش خطر ابتلا به بیماری‌های قلبی شود.</p>

<h2>نکاتی برای بهبود کیفیت خواب</h2>
<ul>
<li>ساعت خواب و بیداری ثابتی داشته باشید</li>
<li>از صفحه نمایش‌ها حداقل یک ساعت قبل از خواب دوری کنید</li>
<li>اتاق خواب را تاریک و خنک نگه دارید</li>
<li>از مصرف کافئین بعد از ساعت ۲ عصر خودداری کنید</li>
<li>قبل از خواب مدیتیشن یا تمرینات آرام‌بخش انجام دهید</li>
</ul>

<h2>چطور الگوی خواب خود را بهبود دهیم؟</h2>
<p>شروع کنید با ایجاد یک روتین شبانه. هر شب در ساعت مشخصی به رختخواب بروید و صبح در ساعت مشخصی بیدار شوید. حتی در روزهای تعطیل این روتین را حفظ کنید.</p>`,
    authorName: "دکتر مریم حسینی",
    categorySlug: "healthy-living",
    tags: ["خواب", "سلامت روان", "زندگی سالم"],
    readTime: 5,
    isFeatured: false,
    daysAgo: 10,
  },
  {
    title: "چطور با استرس کاری کنار بیاییم: راهکارهای عملی",
    slug: "workplace-stress-management",
    excerpt:
      "استرس کاری یکی از چالش‌های رایج نیروی کار امروز است. با راهکارهای عملی و مؤثر این مقاله، مدیریت استرس در محیط کار را یاد بگیرید.",
    content: `<h2>شناخت استرس کاری</h2>
<p>استرس کاری زمانی رخ می‌دهد که شرایط شغلی فشار بیش از حدی بر فرد وارد کند. این استرس می‌تواند منجر به فرسودگی شغلی، کاهش بهره‌وری و مشکلات جدی سلامتی شود.</p>

<h2>علائم استرس کاری</h2>
<ul>
<li>خستگی مزمن و بی‌حالی</li>
<li>مشکل در تمرکز</li>
<li>تحلیل رفتن روابط با همکاران</li>
<li>بی‌خوابی یا خواب بیش از حد</li>
<li>سردرد و دردهای فیزیکی</li>
</ul>

<h2>راهکارهای عملی</h2>
<p>اول از همه، مرزهای سالم بین کار و زندگی شخصی ایجاد کنید. بعد از ساعات کاری، ایمیل‌ها و پیام‌های کاری را چک نکنید. دوم، ورزش منظم داشته باشید. سوم، یاد بگیرید «نه» بگویید و بار کاری غیرواقعی را نپذیرید.</p>

<h2>اهمیت گفتگو</h2>
<p>اگر احساس می‌کنید استرس کاری بر زندگی شما تأثیر منفی گذاشته، با مدیر خود یا یک متخصص سلامت روان صحبت کنید. گفتگو درباره مشکلات اولین قدم برای حل آن‌هاست.</p>`,
    authorName: "تیم آراما",
    categorySlug: "mental-health",
    tags: ["استرس", "محیط کار", "سلامت روان"],
    readTime: 6,
    isFeatured: false,
    daysAgo: 14,
  },
  {
    title:
      "نقش تغذیه در سلامت روان: خوراکی‌هایی که خلق و خوی شما را بهتر می‌کنند",
    slug: "nutrition-mental-health",
    excerpt:
      "غذایی که می‌خوریم تأثیر مستقیمی بر خلق و خو و سلامت روان ما دارد. با خوراکی‌های مفید برای روح و روان آشنا شوید.",
    content: `<h2>ارتباط روده و مغز</h2>
<p>تحقیقات جدید نشان می‌دهند که سلامت روده ارتباط مستقیمی با سلامت مغز دارد. روده ما به عنوان «مغز دوم» شناخته می‌شود و باکتری‌های مفید آن بر تولید سروتونین (هورمون شادی) تأثیر می‌گذارند.</p>

<h2>خوراکی‌های مفید</h2>
<ul>
<li><strong>ماهی‌های چرب:</strong> سالمون، ساردین و ماهی تن حاوی امگا ۳ هستند که به کاهش افسردگی کمک می‌کند</li>
<li><strong>مغزیجات:</strong> گردو، بادام و فندق منیزیم دارند که به آرامش اعصاب کمک می‌کند</li>
<li><strong>میوه‌ها و سبزیجات:</strong> موز، اسفناج و بلوبری حاوی آنتی‌اکسیدان‌های مفید برای مغز هستند</li>
<li><strong>غلات کامل:</strong> جو و جو دوسر باعث ثابت نگه داشتن قند خون و بهبود خلق و خو می‌شوند</li>
</ul>

<h2>خوراکی‌های مضر</h2>
<p>شکر تصفیه‌شده، غذاهای فرآوری‌شده و نوشیدنی‌های انرژی‌زا می‌توانند نوسانات خلق و خوی شدیدی ایجاد کنند. بهتر است از این مواد غذایی پرهیز کنید.</p>`,
    authorName: "دکتر نیلوفر رضایی",
    categorySlug: "healthy-living",
    tags: ["تغذیه", "سلامت روان", "زندگی سالم"],
    readTime: 7,
    isFeatured: false,
    daysAgo: 18,
  },
];

async function main() {
  console.log("🌱 Seeding blog data...");

  // Seed categories
  const categoryMap: Record<string, string> = {};

  for (const cat of categories) {
    const existing = await db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.slug, cat.slug));

    if (existing.length === 0) {
      const id = randomUUID();
      await db.insert(blogCategories).values({
        id,
        name: cat.name,
        slug: cat.slug,
        color: cat.color,
        description: cat.description,
        sortOrder: categories.indexOf(cat),
      });
      categoryMap[cat.slug] = id;
      console.log(`  ✅ Category: ${cat.name}`);
    } else {
      categoryMap[cat.slug] = existing[0].id;
      console.log(`  ⏭️  Category already exists: ${cat.name}`);
    }
  }

  // Seed posts
  for (const post of posts) {
    const existing = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, post.slug));

    if (existing.length === 0) {
      await db.insert(blogPosts).values({
        id: randomUUID(),
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        authorName: post.authorName,
        categoryId: categoryMap[post.categorySlug] || null,
        tags: post.tags,
        readTime: post.readTime,
        isPublished: true,
        isFeatured: post.isFeatured,
        viewCount: Math.floor(Math.random() * 500) + 50,
        publishedAt: new Date(daysAgo(post.daysAgo) * 1000),
        createdAt: new Date(daysAgo(post.daysAgo) * 1000),
        updatedAt: new Date(),
      });
      console.log(`  ✅ Post: ${post.title}`);
    } else {
      console.log(`  ⏭️  Post already exists: ${post.title}`);
    }
  }

  console.log("\n🎉 Blog seeding complete!");
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
