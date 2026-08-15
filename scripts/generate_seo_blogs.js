const fs = require('fs');
const path = require('path');

const newArticlesData = [
  { slug: "cbt-for-beginners", title: "درمان شناختی-رفتاری (CBT) چیست؟ راهنمای جامع", kws: ["CBT", "درمان شناختی رفتاری", "اضطراب", "افسردگی"] },
  { slug: "how-to-meditate-at-work", title: "چگونه در محیط کار مدیتیشن کنیم؟ ۵ روش ساده", kws: ["مدیتیشن", "محیط کار", "استرس شغلی", "تمرکز"] },
  { slug: "signs-of-burnout", title: "۷ نشانه خاموش فرسودگی شغلی (Burnout) که نباید نادیده بگیرید", kws: ["فرسودگی شغلی", "خستگی مزمن", "استرس", "برن‌اوت"] },
  { slug: "improving-sleep-hygiene", title: "بهداشت خواب: رازهایی برای داشتن خواب عمیق و راحت", kws: ["بهداشت خواب", "بی‌خوابی", "آرامش شبانه", "کیفیت خواب"] },
  { slug: "power-of-journaling", title: "معجزه ژورنال‌نویسی: چگونه نوشتن به سلامت روان کمک می‌کند؟", kws: ["ژورنال‌نویسی", "نوشتن درمانی", "تخلیه ذهن", "خودشناسی"] },
  { slug: "building-self-esteem", title: "چگونه عزت نفس خود را از نو بسازیم؟ تمرین‌های عملی", kws: ["عزت نفس", "اعتماد به نفس", "ارزش فردی", "خوددوستی"] },
  { slug: "managing-panic-attacks", title: "هنگام حمله پانیک (Panic Attack) چه کنیم؟ راهکارهای اورژانسی", kws: ["حمله پانیک", "حمله عصبی", "اضطراب شدید", "تپش قلب"] },
  { slug: "social-media-anxiety", title: "اضطراب شبکه‌های اجتماعی: چگونه مقایسه کردن را متوقف کنیم؟", kws: ["شبکه‌های اجتماعی", "اضطراب مقایسه", "دیتاکس دیجیتال", "اینستاگرام"] },
  { slug: "ai-therapy-future", title: "آینده روان‌درمانی: آیا هوش مصنوعی جایگزین تراپیست می‌شود؟", kws: ["هوش مصنوعی", "روان‌درمانی", "چت‌بات درمانی", "آینده تکنولوژی"] },
  { slug: "healthy-relationships", title: "رازهای داشتن یک رابطه عاطفی سالم و پایدار", kws: ["رابطه عاطفی", "عشق سالم", "ارتباط موثر", "زوج‌درمانی"] },
  { slug: "toxic-positivity", title: "مثبت‌اندیشی سمی چیست و چرا خطرناک است؟", kws: ["مثبت‌اندیشی سمی", "سرکوب احساسات", "روانشناسی زرد", "واقع‌بینی"] },
  { slug: "healing-from-grief", title: "مراحل سوگ: چگونه با فقدان عزیزان کنار بیاییم؟", kws: ["سوگ", "فقدان", "مرگ عزیزان", "درمان سوگ"] },
  { slug: "imposter-syndrome", title: "سندرم ایمپاستر (خودویرانگری): چرا فکر می‌کنیم به اندازه کافی خوب نیستیم؟", kws: ["سندرم ایمپاستر", "سندرم شیاد", "موفقیت", "کمال‌گرایی"] },
  { slug: "breathing-exercises-anxiety", title: "۵ تمرین تنفسی معجزه‌آسا برای کاهش فوری اضطراب", kws: ["تمرین تنفسی", "کاهش اضطراب", "ریلکسیشن", "تنفس عمیق"] },
  { slug: "setting-healthy-boundaries", title: "چگونه بدون احساس گناه، مرزهای سالم تعیین کنیم؟", kws: ["مرزگذاری", "نه گفتن", "حریم شخصی", "احترام به خود"] },
  { slug: "mindful-eating", title: "غذا خوردن آگاهانه (Mindful Eating) چیست؟", kws: ["تغذیه آگاهانه", "ذهن‌آگاهی", "رژیم روانی", "پرخوری عصبی"] },
  { slug: "emotional-intelligence-eq", title: "هوش هیجانی (EQ) چیست و چگونه آن را افزایش دهیم؟", kws: ["هوش هیجانی", "EQ", "مدیریت احساسات", "موفقیت شغلی"] },
  { slug: "adhd-in-adults", title: "نشانه‌های ADHD در بزرگسالان؛ آیا من نقص توجه دارم؟", kws: ["ADHD", "بیش‌فعالی", "نقص توجه", "تمرکز"] },
  { slug: "finding-life-purpose", title: "معنا درمانی: چگونه هدف زندگی خود را پیدا کنیم؟", kws: ["هدف زندگی", "معنا درمانی", "ویکتور فرانکل", "انگیزه"] },
  { slug: "coping-with-loneliness", title: "تفاوت تنهایی و احساس تنهایی؛ چگونه با آن کنار بیاییم؟", kws: ["احساس تنهایی", "انزوا", "ارتباط اجتماعی", "افسردگی"] },
  { slug: "morning-routine-mental-health", title: "روتین صبحگاهی طلایی برای شروع یک روز پرانرژی و آرام", kws: ["روتین صبحگاهی", "انرژی مثبت", "بهره‌وری", "شروع روز"] },
  { slug: "forgiving-yourself", title: "هنر بخشیدن خود: چگونه از اشتباهات گذشته عبور کنیم؟", kws: ["بخشایش", "گذشته", "احساس گناه", "رشد فردی"] },
  { slug: "financial-anxiety", title: "اضطراب مالی چیست و چگونه استرس پول را مدیریت کنیم؟", kws: ["اضطراب مالی", "استرس اقتصادی", "مدیریت پول", "آرامش ذهنی"] },
  { slug: "gaslighting-signs", title: "گسلایتینگ (Gaslighting) چیست؟ نشانه‌های دستکاری روانی", kws: ["گسلایتینگ", "دستکاری روانی", "رابطه سمی", "آزار عاطفی"] },
  { slug: "benefits-of-nature-therapy", title: "طبیعت‌درمانی: چرا قدم زدن در طبیعت مغز را بازسازی می‌کند؟", kws: ["طبیعت‌درمانی", "کاهش استرس", "فضای سبز", "سلامت روان"] },
  { slug: "how-to-stop-procrastinating", title: "اهمال‌کاری چیست؟ روش‌های علمی برای غلبه بر تنبلی", kws: ["اهمال‌کاری", "تنبلی", "مدیریت زمان", "بهره‌وری"] },
  { slug: "music-therapy-benefits", title: "موسیقی درمانی: چگونه صداها استرس ما را کاهش می‌دهند؟", kws: ["موسیقی درمانی", "فرکانس آرامش", "صدا درمانی", "ریلکسیشن"] },
  { slug: "coping-with-change", title: "چگونه با تغییرات بزرگ زندگی سازگار شویم؟", kws: ["تغییرات زندگی", "سازگاری", "انعطاف‌پذیری روانی", "بحران"] },
  { slug: "self-care-vs-selfishness", title: "تفاوت مراقبت از خود (Self-care) و خودخواهی چیست؟", kws: ["مراقبت از خود", "سلف‌کر", "سلامت روان", "خودخواهی"] },
  { slug: "highly-sensitive-person-hsp", title: "آیا شما یک فرد بسیار حساس (HSP) هستید؟", kws: ["آدم بسیار حساس", "HSP", "همدلی بالا", "احساسات عمیق"] },
  { slug: "inner-child-healing", title: "شفای کودک درون: چگونه زخم‌های گذشته را درمان کنیم؟", kws: ["کودک درون", "شفای روانی", "تروما", "روان‌کاوی"] },
  { slug: "managing-anger", title: "مدیریت خشم: چگونه آتش درونمان را مهار کنیم؟", kws: ["کنترل خشم", "عصبانیت", "هوش هیجانی", "ارتباط موثر"] },
  { slug: "introvert-mental-health", title: "راهنمای بقای درون‌گراها در یک دنیای برون‌گرا", kws: ["درون‌گرایی", "شخصیت", "انرژی روانی", "ارتباطات"] },
  { slug: "attachment-styles", title: "سبک‌های دلبستگی: چرا در روابط همیشه یک الگوی تکراری داریم؟", kws: ["سبک دلبستگی", "دلبستگی ایمن", "روابط عاطفی", "روانشناسی عشق"] },
  { slug: "midlife-crisis", title: "بحران میانسالی چیست و چگونه از آن عبور کنیم؟", kws: ["بحران میانسالی", "افسردگی", "معنای زندگی", "تغییر مسیر"] },
  { slug: "yoga-for-mental-health", title: "یوگا و سلامت روان: حرکاتی برای کاهش اضطراب", kws: ["یوگا", "ذهن و بدن", "آرامش", "ورزش درمانی"] },
  { slug: "seasonal-affective-disorder", title: "افسردگی فصلی (SAD) چیست و چگونه درمان می‌شود؟", kws: ["افسردگی فصلی", "پاییز و زمستان", "نور درمانی", "خلق و خو"] },
  { slug: "cognitive-distortions", title: "خطاهای شناختی: تله‌هایی که مغز برایمان می‌گذارد", kws: ["خطاهای شناختی", "افکار منفی", "تحریف شناختی", "CBT"] },
  { slug: "art-therapy", title: "هنر درمانی: چگونه نقاشی و هنر به بیان احساسات کمک می‌کند؟", kws: ["هنر درمانی", "خلاقیت", "تخلیه هیجانی", "هنر"] },
  { slug: "minimalism-and-mind", title: "مینیمالیسم ذهنی: چگونه با خلوت کردن محیط، ذهنمان را آرام کنیم؟", kws: ["مینیمالیسم", "ساده‌زیستی", "خلوت ذهنی", "تمرکز"] }
];

