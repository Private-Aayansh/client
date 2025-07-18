import { SUPPORTED_LANGUAGES } from './i18n';

// Helper function to detect user's preferred language from device settings
export const detectPreferredLanguage = (): string => {
  try {
    // Get device locale
    const deviceLocale = typeof navigator !== 'undefined' 
      ? navigator.language || navigator.languages?.[0] 
      : 'en';
    
    // Extract language code (e.g., 'en-US' -> 'en')
    const languageCode = deviceLocale.split('-')[0].toLowerCase();
    
    // Check if we support this language
    const supportedLanguage = SUPPORTED_LANGUAGES.find(
      lang => lang.code === languageCode
    );
    
    return supportedLanguage ? languageCode : 'en';
  } catch (error) {
    console.warn('Error detecting preferred language:', error);
    return 'en';
  }
};

// Helper function to format language display name
export const formatLanguageDisplayName = (languageCode: string): string => {
  const language = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
  return language ? `${language.nativeName} (${language.name})` : languageCode;
};

// Helper function to get language direction
export const getLanguageDirection = (languageCode: string): 'ltr' | 'rtl' => {
  const language = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
  return language?.rtl ? 'rtl' : 'ltr';
};

// Helper function to validate language code
export const isValidLanguageCode = (languageCode: string): boolean => {
  return SUPPORTED_LANGUAGES.some(lang => lang.code === languageCode);
};

// Helper function to get fallback language chain
export const getFallbackLanguages = (primaryLanguage: string): string[] => {
  const fallbacks = [primaryLanguage];
  
  // Add English as fallback if not already primary
  if (primaryLanguage !== 'en') {
    fallbacks.push('en');
  }
  
  // Add Hindi as secondary fallback for Indian languages
  const indianLanguages = ['hi', 'bn', 'mr', 'te', 'ta', 'gu', 'kn', 'or', 'ml', 'pa'];
  if (indianLanguages.includes(primaryLanguage) && primaryLanguage !== 'hi') {
    fallbacks.splice(1, 0, 'hi'); // Insert Hindi before English
  }
  
  return fallbacks;
};

// Helper function to get localized number formatting
export const formatNumber = (number: number, languageCode: string): string => {
  try {
    // Map language codes to locale identifiers
    const localeMap: { [key: string]: string } = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'bn': 'bn-IN',
      'mr': 'mr-IN',
      'te': 'te-IN',
      'ta': 'ta-IN',
      'gu': 'gu-IN',
      'ur': 'ur-IN',
      'kn': 'kn-IN',
      'or': 'or-IN',
      'ml': 'ml-IN',
      'pa': 'pa-IN',
    };
    
    const locale = localeMap[languageCode] || 'en-IN';
    return new Intl.NumberFormat(locale).format(number);
  } catch (error) {
    console.warn('Error formatting number:', error);
    return number.toString();
  }
};

// Helper function to get localized currency formatting
export const formatCurrency = (amount: number, languageCode: string): string => {
  try {
    const localeMap: { [key: string]: string } = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'bn': 'bn-IN',
      'mr': 'mr-IN',
      'te': 'te-IN',
      'ta': 'ta-IN',
      'gu': 'gu-IN',
      'ur': 'ur-IN',
      'kn': 'kn-IN',
      'or': 'or-IN',
      'ml': 'ml-IN',
      'pa': 'pa-IN',
    };
    
    const locale = localeMap[languageCode] || 'en-IN';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    console.warn('Error formatting currency:', error);
    return `₹${amount}`;
  }
};

// Helper function to get localized date formatting
export const formatDate = (date: Date, languageCode: string): string => {
  try {
    const localeMap: { [key: string]: string } = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'bn': 'bn-IN',
      'mr': 'mr-IN',
      'te': 'te-IN',
      'ta': 'ta-IN',
      'gu': 'gu-IN',
      'ur': 'ur-IN',
      'kn': 'kn-IN',
      'or': 'or-IN',
      'ml': 'ml-IN',
      'pa': 'pa-IN',
    };
    
    const locale = localeMap[languageCode] || 'en-IN';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch (error) {
    console.warn('Error formatting date:', error);
    return date.toLocaleDateString();
  }
};