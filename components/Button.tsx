import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[`button_${variant}`], styles[`button_${size}`]];
    if (disabled) baseStyle.push(styles.buttonDisabled);
    if (style) baseStyle.push(style);
    return baseStyle;
  };

  const getTextStyle = () => {
    return [styles.text, styles[`text_${variant}`], styles[`text_${size}`]];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#22C55E'} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  button_primary: {
    backgroundColor: '#22C55E',
    shadowColor: '#22C55E',
    shadowOpacity: 0.4,
  },
  button_secondary: {
    backgroundColor: '#8B4513',
    shadowColor: '#8B4513',
    shadowOpacity: 0.4,
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: '#22C55E',
    shadowOpacity: 0.05,
  },
  button_small: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  button_medium: {
    paddingHorizontal: 36,
    paddingVertical: 18,
  },
  button_large: {
    paddingHorizontal: 44,
    paddingVertical: 22,
  },
  buttonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0.05,
  },
  text: {
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  text_primary: {
    color: '#FFFFFF',
  },
  text_secondary: {
    color: '#FFFFFF',
  },
  text_outline: {
    color: '#22C55E',
  },
  text_small: {
    fontSize: 16,
  },
  text_medium: {
    fontSize: 18,
  },
  text_large: {
    fontSize: 20,
  },
});