import type { Language } from '../i18n';

/**
 * Translation service for automatic multi-language content translation.
 * Handles auto-translation of administrator-entered content across Uzbek, Russian, and English.
 */

export interface TranslatableContent {
  title?: string;
  shortDescription?: string;
  fullDescription?: string;
  venue?: string;
  question?: string;
  answer?: string;
  presentationTitle?: string;
  abstract?: string;
  adminComment?: string;
  [key: string]: any;
}

export interface MultilingualContent extends TranslatableContent {
  translations?: Record<string, Partial<TranslatableContent>>;
  uz?: Partial<TranslatableContent>;
  ru?: Partial<TranslatableContent>;
  en?: Partial<TranslatableContent>;
}

// In-memory cache for translations to keep UI instant
const translationCache = new Map<string, string>();

// Pre-seeded offline dictionary for instant response without network
const DICTIONARY: Record<string, Record<Language, string>> = {
  // Event Titles
  "O'zbekiston san'ati: Zamonaviy yo'nalishlar xalqaro konferensiyasi": {
    uz: "O'zbekiston san'ati: Zamonaviy yo'nalishlar xalqaro konferensiyasi",
    ru: "Искусство Узбекистана: Международная конференция по современным направлениям",
    en: "Uzbekistan Art: International Conference on Modern Trends",
  },
  "Markaziy Osiyo san'at festivali va ko'rgazmasi 2026": {
    uz: "Markaziy Osiyo san'at festivali va ko'rgazmasi 2026",
    ru: "Фестиваль и выставка искусства Центральной Азии 2026",
    en: "Central Asian Art Festival and Exhibition 2026",
  },
  "Madaniyat va meros simpoziumlari: Ipak yo'li an'analari": {
    uz: "Madaniyat va meros simpoziumlari: Ipak yo'li an'analari",
    ru: "Симпозиумы культуры и наследия: Традиции Шелкового пути",
    en: "Culture and Heritage Symposiums: Silk Road Traditions",
  },
  "Xalqaro musiqa va sahnalashtirish san'ati forumi": {
    uz: "Xalqaro musiqa va sahnalashtirish san'ati forumi",
    ru: "Международный форум музыкального и сценического искусства",
    en: "International Music and Performing Arts Forum",
  },
  "Raqamli san'at va texnologiyalar bo'yicha xalqaro seminar": {
    uz: "Raqamli san'at va texnologiyalar bo'yicha xalqaro seminar",
    ru: "Международный семинар по цифровому искусству и технологиям",
    en: "International Workshop on Digital Art and Technology",
  },

  // Descriptions
  "Zamonaviy san'at va madaniyat sohasidagi global tendensiyalarni muhokama qilish uchun xalqaro mutaxassislar yig'ini.": {
    uz: "Zamonaviy san'at va madaniyat sohasidagi global tendensiyalarni muhokama qilish uchun xalqaro mutaxassislar yig'ini.",
    ru: "Встреча международных экспертов для обсуждения глобальных тенденций в области современного искусства и культуры.",
    en: "A gathering of international experts to discuss global trends in contemporary art and culture.",
  },
  "Markaziy Osiyo mamlakatlari san'atkorlarining asarlari namoyish etiladigan yirik ko'rgazma.": {
    uz: "Markaziy Osiyo mamlakatlari san'atkorlarining asarlari namoyish etiladigan yirik ko'rgazma.",
    ru: "Крупная выставка произведений художников стран Центральной Азии.",
    en: "A major exhibition featuring works by artists from Central Asian countries.",
  },
  "Ipak yo'li madaniy merosi va zamonaviy ta'siri bo'yicha ilmiy muhokamalar.": {
    uz: "Ipak yo'li madaniy merosi va zamonaviy ta'siri bo'yicha ilmiy muhokamalar.",
    ru: "Научные дискуссии о культурном наследии Шелкового пути и его современном влиянии.",
    en: "Scientific discussions on the Silk Road cultural heritage and its modern influence.",
  },

  // Venues
  "Toshkent, O'zbekiston Milliy san'at muzeyi": {
    uz: "Toshkent, O'zbekiston Milliy san'at muzeyi",
    ru: "Ташкент, Государственный музей искусств Узбекистана",
    en: "Tashkent, State Museum of Arts of Uzbekistan",
  },
  "Toshkent, Yangi O'zbekiston ko'rgazmalar markazi": {
    uz: "Toshkent, Yangi O'zbekiston ko'rgazmalar markazi",
    ru: "Ташкент, Выставочный центр Новый Узбекистан",
    en: "Tashkent, New Uzbekistan Exhibition Center",
  },
  "Samarqand, Registon majmuasi yaqinidagi Konferensiya markazi": {
    uz: "Samarqand, Registon majmuasi yaqinidagi Konferensiya markazi",
    ru: "Самарканд, Конференц-центр возле ансамбля Регистан",
    en: "Samarkand, Conference Center near Registan Complex",
  },

  // Common Admin Phrases
  "Xalqaro konferensiya": { uz: "Xalqaro konferensiya", ru: "Международная конференция", en: "International Conference" },
  "San'at forumi": { uz: "San'at forumi", ru: "Форум искусства", en: "Art Forum" },
  "Madaniyat festivali": { uz: "Madaniyat festivali", ru: "Фестиваль культуры", en: "Culture Festival" },
  "Ajoyib taqdimot. Tasdiqlandi.": { uz: "Ajoyib taqdimot. Tasdiqlandi.", ru: "Отличная презентация. Одобрено.", en: "Excellent presentation. Approved." },
};

