import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  PanResponder,
  Platform,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import Typography from '@/constants/Typography';
import Spacing from '@/constants/Spacing';
import { fetchHealthTips } from '@/services/groq';
import { storeData, getData } from '@/services/storage';

// Get screen dimensions for responsive design
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive sizing calculations
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH; // 25% of screen width for swipe
const SWIPE_OUT_DURATION = 250;

const HEADER_TITLE_FONT_SIZE = SCREEN_WIDTH * 0.055; // 5.5% of screen width
const CATEGORY_TEXT_FONT_SIZE = SCREEN_WIDTH * 0.03; // 3% of screen width
const CARD_TITLE_FONT_SIZE = SCREEN_WIDTH * 0.045; // 4.5% of screen width
const CARD_CONTENT_FONT_SIZE = SCREEN_WIDTH * 0.04; // 4% of screen width
const CARD_CONTENT_LINE_HEIGHT = SCREEN_WIDTH * 0.06; // 6% of screen width
const CARD_COUNTER_FONT_SIZE = SCREEN_WIDTH * 0.03; // 3% of screen width
const NAV_BUTTON_TEXT_FONT_SIZE = SCREEN_WIDTH * 0.035; // 3.5% of screen width
const RETRY_BUTTON_TEXT_FONT_SIZE = SCREEN_WIDTH * 0.035; // 3.5% of screen width
const LOADING_TEXT_FONT_SIZE = SCREEN_WIDTH * 0.035; // 3.5% of screen width
const ERROR_TEXT_FONT_SIZE = SCREEN_WIDTH * 0.035; // 3.5% of screen width
const EMPTY_TEXT_FONT_SIZE = SCREEN_WIDTH * 0.04; // 4% of screen width
const SWIPE_HINT_TEXT_FONT_SIZE = SCREEN_WIDTH * 0.035; // 3.5% of screen width

const CARD_WRAPPER_WIDTH = SCREEN_WIDTH - Spacing.xl * 2;
const CARD_WRAPPER_HEIGHT = SCREEN_HEIGHT * 0.4; // 40% of screen height
const CARD_BORDER_RADIUS = SCREEN_WIDTH * 0.05; // 5% of screen width
const CATEGORY_BADGE_BORDER_RADIUS = SCREEN_WIDTH * 0.03; // 3% of screen width
const NAV_BUTTON_BORDER_RADIUS = SCREEN_WIDTH * 0.03; // 3% of screen width
const RETRY_BUTTON_BORDER_RADIUS = SCREEN_WIDTH * 0.03; // 3% of screen width
const MIN_NAV_BUTTON_WIDTH = SCREEN_WIDTH * 0.3; // 30% of screen width
const NAV_BUTTON_PADDING_HORIZONTAL = SCREEN_WIDTH * 0.06; // 6% of screen width
const NAV_BUTTON_PADDING_VERTICAL = SCREEN_HEIGHT * 0.02; // 2% of screen height

interface HealthTip {
  id: number;
  title: string;
  content: string;
  category?: string;
}