// Beautiful high-quality Unsplash image IDs related to nature, therapy, calm, architecture, abstract
const unsplashIds = [
  "j5aUvLg8Y4w", "F_-0BxGuVvo", "R3pUGn5YaQg", "eOpewngf68w", "rEM3cKIc4EQ", 
  "E8Ufcyxz514", "WVuC_O_Gg1w", "JgOeRuGD_Y4", "vXm12l4QWns", "Yui5vfKHuzs",
  "OqtafYT5kTw", "LNRyGwIJr5c", "XGvwt544g8k", "2x19-mRQgX8", "Yh2Y8afBw_8",
  "8LtrLg_oBqI", "VowIFDzvkA4", "u_8xJ3aRhcg", "l_YF-Bik6H4", "HlI03bZsXbc",
  "P17XW_XUuYk", "x8ZStukS2PM", "N7ZAvHlY0wQ", "CjI_h3sHpoQ", "lG0d-BkiSnc",
  "OVO8nK-7Rfs", "sQZ_N1BwL5A", "Xq1ntWruZQI", "-uHVRvKmVOU", "pGcqw1ARGmI",
  "B14-zOa6nGU", "S0Xp2wFjV20", "v9FQR4tbIq8", "EUsVwEOsblE", "q2n2qZ1G0qI",
  "ZzOa5G8hSPI", "Ixp4YhCKZkI", "N_XpU_fT-7A", "9A_pZp1D2rI", "jXm9vT5fC5E"
];

