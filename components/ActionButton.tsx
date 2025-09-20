import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType, Dimensions } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Typography from '@/constants/Typography';
import Spacing from '@/constants/Spacing';

// Get screen dimensions for responsive design
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive sizing calculations
const BUTTON_HEIGHT = SCREEN_HEIGHT * 0.18; // Reduced from 22% to 18% of screen height (reduced by 2)
const TEXT_FONT_SIZE = SCREEN_WIDTH * 0.045; // Reduced from 5.5% to 4.5% of screen width (reduced by 2)
const ICON_IMAGE_WIDTH = SCREEN_WIDTH * 0.064; // 6.4% of screen width
const ICON_IMAGE_HEIGHT = SCREEN_WIDTH * 0.064; // 6.4% of screen width
const ICON_IMAGE_MARGIN_BOTTOM = SCREEN_WIDTH * 0.03; // 3% of screen width
const TEXT_MARGIN_TOP = SCREEN_WIDTH * 0.03; // 3% of screen width
const BUTTON_BORDER_RADIUS = SCREEN_WIDTH * 0.064; // 6.4% of screen width
const BUTTON_WIDTH_PERCENTAGE = 0.48; // 48% of container width
const SHADOW_OFFSET_HEIGHT = SCREEN_HEIGHT * 0.005; // 0.5% of screen height
const SHADOW_RADIUS = SCREEN_WIDTH * 0.02; // 2% of screen width

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
    width: `${BUTTON_WIDTH_PERCENTAGE * 100}%`,
    height: BUTTON_HEIGHT,
    borderRadius: BUTTON_BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: SHADOW_OFFSET_HEIGHT },
    shadowOpacity: 0.12,
    shadowRadius: SHADOW_RADIUS,
    elevation: 4,
  },
  content: {
    alignItems: 'center',
  },
  iconImage: {
    width: ICON_IMAGE_WIDTH,
    height: ICON_IMAGE_HEIGHT,
    marginBottom: ICON_IMAGE_MARGIN_BOTTOM,
  },
  text: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: TEXT_FONT_SIZE,
    color: theme.colors.text.primary,
    marginTop: TEXT_MARGIN_TOP,
  },
});