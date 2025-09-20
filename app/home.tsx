import React from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { MessageCircle, Camera, Search, Edit, FileText, Scan, User, Bell, ClipboardList } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import Typography from '@/constants/Typography';
import Spacing from '@/constants/Spacing';
import ActionButton from '@/components/ActionButton';

// Get screen dimensions for responsive design
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive sizing calculations
const AVATAR_SIZE = SCREEN_WIDTH * 0.13; // 13% of screen width
const AVATAR_RADIUS = AVATAR_SIZE / 2;
const NOTIFICATION_BADGE_SIZE = SCREEN_WIDTH * 0.05; // 5% of screen width
const NOTIFICATION_BADGE_RADIUS = NOTIFICATION_BADGE_SIZE / 2;
const GREETING_FONT_SIZE = SCREEN_WIDTH * 0.1; // 10% of screen width
const QUESTION_FONT_SIZE = SCREEN_WIDTH * 0.1; // 10% of screen width
const SEARCH_PLACEHOLDER_FONT_SIZE = SCREEN_WIDTH * 0.045; // 4.5% of screen width
const BOTTOM_NAV_WIDTH = SCREEN_WIDTH * 0.35; // 35% of screen width
const BOTTOM_NAV_HEIGHT = SCREEN_WIDTH * 0.15; // 15% of screen width
const BOTTOM_NAV_RADIUS = BOTTOM_NAV_HEIGHT / 2;
const BOTTOM_NAV_BUTTON_SIZE = SCREEN_WIDTH * 0.13; // 13% of screen width
const BOTTOM_NAV_BUTTON_RADIUS = BOTTOM_NAV_BUTTON_SIZE / 2;
const FAB_SIZE = SCREEN_WIDTH * 0.18; // 18% of screen width
const FAB_RADIUS = FAB_SIZE / 2;
const FAB_INNER_SIZE = SCREEN_WIDTH * 0.13; // 13% of screen width
const FAB_INNER_RADIUS = FAB_INNER_SIZE / 2;
const FAB_TEXT_SIZE = SCREEN_WIDTH * 0.08; // 8% of screen width

// Define the green color to be used consistently
const GREEN_COLOR = '#1f6e55';