let generatedArticles = [];

newArticlesData.forEach((data, index) => {
  const content = [
    "<h2>اهمیت پرداختن به " + data.kws[0] + "</h2>",
    "<p>در دنیای پرسرعت امروز، درک <strong>" + data.kws[0] + "</strong> بیش از هر زمان دیگری اهمیت پیدا کرده است. بسیاری از ما درگیر چرخه‌های تکراری استرس و اضطراب هستیم، اما با شناخت راهکارهای علمی مانند " + data.kws[1] + "، می‌توانیم کیفیت زندگی خود را به طور چشمگیری افزایش دهیم.</p>",
    "<h3>نشانه ها و عوامل اصلی</h3>",
    "<p>آیا تا به حال احساس کرده‌اید که " + data.kws[2] + " مانع از لذت بردن شما از لحظه حال می‌شود؟ این یکی از نشانه‌های شایع در بین افراد مدرن است. روانشناسان معتقدند که ریشه بسیاری از این چالش‌ها به عدم توجه کافی به " + data.kws[3] + " بازمی‌گردد.</p>",
    "<blockquote>«تغییر از لحظه‌ای آغاز می‌شود که ما شجاعت پذیرش حقیقت درونی خود را پیدا می‌کنیم.»</blockquote>",
    "<h3>۳ راهکار کلیدی برای بهبود</h3>",
    "<p>برای شروع مسیر بهبودی، نیازی به تغییرات بزرگ و ناگهانی نیست. قدم‌های کوچک اما مستمر، نتایج پایداری به همراه دارند:</p>",
    "<ul>",
    "  <li><strong>آگاهی روزانه:</strong> هر روز حداقل ۵ دقیقه را به بررسی وضعیت ذهنی خود و تمرکز بر " + data.kws[0] + " اختصاص دهید.</li>",
    "  <li><strong>مدیریت محرک‌ها:</strong> عواملی که باعث تشدید " + data.kws[2] + " می‌شوند را شناسایی کرده و آن‌ها را محدود کنید.</li>",
    "  <li><strong>پذیرش احساسات:</strong> به جای مبارزه با افکار منفی، آن‌ها را بدون قضاوت مشاهده کنید.</li>",
    "</ul>",
    "<h3>نتیجه‌گیری</h3>",
    "<p>پرداختن به " + data.kws[1] + " یک مقصد نیست، بلکه یک سفر مداوم است. پلتفرم هوشمند <strong>آراما</strong> با بهره‌گیری از جدیدترین دستاوردهای هوش مصنوعی در حوزه روان‌شناسی، می‌تواند به عنوان یک همراه امن و بدون قضاوت در این سفر در کنار شما باشد.</p>"
  ].join('\\n');

  const article = {
    slug: data.slug,
    title: data.title,
    summary: 'با شناخت عمیق‌تر ' + data.kws[0] + ' و یادگیری تکنیک‌های مرتبط با ' + data.kws[1] + '، قدمی بزرگ در مسیر آرامش ذهنی و غلبه بر ' + data.kws[2] + ' بردارید.',
    content: content,
    coverImage: 'https://images.unsplash.com/photo-' + unsplashIds[index] + '?auto=format&fit=crop&w=1200&h=630&q=80',
    publishedAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0],
    readTimeMinutes: Math.floor(Math.random() * 5) + 5
  };
  
  generatedArticles.push(article);
});