/**
 * Translate arbitrary text to target language with caching and API fallback
 */
export async function translateText(text: string, targetLanguage: Language, sourceLanguage: Language = 'uz'): Promise<string> {
  if (!text || text.trim() === '' || targetLanguage === sourceLanguage) {
    return text;
  }

  const cacheKey = `${sourceLanguage}:${targetLanguage}:${text.trim()}`;
  
  // 1. Memory cache check
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // 2. LocalStorage cache check
  try {
    const stored = localStorage.getItem(`t_cache_${cacheKey}`);
    if (stored) {
      translationCache.set(cacheKey, stored);
      return stored;
    }
  } catch {
    // Ignore storage errors
  }

  // 3. Pre-seeded dictionary check
  const trimmed = text.trim();
  if (DICTIONARY[trimmed]?.[targetLanguage]) {
    const translated = DICTIONARY[trimmed][targetLanguage];
    translationCache.set(cacheKey, translated);
    return translated;
  }

  // 4. Online Translation API (Google Translate free endpoint)
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translatedText = data[0].map((item: any) => item[0]).filter(Boolean).join('');
        if (translatedText) {
          translationCache.set(cacheKey, translatedText);
          try {
            localStorage.setItem(`t_cache_${cacheKey}`, translatedText);
          } catch {
            // Storage quota full
          }
          return translatedText;
        }
      }
    }
  } catch (error) {
    console.warn('Online translation request failed, returning original text:', error);
  }

  return text;
}

/**
 * Translate all translatable properties of an object to all supported languages (uz, ru, en)
 */
export async function translateContentToAllLanguages(
  content: TranslatableContent,
  sourceLanguage: Language = 'uz'
): Promise<MultilingualContent> {
  const languages: Language[] = ['uz', 'ru', 'en'];
  const translations: Record<string, Partial<TranslatableContent>> = {
    uz: sourceLanguage === 'uz' ? { ...content } : {},
    ru: sourceLanguage === 'ru' ? { ...content } : {},
    en: sourceLanguage === 'en' ? { ...content } : {},
  };

  const keysToTranslate = Object.keys(content).filter(
    (key) => typeof content[key] === 'string' && content[key]?.trim() !== ''
  );

  for (const targetLang of languages) {
    if (targetLang === sourceLanguage) continue;

    const translatedFields: Partial<TranslatableContent> = {};
    for (const key of keysToTranslate) {
      const originalValue = content[key];
      if (originalValue) {
        translatedFields[key] = await translateText(originalValue, targetLang, sourceLanguage);
      }
    }
    translations[targetLang] = translatedFields;
  }

  return {
    ...content,
    translations,
    uz: translations.uz,
    ru: translations.ru,
    en: translations.en,
  };
}

/**
 * Helper to resolve object properties (title, description, question, answer, etc.)
 * in the active target language.
 */
export function getTranslatedContent<T extends Record<string, any>>(item: T, language: Language): T {
  if (!item) return item;
  if (language === 'uz' && !item.translations?.uz) return item;

  const translationsObj = item.translations as Record<string, Record<string, string>> | undefined;
  const langTranslations = translationsObj?.[language];

  if (!langTranslations) {
    return item;
  }

  return {
    ...item,
    ...langTranslations,
  };
}

/**
 * React Hook for auto-translating content
 */
export function useAutoTranslate() {
  const translate = async (content: TranslatableContent, sourceLang: Language = 'uz') => {
    return translateContentToAllLanguages(content, sourceLang);
  };

  return { translate, translateText };
}
