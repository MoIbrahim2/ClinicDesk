import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import arTranslations from './locales/ar.json';

const savedLanguage = localStorage.getItem('clinic_lang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      ar: { translation: arTranslations }
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Apply document language and text direction attributes
const updateDocAttributes = (lang) => {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
};

updateDocAttributes(savedLanguage);

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('clinic_lang', lng);
  updateDocAttributes(lng);
});

export default i18n;
