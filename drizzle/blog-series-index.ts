/**
 * Blog Series Master Index — Arama Mental Health Series (14 Posts)
 *
 * Complete series overview for review before seeding.
 * Each post is in its own file: blog-post-01.ts through blog-post-14.ts
 */

export const seriesMeta = {
  title: "آراما Blog Series — سلامت روان، زندگی سالم، و هوش مصنوعی",
  totalPosts: 14,
  categories: {
    "سلامت روان": 7,  // posts 1-8, 14
    "هوش مصنوعی": 4,  // posts 9-12
    "زندگی سالم": 1,  // post 13
    // + 2 new categories needed below
  },
  posts: [
    // ── Foundational Mental Health (4) ──────────────
    {
      num: 1,
      title: "سلامت روان واقعاً یعنی چه؟ — جدا کردن آن از «دیوانه بودن»",
      slug: "what-mental-health-actually-means",
      category: "سلامت روان",
      topic: "Foundational",
      crisisResources: false,
      citations: "WHO Mental Health definition, APA mental health literacy",
    },
    {
      num: 2,
      title: "فرسودگی شغلی یا خستگی عادی؟ چطور فرقشان را بفهمیم",
      slug: "burnout-vs-everyday-tiredness",
      category: "سلامت روان",
      topic: "Foundational",
      crisisResources: false,
      citations: "WHO ICD-11 burnout definition, Maslach Burnout Inventory",
    },
    {
      num: 3,
      title: "اضطراب چیست؟ — نه فقط در ذهن، بلکه در تمام بدنتان",
      slug: "anxiety-101-what-it-feels-like",
      category: "سلامت روان",
      topic: "Foundational",
      crisisResources: false,
      citations: "APA GAD guidelines, DSM-5 GAD criteria (generalized)",
    },
    {
      num: 4,
      title: "خواب و سلامت روان — رابطه‌ای که هر دو طرفش مهم است",
      slug: "sleep-and-mental-health",
      category: "سلامت روان",
      topic: "Foundational",
      crisisResources: false,
      citations: "Sleep Foundation, Harvard Medical School sleep studies",
    },

    // ── Everyday Life & Mental Health (4) ───────────
    {
      num: 5,
      title: "تنهایی در عصر اتصال مداوم — چرا با هزار دوست هنوز احساس تنهایی می‌کنیم؟",
      slug: "loneliness-in-age-of-connection",
      category: "سلامت روان",
      topic: "Everyday Life",
      crisisResources: false,
      citations: "US Surgeon General advisory (2023), WHO social connection",
    },
    {
      num: 6,
      title: "انتظارات خانواده و سلامت روان — وقتی عشق فشار می‌آورد",
      slug: "family-expectations-mental-health",
      category: "سلامت روان",
      topic: "Everyday Life",
      crisisResources: false,
      citations: "APA family systems research, Hofstede collectivism",
    },
    {
      num: 7,
      title: "سوگ و از دست دادن — چه چیزی «عادی» است و کی باید کمک خواست؟",
      slug: "grief-and-loss-normal-and-when-to-seek-support",
      category: "سلامت روان",
      topic: "Everyday Life",
      crisisResources: true,
      citations: "Kübler-Ross model, APA grief guidelines, WHO mental health",
      crisisNote: "Iranian social emergency (123) included",
    },
    {
      num: 8,
      title: "استرس کاری و مرزگذاری — جملات عملی برای «نه گفتن» بدون عذاب وجدان",
      slug: "work-stress-boundaries-saying-no",
      category: "سلامت روان",
      topic: "Everyday Life",
      crisisResources: false,
      citations: "APA workplace stress, WHO occupational health",
    },

    // ── AI + Mental Health (4) ──────────────────────
    {
      num: 9,
      title: "آیا هوش مصنوعی واقعاً می‌تواند به سلامت روان کمک کند؟",
      slug: "can-ai-help-mental-health",
      category: "هوش مصنوعی",
      topic: "AI + Mental Health",
      crisisResources: true,
      citations: "WHO digital health guidelines, APA technology task force",
      crisisNote: "123 social emergency mentioned for crisis scenarios",
    },
    {
      num: 10,
      title: "آراما چطور کار می‌کند؟ — راهنمای ساده برای اولین بار",
      slug: "how-arama-works-walkthrough",
      category: "هوش مصنوعی",
      topic: "AI + Mental Health",
      crisisResources: false,
      citations: "Product walkthrough (no external citations needed)",
    },
    {
      num: 11,
      title: "حریم خصوصی و اعتماد — چه اتفاقی برای حرف‌هایی که به هوش مصنوعی می‌زنید می‌افتد؟",
      slug: "privacy-and-trust-ai-companion",
      category: "هوش مصنوعی",
      topic: "AI + Mental Health",
      crisisResources: false,
      citations: "GDPR principles, WHO digital health ethics, APA AI ethics",
    },
    {
      num: 12,
      title: "هوش مصنوعی قدم اول است، نه مقصد نهایی — آراما چطور کنار درمان کار می‌کند",
      slug: "ai-first-step-not-final-destination",
      category: "هوش مصنوعی",
      topic: "AI + Mental Health",
      crisisResources: true,
      citations: "APA technology-assisted therapy, WHO digital mental health",
      crisisNote: "123 social emergency included in disclaimer",
    },

    // ── Bridging Health & Mental Health (2) ─────────
    {
      num: 13,
      title: "ارتباط روده، مغز و خلق و خو — عادت‌های جسمی که سلامت روان را تقویت می‌کنند",
      slug: "gut-brain-mood-connection",
      category: "زندگی سالم",
      topic: "Bridging",
      crisisResources: false,
      citations: "Harvard gut-brain axis, WHO physical activity, APA exercise reviews",
    },
    {
      num: 14,
      title: "کی باید به متخصص مراجعه کرد؟ — راهنمای ساده و بدون ترس",
      slug: "when-to-see-a-professional",
      category: "سلامت روان",
      topic: "Bridging",
      crisisResources: true,
      citations: "APA help-seeking, WHO mhGAP",
      crisisNote: "123, 115, 1480 all included (Iranian crisis lines)",
    },
  ],
};
