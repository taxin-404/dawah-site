// src/i18n/ui.ts
export const languages = {
  en: "English",
  bn: "বাংলা",
  ar: "العربية",
};

export const defaultLang = "en";

// Direction per language (for RTL Arabic support)
export const langDir: Record<string, "ltr" | "rtl"> = {
  en: "ltr",
  bn: "ltr",
  ar: "rtl",
};

export const ui = {
  en: {
    // Nav
    "nav.home": "Home",
    "nav.articles": "Articles",
    "nav.about": "About",
    "nav.contact": "Contact",

    // Hero
    "hero.bismillah": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    "hero.tagline": "In the name of Allah, the Most Gracious, the Most Merciful",
    "hero.subtitle": "Sharing the message of Islam — with clarity, love, and wisdom.",
    "hero.cta": "Read Articles",

    // Sections
    "section.featured": "Featured Articles",
    "section.latest": "Latest Articles",
    "section.readmore": "Read More",
    "section.viewall": "View All Articles",

    // Article
    "article.by": "By",
    "article.minsread": "min read",

    // Footer
    "footer.tagline": "Spreading the light of Islam.",
    "footer.rights": "All rights reserved.",
  },

  bn: {
    "nav.home": "হোম",
    "nav.articles": "প্রবন্ধ",
    "nav.about": "আমাদের সম্পর্কে",
    "nav.contact": "যোগাযোগ",

    "hero.bismillah": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    "hero.tagline": "পরম করুণাময় ও অসীম দয়ালু আল্লাহর নামে",
    "hero.subtitle": "ইসলামের বার্তা পৌঁছে দিচ্ছি — স্পষ্টতা, ভালোবাসা ও প্রজ্ঞার সাথে।",
    "hero.cta": "প্রবন্ধ পড়ুন",

    "section.featured": "বিশেষ প্রবন্ধ",
    "section.latest": "সর্বশেষ প্রবন্ধ",
    "section.readmore": "আরও পড়ুন",
    "section.viewall": "সব প্রবন্ধ দেখুন",

    "article.by": "লিখেছেন",
    "article.minsread": "মিনিট পড়া",

    "footer.tagline": "ইসলামের আলো ছড়িয়ে দিচ্ছি।",
    "footer.rights": "সর্বস্বত্ব সংরক্ষিত।",
  },

  ar: {
    "nav.home": "الرئيسية",
    "nav.articles": "المقالات",
    "nav.about": "من نحن",
    "nav.contact": "تواصل معنا",

    "hero.bismillah": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    "hero.tagline": "بسم الله الرحمن الرحيم",
    "hero.subtitle": "نشر رسالة الإسلام بوضوح ومحبة وحكمة.",
    "hero.cta": "اقرأ المقالات",

    "section.featured": "مقالات مميزة",
    "section.latest": "أحدث المقالات",
    "section.readmore": "اقرأ المزيد",
    "section.viewall": "عرض جميع المقالات",

    "article.by": "بقلم",
    "article.minsread": "دقائق قراءة",

    "footer.tagline": "ننشر نور الإسلام.",
    "footer.rights": "جميع الحقوق محفوظة.",
  },
} as const;

export type Lang = keyof typeof ui;
export type UIKey = keyof typeof ui.en;

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split("/");
  if (lang in ui) return lang as Lang;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return (ui[lang] as Record<string, string>)[key] ?? (ui[defaultLang] as Record<string, string>)[key] ?? key;
  };
}

export function getLocalePath(path: string, lang: Lang): string {
  if (lang === defaultLang) return path;
  return `/${lang}${path}`;
}
