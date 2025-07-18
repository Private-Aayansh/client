import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Logo } from './Logo';

interface BrandHeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  showLogo?: boolean;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  title,
  subtitle,
  onBackPress,
  rightComponent,
  showLogo = true,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {onBackPress ? (
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            {/* Back arrow would go here */}
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
        
        {showLogo && <Logo size="small" variant="horizontal" />}
        
        {rightComponent || <View style={styles.placeholder} />}
      </View>
      
      <View style={styles.titleSection}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  titleSection: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});