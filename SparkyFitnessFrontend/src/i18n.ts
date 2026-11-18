import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';
import { getSupportedLanguages } from './utils/languageUtils';
import zhHansOverrides from './localization/zh-Hans-overrides.json';

type TranslationCatalog = Record<string, unknown>;

function applyTranslations(
  catalog: TranslationCatalog,
  additions: TranslationCatalog
): TranslationCatalog {
  for (const [key, value] of Object.entries(additions)) {
    if (typeof value === 'string') {
      catalog[key] = value;
      continue;
    }
    const existing = catalog[key];
    catalog[key] = applyTranslations(
      typeof existing === 'object' && existing && !Array.isArray(existing)
        ? (existing as TranslationCatalog)
        : {},
      value as TranslationCatalog
    );
  }
  return catalog;
}

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: getSupportedLanguages(),
    fallbackLng: 'en',
    detection: {
      order: [
        'localStorage',
        'querystring',
        'cookie',
        'sessionStorage',
        'navigator',
        'htmlTag',
      ],
      caches: ['localStorage', 'cookie'],
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      parse: (data: string, language?: string | string[]) => {
        const catalog = JSON.parse(data) as TranslationCatalog;
        // Keep local corrections separate from the catalog synced from Weblate.
        return language === 'zh-Hans'
          ? applyTranslations(catalog, zhHansOverrides)
          : catalog;
      },
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