export default function HomeScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const colors = theme.colors;
  const styles = createStyles(colors);

  // Improved colors with better contrast for dark mode
  const aiChatColor = isDark ? '#3d2626' : '#FFE6E6'; // Soft pink with better contrast
  const prescriptionColor = isDark ? '#263242' : '#E6F7FF'; // Light blue with better contrast
  const wellnessColor = isDark ? '#263026' : '#F0FFEB'; // Soft green with better contrast
  const recordsColor = isDark ? '#362642' : '#F5E6FF'; // Light purple with better contrast

  const navigateTo = (route: string, isComingSoon: boolean = false) => {
    if (isComingSoon) {
      // For coming soon features, we'll pass the feature name to the coming soon screen
      router.push({
        pathname: '/coming-soon',
        params: { feature: route.replace('/', '') }
      });
    } else {
      router.push(route);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['left', 'right', 'bottom']}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.appBar}>
          <TouchableOpacity 
            style={[styles.avatarContainer, { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_RADIUS }]}
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch (error) {
                console.warn('Haptics not available:', error);
              }
              router.push('/profile');
            }}
          >
            <Image source={require('../assets/icon.png')} style={[styles.avatar, { width: AVATAR_SIZE * 0.64, height: AVATAR_SIZE * 0.64, borderRadius: AVATAR_SIZE * 0.32 }]} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.notificationContainer, { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_RADIUS }]}
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch (error) {
                console.warn('Haptics not available:', error);
              }
              router.push('/notifications');
            }}
          >
            <Bell size={AVATAR_SIZE * 0.64} color={GREEN_COLOR} />
            <View style={[styles.notificationBadge, { 
              top: AVATAR_SIZE * 0.16, 
              right: AVATAR_SIZE * 0.16, 
              width: NOTIFICATION_BADGE_SIZE, 
              height: NOTIFICATION_BADGE_SIZE, 
              borderRadius: NOTIFICATION_BADGE_RADIUS 
            }]}>
              <Text style={[styles.notificationCount, { fontSize: NOTIFICATION_BADGE_SIZE * 0.6 }]}>{'3'}</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.header}>
          <Text style={[styles.greeting, { fontSize: GREETING_FONT_SIZE }]}>{t('home.greeting', { name: 'Raj' })}</Text>
          <Text style={[styles.question, { fontSize: QUESTION_FONT_SIZE }]}>{t('home.question')}</Text>
        </View>

        <View style={styles.actionsGrid}>
          <View style={styles.actionsRow}>
            <ActionButton
              title={t('home.aiChat')}
              backgroundColor={aiChatColor}
              icon={<MessageCircle size={SCREEN_WIDTH * 0.09} color={GREEN_COLOR} />}
              onPress={() => navigateTo('/chat')}
            />
            
            <ActionButton
              title={t('home.prescription')}
              backgroundColor={prescriptionColor}
              icon={<Scan size={SCREEN_WIDTH * 0.09} color={GREEN_COLOR} />}
              onPress={() => {
                console.log('Grid button: Navigating to prescription');
                router.push('/prescription');
              }}
            />
          </View>

          <View style={styles.actionsRow}>
            <ActionButton
              title={t('home.wellness')}
              backgroundColor={wellnessColor}
              icon={<FileText size={SCREEN_WIDTH * 0.09} color={GREEN_COLOR} />}
              onPress={() => navigateTo('/wellness')}
            />
            
            <ActionButton
                title={t('home.records')}
                backgroundColor={recordsColor}
                icon={<ClipboardList size={SCREEN_WIDTH * 0.09} color={GREEN_COLOR} />}
                onPress={() => navigateTo('/records', false)}
              />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.searchContainer} 
          onPress={() => navigateTo('/chat')}
        >
          <Search size={SCREEN_WIDTH * 0.06} color={colors.text.tertiary} />
          <Text style={[styles.searchPlaceholder, { color: colors.text.tertiary, fontSize: SEARCH_PLACEHOLDER_FONT_SIZE }]}>{t('home.searchPlaceholder')}</Text>
        </TouchableOpacity>

        <View style={styles.bottomActions}>
          <View style={[styles.bottomNavContainer, { width: BOTTOM_NAV_WIDTH, height: BOTTOM_NAV_HEIGHT, borderRadius: BOTTOM_NAV_RADIUS }]}>
            <TouchableOpacity 
              style={[styles.bottomNavButton, styles.whiteButton, { width: BOTTOM_NAV_BUTTON_SIZE, height: BOTTOM_NAV_BUTTON_SIZE, borderRadius: BOTTOM_NAV_BUTTON_RADIUS }]}
              onPress={() => {
                console.log('Bottom nav: Navigating to prescription');
                router.push('/prescription');
              }}
            >
              <FileText size={SCREEN_WIDTH * 0.06} color={colors.text.primary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.bottomNavButton, styles.greenButton, { width: BOTTOM_NAV_BUTTON_SIZE, height: BOTTOM_NAV_BUTTON_SIZE, borderRadius: BOTTOM_NAV_BUTTON_RADIUS }]}
              onPress={() => router.push('/chat')}
            >
             <MessageCircle size={SCREEN_WIDTH * 0.06} color={colors.text.inverse} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.floatingActionButton, { width: FAB_SIZE, height: FAB_SIZE, borderRadius: FAB_RADIUS }]}
          onPress={() => navigateTo('/chat')}
        >
          <View style={[styles.fabInner, { width: FAB_INNER_SIZE, height: FAB_INNER_SIZE, borderRadius: FAB_INNER_RADIUS }]}>
            <Text style={[styles.fabText, { fontSize: FAB_TEXT_SIZE }]}>+</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 100, // Add padding to account for bottom navigation
    position: 'relative',
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  avatarContainer: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    borderRadius: 16,
  },
  notificationContainer: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    backgroundColor: '#1f6e55',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  header: {
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
  },
  greeting: {
    fontFamily: Typography.fontFamily.bold,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  question: {
    fontFamily: Typography.fontFamily.bold,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  actionsGrid: {
    marginBottom: Spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  emptyButton: {
    width: '48%',
    height: 150,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 36,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.xl,
    marginTop: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    width: '100%',
  },
  searchPlaceholder: {
    fontFamily: Typography.fontFamily.semiBold,
    color: colors.text.tertiary,
    marginLeft: Spacing.lg,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 10,
    left: 20, // Position to left side
    // Remove right: 20 to allow left alignment
  },
  bottomNavContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.text.primary,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  bottomNavButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  floatingActionButton: {
    position: 'absolute',
    bottom: 10,
    right: 20,
    backgroundColor: '#1f6e55',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  fabInner: {
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  whiteButton: {
    backgroundColor: colors.text.inverse,
  },
  greenButton: {
    backgroundColor: '#1f6e55',
  },
});