// Read the existing magazines.ts file
const magazinesPath = path.join(__dirname, '..', 'src', 'data', 'magazines.ts');
let fileContent = fs.readFileSync(magazinesPath, 'utf8');

// We need to inject the generatedArticles array into the existing magazines array
// Find the end of the magazines array declaration
const regex = /export const magazines: Article\[\] = \[([\s\S]*?)\];/;
const match = fileContent.match(regex);

if (match) {
  // We extract the existing content inside the array
  const existingArticlesString = match[1];
  
  // Format the new articles into a string
  const newArticlesString = generatedArticles.map(a => {
    return '  {\\n' +
    '    slug: "' + a.slug + '",\\n' +
    '    title: "' + a.title + '",\\n' +
    '    summary: "' + a.summary + '",\\n' +
    '    coverImage: "' + a.coverImage + '",\\n' +
    '    publishedAt: "' + a.publishedAt + '",\\n' +
    '    readTimeMinutes: ' + a.readTimeMinutes + ',\\n' +
    '    content: `' + a.content + '`\\n' +
    '  }';
  }).join(',\\n');

  // Replace the array content with existing + new
  const newArrayContent = 'export const magazines: Article[] = [' + existingArticlesString + ',\\n' + newArticlesString + '\\n];';
  
  fileContent = fileContent.replace(regex, newArrayContent);
  fs.writeFileSync(magazinesPath, fileContent, 'utf8');
  console.log('Successfully added 40 new SEO blog posts to magazines.ts');
} else {
  console.error('Could not find magazines array in file');
}
