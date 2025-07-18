import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';

interface LocalizedTextProps extends TextProps {
  translationKey: string;
  values?: { [key: string]: any };
  fallback?: string;
}

export const LocalizedText: React.FC<LocalizedTextProps> = ({
  translationKey,
  values,
  fallback,
  style,
  ...props
}) => {
  const { t, isRTL } = useLanguage();

  const translatedText = t(translationKey, values) || fallback || translationKey;

  const textStyle = [
    isRTL && styles.rtlText,
    style,
  ];

  return (
    <Text style={textStyle} {...props}>
      {translatedText}
    </Text>
  );
};

const styles = StyleSheet.create({
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});