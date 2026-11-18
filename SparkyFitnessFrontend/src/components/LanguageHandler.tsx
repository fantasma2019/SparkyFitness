import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useAuth } from '@/hooks/useAuth';
import { DEFAULT_WEB_LANGUAGE } from '@/utils/languageUtils';

const LanguageHandler = (): null => {
  const { i18n } = useTranslation();
  const { language } = usePreferences();
  const { user } = useAuth();
  const displayLanguage = user ? language : DEFAULT_WEB_LANGUAGE;

  useEffect(() => {
    document.documentElement.lang = displayLanguage;
    i18n.changeLanguage(displayLanguage);
  }, [displayLanguage, i18n]);

  return null;
};

export default LanguageHandler;
