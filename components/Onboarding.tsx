import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/contexts/ThemeContext';
import Typography from '@/constants/Typography';
import Spacing from '@/constants/Spacing';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive sizing calculations
const TITLE_FONT_SIZE = SCREEN_WIDTH * 0.13;
const TITLE_LINE_HEIGHT = TITLE_FONT_SIZE * 1.1;
const SUBTITLE_FONT_SIZE = SCREEN_WIDTH * 0.042;
const SUBTITLE_LINE_HEIGHT = SUBTITLE_FONT_SIZE * 1.3;
const DESCRIPTION_FONT_SIZE = SCREEN_WIDTH * 0.042;
const DESCRIPTION_LINE_HEIGHT = DESCRIPTION_FONT_SIZE * 1.3;
const BUTTON_FONT_SIZE = Math.min(SCREEN_WIDTH * 0.045, 18); // Cap font size for better visibility
const BUTTON_PADDING_VERTICAL = SCREEN_HEIGHT * 0.025;
const BUTTON_PADDING_HORIZONTAL = SCREEN_WIDTH * 0.08;
const IMAGE_CONTAINER_HEIGHT = SCREEN_HEIGHT * 0.3;
const CONTENT_HORIZONTAL_PADDING = SCREEN_WIDTH * 0.08;
const CONTENT_TOP_PADDING = SCREEN_HEIGHT * 0.12;
const CONTENT_BOTTOM_PADDING = SCREEN_HEIGHT * 0.05;

interface OnboardingSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: any | null;
  backgroundColor: string;
  textColor: string;
}

