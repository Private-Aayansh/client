import React from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { Eye, EyeOff } from 'lucide-react-native';

interface LocalizedInputProps {
  labelKey?: string;
  placeholderKey?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
  style?: any;
}

export const LocalizedInput: React.FC<LocalizedInputProps> = ({
  labelKey,
  placeholderKey,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
  numberOfLines = 1,
  style,
}) => {
  const { t, isRTL } = useLanguage();
  const [showPassword, setShowPassword] = React.useState(false);

  const label = labelKey ? t(labelKey) : undefined;
  const placeholder = placeholderKey ? t(placeholderKey) : undefined;

  const inputStyle = [
    styles.input,
    error && styles.inputError,
    multiline && styles.inputMultiline,
    isRTL && styles.inputRTL,
  ];

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, isRTL && styles.labelRTL]}>
          {label}
        </Text>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={inputStyle}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlign={isRTL ? 'right' : 'left'}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={[styles.eyeIcon, isRTL && styles.eyeIconRTL]}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={20} color="#9CA3AF" />
            ) : (
              <Eye size={20} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[styles.errorText, isRTL && styles.errorTextRTL]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  labelRTL: {
    textAlign: 'right',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    fontWeight: '500',
  },
  inputRTL: {
    textAlign: 'right',
  },
  inputError: {
    borderColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOpacity: 0.1,
  },
  inputMultiline: {
    textAlignVertical: 'top',
  },
  eyeIcon: {
    position: 'absolute',
    right: 20,
    top: 16,
  },
  eyeIconRTL: {
    right: 'auto',
    left: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 8,
    fontWeight: '500',
  },
  errorTextRTL: {
    textAlign: 'right',
  },
});