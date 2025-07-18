import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sprout } from 'lucide-react-native';
import { useLanguage } from '../contexts/LanguageContext';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'horizontal' | 'vertical' | 'icon-only';
  color?: string;
  textColor?: string;
  showTranslatedName?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'medium',
  variant = 'horizontal',
  color = '#22C55E',
  textColor = '#1F2937',
  showTranslatedName = false,
}) => {
  const { t } = useLanguage();

  const getIconSize = () => {
    switch (size) {
      case 'small': return 24;
      case 'medium': return 32;
      case 'large': return 48;
      default: return 32;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'medium': return 20;
      case 'large': return 28;
      default: return 20;
    }
  };

  const getSpacing = () => {
    switch (size) {
      case 'small': return 8;
      case 'medium': return 12;
      case 'large': return 16;
      default: return 12;
    }
  };

  if (variant === 'icon-only') {
    return (
      <View style={styles.iconContainer}>
        <Sprout size={getIconSize()} color={color} />
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      variant === 'vertical' ? styles.vertical : styles.horizontal,
      { gap: getSpacing() }
    ]}>
      <Sprout size={getIconSize()} color={color} />
      <Text style={[
        styles.brandText,
        { fontSize: getTextSize(), color: textColor }
      ]}>
        {showTranslatedName ? t('brand.name') : 'AgriCare'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  horizontal: {
    flexDirection: 'row',
  },
  vertical: {
    flexDirection: 'column',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});