const onboardingData: OnboardingSlide[] = [
  {
    id: 1,
    title: 'AI Health\nChat',
    subtitle: 'Get instant health advice',
    description: 'Chat with our AI doctor for\nquick medical guidance and\nhealth recommendations.',
    image: require('@/assets/1.png'),
    backgroundColor: '#F4C2C2', // Light pink
    textColor: '#2D2D2D',
  },
  {
    id: 2,
    title: 'Smart\nWellness',
    subtitle: 'Track your daily health',
    description: 'Monitor wellness tips,\nhealth records, and get\npersonalized care plans.',
    image: require('@/assets/2.png'),
    backgroundColor: '#E8F5E8', // Light green
    textColor: '#2D2D2D',
  },
  {
    id: 3,
    title: 'Digital\nPrescription',
    subtitle: 'Scan and manage medications',
    description: 'Upload prescriptions, scan\nmedicines, and get multilingual\nhealth support.',
    image: require('@/assets/3.png'),
    backgroundColor: '#F5E6D3', // Light orange
    textColor: '#2D2D2D',
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const { theme } = useTheme();
  const pagerRef = useRef<PagerView>(null);

  const handleGetStarted = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Mark onboarding as completed
      await AsyncStorage.setItem('@august_onboarding_completed', 'true');
      
      // Navigate to home and trigger completion callback
      onComplete();
      router.replace('/home');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Fallback navigation
      onComplete();
      router.replace('/home');
    }
  };

  const handleContinue = () => {
    if (currentIndex < onboardingData.length - 1) {
      // Navigate to next screen
      pagerRef.current?.setPage(currentIndex + 1);
    }
  };

  const renderSlide = (slide: OnboardingSlide, index: number) => {
    const isLastSlide = index === onboardingData.length - 1;

    return (
      <View key={slide.id} style={[styles.slide, { backgroundColor: slide.backgroundColor }]}>
        <SafeAreaView style={styles.slideContainer} edges={['top']}>
          {/* Top decorative lines */}
          <View style={styles.decorativeLines}>
            <View style={[styles.progressLine, styles.progressLine1, 
              { backgroundColor: currentIndex === 0 ? slide.textColor : `${slide.textColor}30` }
            ]} />
            <View style={[styles.progressLine, styles.progressLine2, 
              { backgroundColor: currentIndex === 1 ? slide.textColor : `${slide.textColor}30` }
            ]} />
            <View style={[styles.progressLine, styles.progressLine3, 
              { backgroundColor: currentIndex === 2 ? slide.textColor : `${slide.textColor}30` }
            ]} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Title */}
            <Text style={[styles.title, { color: slide.textColor }]}>
              {slide.title}
            </Text>

            {/* Illustration */}
            <View style={styles.imageContainer}>
              <Image source={slide.image} style={styles.image} resizeMode="contain" />
            </View>

            {/* Description */}
            <View style={styles.textContent}>
              <Text style={[styles.subtitle, { color: slide.textColor }]}>
                {slide.subtitle}
              </Text>
              <Text style={[styles.description, { color: slide.textColor }]}>
                {slide.description}
              </Text>
            </View>

            {/* Bottom section */}
            <View style={styles.bottomSection}>
              <TouchableOpacity 
                style={[styles.primaryButton, { backgroundColor: slide.textColor }]}
                onPress={isLastSlide ? handleGetStarted : handleContinue}
              >
                <Text 
                  style={[
                    styles.primaryButtonText, 
                    { 
                      color: slide.backgroundColor,
                      textShadowColor: slide.textColor === '#2D2D2D' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 2
                    }
                  ]}
                  numberOfLines={1}
                >
                  {isLastSlide ? 'Start Using August AI' : 'Continue'}
                </Text>
              </TouchableOpacity>
              
             
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={onboardingData[currentIndex].backgroundColor} barStyle="dark-content" />
      
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={(e: any) => setCurrentIndex(e.nativeEvent.position)}
      >
        {onboardingData.map((slide, index) => (
          <View key={slide.id}>
            {renderSlide(slide, index)}
          </View>
        ))}
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pagerView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  slideContainer: {
    flex: 1,
    paddingHorizontal: CONTENT_HORIZONTAL_PADDING,
  },
  decorativeLines: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? SCREEN_HEIGHT * 0.08 : SCREEN_HEIGHT * 0.06,
    left: CONTENT_HORIZONTAL_PADDING,
    right: CONTENT_HORIZONTAL_PADDING,
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLine: {
    height: 4,
    borderRadius: 2,
    flex: 1,
    marginHorizontal: 4,
  },
  progressLine1: {},
  progressLine2: {},
  progressLine3: {},
  content: {
    flex: 1,
    paddingTop: CONTENT_TOP_PADDING,
    paddingBottom: CONTENT_BOTTOM_PADDING,
  },
  title: {
    fontSize: TITLE_FONT_SIZE,
    fontFamily: Typography.fontFamily.bold,
    lineHeight: TITLE_LINE_HEIGHT,
    letterSpacing: -2,
    marginBottom: SCREEN_HEIGHT * 0.04,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SCREEN_HEIGHT * 0.02,
    flex: 0,
    height: IMAGE_CONTAINER_HEIGHT,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    maxWidth: SCREEN_WIDTH * 0.85,
    maxHeight: SCREEN_HEIGHT * 0.3,
  },
  textContent: {
    marginBottom: SCREEN_HEIGHT * 0.02,
    marginTop: SCREEN_HEIGHT * 0.02,
  },
  subtitle: {
    fontSize: SUBTITLE_FONT_SIZE,
    fontFamily: Typography.fontFamily.semiBold,
    lineHeight: SUBTITLE_LINE_HEIGHT,
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  description: {
    fontSize: DESCRIPTION_FONT_SIZE,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: DESCRIPTION_LINE_HEIGHT,
    opacity: 0.8,
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: '8%',
    paddingTop: '15%'
  },
  primaryButton: {
    paddingVertical: BUTTON_PADDING_VERTICAL,
    paddingHorizontal: BUTTON_PADDING_HORIZONTAL,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minHeight: SCREEN_HEIGHT * 0.07,
    minWidth: SCREEN_WIDTH * 0.45,
  },
  primaryButtonText: {
    fontSize: BUTTON_FONT_SIZE,
    fontFamily: Typography.fontFamily.semiBold,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: BUTTON_FONT_SIZE * 1.2,
  },
});