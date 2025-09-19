import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Typography from '@/constants/Typography';
import Spacing from '@/constants/Spacing';

interface ActionButtonProps {
  title: string;
  backgroundColor: string;
  icon: React.ReactNode | ImageSourcePropType;
  onPress: () => void;
  isImageIcon?: boolean;
}

export default function ActionButton({ 
  title, 
  backgroundColor, 
  icon, 
  onPress,
  isImageIcon = false
}: ActionButtonProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor }]} 
      onPress={onPress}
    >
      <View style={styles.content}>
        {isImageIcon ? (
          <Image source={icon as ImageSourcePropType} style={styles.iconImage} resizeMode="contain" />
        ) : (
          <>{icon}</>
        )}
        <Text style={styles.text}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  button: {
    width: '48%',
    height: 160,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    alignItems: 'center',
  },
  iconImage: {
    width: 24,
    height: 24,
    marginBottom: Spacing.sm,
  },
  text: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.xl,
    color: theme.colors.text.primary,
    marginTop: Spacing.md,
  },
});