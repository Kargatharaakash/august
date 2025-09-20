import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import Spacing from '@/constants/Spacing';

// Get screen dimensions for responsive design
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive sizing calculations
const HEADER_TITLE_FONT_SIZE = SCREEN_WIDTH * 0.055; // 5.5% of screen width
const COMING_SOON_TEXT_FONT_SIZE = SCREEN_WIDTH * 0.07; // 7% of screen width
const DESCRIPTION_FONT_SIZE = SCREEN_WIDTH * 0.045; // 4.5% of screen width

const ICON_CONTAINER_SIZE = SCREEN_WIDTH * 0.21; // 21% of screen width
const ICON_CONTAINER_RADIUS = ICON_CONTAINER_SIZE / 2;
const HEADER_MARGIN_BOTTOM = SCREEN_WIDTH * 0.1; // 10% of screen width
const CONTENT_PADDING_BOTTOM = SCREEN_WIDTH * 0.1; // 10% of screen width
const ICON_CONTAINER_MARGIN_BOTTOM = SCREEN_WIDTH * 0.05; // 5% of screen width
const COMING_SOON_TEXT_MARGIN_BOTTOM = SCREEN_WIDTH * 0.03; // 3% of screen width
const BACK_BUTTON_PADDING = SCREEN_WIDTH * 0.025; // 2.5% of screen width
const BACK_BUTTON_MARGIN_RIGHT = SCREEN_WIDTH * 0.03; // 3% of screen width
const CONTAINER_PADDING_HORIZONTAL = SCREEN_WIDTH * 0.05; // 5% of screen width
const CONTAINER_PADDING_TOP = SCREEN_WIDTH * 0.05; // 5% of screen width
const DESCRIPTION_MAX_WIDTH = SCREEN_WIDTH * 0.8; // 80% of screen width

interface ComingSoonProps {
  title: string;
  description?: string;
  featureIcon?: React.ReactNode;
}

export default function ComingSoon({ title, description, featureIcon }: ComingSoonProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      <View style={styles.content}>
        {featureIcon && <View style={styles.iconContainer}>{featureIcon}</View>}
        <Text style={styles.comingSoonText}>Coming Soon</Text>
        <Text style={styles.description}>
          {description || `We're working hard to bring you this feature. Stay tuned!`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: CONTAINER_PADDING_HORIZONTAL,
    paddingTop: CONTAINER_PADDING_TOP,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HEADER_MARGIN_BOTTOM,
  },
  backButton: {
    padding: BACK_BUTTON_PADDING,
    marginRight: BACK_BUTTON_MARGIN_RIGHT,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: HEADER_TITLE_FONT_SIZE,
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: CONTENT_PADDING_BOTTOM,
  },
  iconContainer: {
    width: ICON_CONTAINER_SIZE,
    height: ICON_CONTAINER_SIZE,
    borderRadius: ICON_CONTAINER_RADIUS,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ICON_CONTAINER_MARGIN_BOTTOM,
  },
  comingSoonText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: COMING_SOON_TEXT_FONT_SIZE,
    color: Colors.primary[600],
    marginBottom: COMING_SOON_TEXT_MARGIN_BOTTOM,
  },
  description: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: DESCRIPTION_FONT_SIZE,
    color: Colors.text.secondary,
    textAlign: 'center',
    maxWidth: DESCRIPTION_MAX_WIDTH,
  },
});