export default function WellnessScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = getStyles(theme);
  
  const [healthTips, setHealthTips] = useState<HealthTip[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardColors, setCardColors] = useState<string[]>([]);

  // Refs to hold the latest state values
  const healthTipsRef = useRef(healthTips);
  const currentIndexRef = useRef(currentIndex);

  // Update refs when state changes
  useEffect(() => {
    healthTipsRef.current = healthTips;
    currentIndexRef.current = currentIndex;
  }, [healthTips, currentIndex]);

  const generateRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = isDark ? 40 : 70; // Less saturated in dark mode
    const lightness = isDark ? 25 : 85; // Darker in dark mode for contrast
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const position = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        // Update position as user drags
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        console.log('Pan gesture released. dx:', gesture.dx, 'threshold:', SWIPE_THRESHOLD);
        
        // Check if swipe distance is significant enough
        if (gesture.dx > SWIPE_THRESHOLD) {
          console.log('Triggering swipe right (previous)');
          swipeRight();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          console.log('Triggering swipe left (next)');
          swipeLeft();
        } else {
          console.log('Not enough swipe distance, resetting position');
          resetPosition();
        }
      },
      onPanResponderTerminate: () => {
        // Reset position if gesture is interrupted
        resetPosition();
      },
    })
  ).current;

  useEffect(() => {
    console.log('Health tips state updated:', healthTips.length);
  }, [healthTips]);

  useEffect(() => {
    console.log('Current index state updated:', currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    loadHealthTips();
  }, []);

  useEffect(() => {
    console.log('State updated - Current index:', currentIndex, 'Health tips length:', healthTips.length);
    // When we reach the 59th card, fetch new tips
    if (currentIndex === 59 && healthTips.length > 0) {
      fetchNewTips();
    }
    
    // Save current index to AsyncStorage whenever it changes
    if (healthTips.length > 0 && currentIndex >= 0) {
      storeData('lastWellnessCardIndex', currentIndex.toString());
    }
  }, [currentIndex, healthTips]);

  const loadHealthTips = async () => {
    try {
      // Try to load from AsyncStorage first
      const cachedTips = await getData('healthTips');
      
      if (cachedTips) {
        const parsedTips = JSON.parse(cachedTips);
        console.log('Loaded tips from cache:', parsedTips.length);
        
        // Validate that parsedTips is an array
        if (Array.isArray(parsedTips)) {
          setHealthTips(parsedTips);
          console.log('Set healthTips state with', parsedTips.length, 'tips');

          // Generate random colors for each tip
          const colors = parsedTips.map(() => generateRandomColor());
          setCardColors(colors);

          // Restore last viewed card position
          const lastIndex = await getData('lastWellnessCardIndex');
          let newIndex = 0;
          if (lastIndex) {
            const parsedIndex = parseInt(lastIndex, 10);
            // Ensure the index is valid
            if (!isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < parsedTips.length) {
              newIndex = parsedIndex;
            }
          }
          setCurrentIndex(newIndex);
          console.log('Setting current index to:', newIndex);
        } else {
          console.log('Cached tips is not an array, fetching new tips');
          await fetchNewTips();
        }

        setLoading(false);
        
        // If we have cached tips but they're old, still fetch new ones in background
        if (Array.isArray(parsedTips) && parsedTips.length > 0) {
          fetchNewTipsInBackground();
        }
      } else {
        // If no cached data, fetch from API
        console.log('No cached tips, fetching from API');
        await fetchNewTips();
      }
    } catch (err) {
      console.error('Error loading health tips:', err);
      setError('Failed to load health tips. Please try again.');
      setLoading(false);
      // Even if loading fails, try to fetch fresh data
      await fetchNewTips();
    }
  };

  const fetchNewTipsInBackground = async () => {
    try {
      const tips = await fetchHealthTips();
      // Ensure tips is an array and not undefined/null
      const validTips = Array.isArray(tips) ? tips : [];
      if (validTips.length > 0) {
        setHealthTips(validTips);
        // Generate random colors for each tip
        const colors = validTips.map(() => generateRandomColor());
        setCardColors(colors);
        // Cache the tips
        await storeData('healthTips', JSON.stringify(validTips));
        console.log('Fetched and cached new tips in background:', validTips.length);
      }
    } catch (err) {
      console.error('Error fetching health tips in background:', err);
      // Don't show error to user for background fetch
    }
  };

  const fetchNewTips = async () => {
    setLoading(true);
    setError(null); // Clear any previous errors
    try {
      console.log('Fetching new health tips from API');
      const tips = await fetchHealthTips();
      console.log('Received tips from API:', tips?.length || 0);
      
      // Ensure tips is an array and not undefined/null
      let validTips = Array.isArray(tips) ? tips : [];
      console.log('Valid tips count:', validTips.length);
      
      setHealthTips(validTips);
      console.log('Set healthTips state with', validTips.length, 'tips');

      // Generate random colors for each tip
      const colors = validTips.map(() => generateRandomColor());
      setCardColors(colors);

      setCurrentIndex(0);
      console.log('Set current index to 0');
      
      // Cache the tips
      if (validTips.length > 0) {
        await storeData('healthTips', JSON.stringify(validTips));
      }
      setLoading(false);
      
      if (validTips.length === 0) {
        setError('No health tips available at the moment. Please try again later.');
      }
    } catch (err) {
      console.error('Error fetching health tips:', err);
      setError('Failed to fetch health tips. Please check your connection and try again.');
      setLoading(false);
      
      // If we have cached data, show it even if fetching new data fails
      const cachedTips = await getData('healthTips');
      if (cachedTips) {
        try {
          const parsedTips = JSON.parse(cachedTips);
          if (Array.isArray(parsedTips) && parsedTips.length > 0) {
            setHealthTips(parsedTips);
            const colors = parsedTips.map(() => generateRandomColor());
            setCardColors(colors);
            setCurrentIndex(0);
            console.log('Falling back to cached tips:', parsedTips.length);
            return;
          }
        } catch (parseErr) {
          console.error('Error parsing cached tips:', parseErr);
        }
      }
    }
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const swipeLeft = () => {
    const currentTips = healthTipsRef.current;
    const currentIdx = currentIndexRef.current;
    
    console.log('SwipeLeft called. Current index:', currentIdx, 'Total tips:', currentTips.length);
    if (currentIdx >= currentTips.length - 1 || currentTips.length === 0) {
      console.log('Already at last card or no tips available, resetting position');
      resetPosition();
      return;
    }
    
    console.log('Proceeding with swipe left animation');
    Animated.timing(position, {
      toValue: { x: -SCREEN_WIDTH * 1.5, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: true,
      easing: Easing.out(Easing.exp),
    }).start(() => {
      const newIndex = currentIdx + 1;
      console.log('Animation complete, setting new index:', newIndex);
      setCurrentIndex(newIndex);
      position.setValue({ x: 0, y: 0 });
    });
  };

  const swipeRight = () => {
    const currentTips = healthTipsRef.current;
    const currentIdx = currentIndexRef.current;
    
    console.log('SwipeRight called. Current index:', currentIdx, 'Total tips:', currentTips.length);
    if (currentIdx <= 0 || currentTips.length === 0) {
      console.log('Already at first card or no tips available, resetting position');
      resetPosition();
      return;
    }
    
    Animated.timing(position, {
      toValue: { x: SCREEN_WIDTH * 1.5, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: true,
      easing: Easing.out(Easing.exp),
    }).start(() => {
      const newIndex = currentIdx - 1;
      console.log('Animation complete, setting new index:', newIndex);
      setCurrentIndex(newIndex);
      position.setValue({ x: 0, y: 0 });
    });
  };

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      outputRange: ['-10deg', '0deg', '10deg'],
      extrapolate: 'clamp'
    });

    const opacity = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp'
    });

    return {
      transform: [
        { translateX: position.x },
        { rotate }
      ],
      opacity
    };
  };

  const renderCard = () => {
    console.log('Rendering card - Current index:', currentIndex, 'Health tips length:', healthTips.length);
    
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>{t('wellness.loading')}</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchNewTips}>
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (healthTips.length === 0 || currentIndex < 0 || currentIndex >= healthTips.length) {
      console.log('No tips to display or invalid index');
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('wellness.noTips')}</Text>
        </View>
      );
    }

    // Render multiple cards for stack effect
    const cardsToRender = Math.min(3, healthTips.length - currentIndex);
    console.log('Cards to render:', cardsToRender);
    
    return (
      <View style={styles.cardWrapper}>
        {Array.from({ length: cardsToRender }).map((_, index) => {
          const cardIndex = currentIndex + index;
          if (cardIndex >= healthTips.length) return null;
          
          const tip = healthTips[cardIndex];
          const isCurrentCard = index === 0;
          const cardColor = cardColors[cardIndex] || '#FFFFFF';
          
          // Calculate scale and position for stack effect
          const scale = 1 - (index * 0.03);
          const translateY = index * 8;
          
          return (
            <Animated.View
              key={tip.id}
              style={[
                styles.card,
                {
                  backgroundColor: cardColor,
                  transform: [
                    { scale: isCurrentCard ? position.x.interpolate({
                      inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                      outputRange: [0.95, 1, 0.95],
                      extrapolate: 'clamp'
                    }) : scale },
                    { translateY: isCurrentCard ? position.y : translateY },
                    { translateX: isCurrentCard ? position.x : 0 },
                    { rotate: isCurrentCard ? position.x.interpolate({
                      inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                      outputRange: ['-10deg', '0deg', '10deg'],
                      extrapolate: 'clamp'
                    }) : '0deg' }
                  ],
                  zIndex: 3 - index, // Ensure proper stacking
                  elevation: 5 - index,
                  opacity: isCurrentCard ? 1 : 0.9 - (index * 0.1),
                }
              ]}
              {...(isCurrentCard ? panResponder.panHandlers : {})}
            >
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{tip?.category || ''}</Text>
              </View>
              <Text style={styles.cardTitle}>{tip?.title || ''}</Text>
              <Text style={styles.cardContent}>{tip?.content || ''}</Text>
              <View style={styles.cardFooter} />
            </Animated.View>
          );
        })}
        
        {/* Swipe direction hints */}
        <View style={styles.swipeHintContainer}>
          <Text style={styles.swipeHintText}>{t('wellness.swipeHint')}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('wellness.title')}</Text>
      </View>
      <View style={styles.cardContainer}>{renderCard()}</View>
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[styles.navButton, (currentIndex <= 0 || healthTips.length === 0) && styles.disabledButton]}
          onPress={swipeRight}
          disabled={currentIndex <= 0 || healthTips.length === 0}
        >
          <Text style={styles.navButtonText}>{t('common.previous')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.navButton,
            (currentIndex >= healthTips.length - 1 || healthTips.length === 0) && styles.disabledButton,
          ]}
          onPress={() => {
            console.log('Next button pressed');
            swipeLeft();
          }}
          disabled={currentIndex >= healthTips.length - 1 || healthTips.length === 0}
        >
          <Text style={styles.navButtonText}>{t('common.next')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    marginTop: Platform.OS === 'android' ? SCREEN_HEIGHT * 0.04 : 0, // Responsive status bar height for Android (4% of screen height)
  },
  headerTitle: {
    fontSize: HEADER_TITLE_FONT_SIZE,
    fontFamily: Typography.fontFamily.bold,
    color: theme.colors.text.primary,
    marginVertical: Spacing.sm,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  cardWrapper: {
    width: CARD_WRAPPER_WIDTH,
    height: CARD_WRAPPER_HEIGHT,
    position: 'relative',
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: CARD_BORDER_RADIUS,
    padding: Spacing.lg,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  categoryBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: theme.colors.primary[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: CATEGORY_BADGE_BORDER_RADIUS,
  },
  categoryText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: CATEGORY_TEXT_FONT_SIZE,
    color: theme.colors.primary[600],
  },
  cardTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: CARD_TITLE_FONT_SIZE,
    color: theme.colors.text.primary,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  cardContent: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: CARD_CONTENT_FONT_SIZE,
    color: theme.colors.text.secondary,
    lineHeight: CARD_CONTENT_LINE_HEIGHT,
  },
  cardFooter: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
  },
  cardCounter: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: CARD_COUNTER_FONT_SIZE,
    color: theme.colors.text.tertiary,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl + (SCREEN_HEIGHT * 0.08), // Extra padding for tab bar (8% of screen height)
  },
  navButton: {
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: NAV_BUTTON_PADDING_HORIZONTAL,
    paddingVertical: NAV_BUTTON_PADDING_VERTICAL,
    borderRadius: NAV_BUTTON_BORDER_RADIUS,
    minWidth: MIN_NAV_BUTTON_WIDTH,
    alignItems: 'center',
  },
  navButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: NAV_BUTTON_TEXT_FONT_SIZE,
    color: theme.colors.text.inverse,
  },
  disabledButton: {
    backgroundColor: theme.colors.surfaceSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: LOADING_TEXT_FONT_SIZE,
    color: theme.colors.text.secondary,
    marginTop: Spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  errorText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: ERROR_TEXT_FONT_SIZE,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  retryButton: {
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: RETRY_BUTTON_BORDER_RADIUS,
  },
  retryButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: RETRY_BUTTON_TEXT_FONT_SIZE,
    color: theme.colors.text.inverse,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emptyText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: EMPTY_TEXT_FONT_SIZE,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  swipeHintContainer: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * -0.05, // 5% of screen height
    width: '100%',
    alignItems: 'center',
  },
  swipeHintText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: SWIPE_HINT_TEXT_FONT_SIZE,
    color: theme.colors.text.tertiary,
  },
});