import { useLanguage } from '../contexts/LanguageContext';
import { formatNumber, formatCurrency, formatDate } from '../utils/languageUtils';

// Custom hook for enhanced translation functionality
export const useTranslation = () => {
  const { t, language, currentLanguageInfo, isRTL } = useLanguage();

  // Enhanced translation function with interpolation support
  const translate = (key: string, options?: { [key: string]: any }) => {
    return t(key, options);
  };

  // Pluralization helper
  const pluralize = (key: string, count: number, options?: { [key: string]: any }) => {
    const pluralKey = count === 1 ? `${key}.singular` : `${key}.plural`;
    return t(pluralKey, { count, ...options });
  };

  // Number formatting with localization
  const formatLocalizedNumber = (number: number) => {
    return formatNumber(number, language);
  };

  // Currency formatting with localization
  const formatLocalizedCurrency = (amount: number) => {
    return formatCurrency(amount, language);
  };

  // Date formatting with localization
  const formatLocalizedDate = (date: Date) => {
    return formatDate(date, language);
  };

  // Get localized greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      return t('dashboard.goodMorning');
    } else if (hour < 17) {
      return t('dashboard.goodAfternoon');
    } else {
      return t('dashboard.goodEvening');
    }
  };

  // Get text direction for styling
  const getTextAlign = (): 'left' | 'right' | 'center' => {
    return isRTL ? 'right' : 'left';
  };

  // Get flex direction for RTL support
  const getFlexDirection = (): 'row' | 'row-reverse' => {
    return isRTL ? 'row-reverse' : 'row';
  };

  return {
    t: translate,
    language,
    currentLanguageInfo,
    isRTL,
    pluralize,
    formatNumber: formatLocalizedNumber,
    formatCurrency: formatLocalizedCurrency,
    formatDate: formatLocalizedDate,
    getGreeting,
    getTextAlign,
    getFlexDirection,
  };
};