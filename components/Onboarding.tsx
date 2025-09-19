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
                <Text style={[styles.primaryButtonText, { color: slide.backgroundColor }]}>
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
    paddingHorizontal: 32,
  },
  decorativeLines: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 32,
    right: 32,
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
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingBottom: 40,
  },
  title: {
    fontSize: 56,
    fontFamily: Typography.fontFamily.bold,
    lineHeight: 60,
    letterSpacing: -2,
    marginBottom: 40,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
    flex: 0,
    height: 260,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    maxWidth: 360,
    maxHeight: 260,
  },
  textContent: {
    marginBottom: 20,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: Typography.fontFamily.semiBold,
    lineHeight: 24,
    marginBottom: 10,
  },
  description: {
    fontSize: 18,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: 24,
    opacity: 0.8,
  },
  bottomSection: {
    paddingBottom: '5%',
    paddingTop: '15%'
  },
  primaryButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 32,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.semiBold,
    fontWeight: '600',
  },
  skipButtonBottom: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.medium,
    opacity: 0.7,
  },
});