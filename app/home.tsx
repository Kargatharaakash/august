import React from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { MessageCircle, Camera, Search, Edit, FileText, Scan, User, Bell, ClipboardList } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import Typography from '@/constants/Typography';
import Spacing from '@/constants/Spacing';
import ActionButton from '@/components/ActionButton';

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
            style={styles.avatarContainer}
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch (error) {
                console.warn('Haptics not available:', error);
              }
              router.push('/profile');
            }}
          >
            <Image source={require('../assets/icon.png')} style={styles.avatar} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.notificationContainer}
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch (error) {
                console.warn('Haptics not available:', error);
              }
              router.push('/notifications');
            }}
          >
            <Bell size={32} color={colors.primary[600]} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.header}>
          <Text style={styles.greeting}>{t('home.greeting', { name: 'Raj' })}</Text>
          <Text style={styles.question}>{t('home.question')}</Text>
        </View>

        <View style={styles.actionsGrid}>
          <View style={styles.actionsRow}>
            <ActionButton
              title={t('home.aiChat')}
              backgroundColor={aiChatColor}
              icon={<MessageCircle size={36} color={colors.primary[600]} />}
              onPress={() => navigateTo('/chat')}
            />
            
            <ActionButton
              title={t('home.prescription')}
              backgroundColor={prescriptionColor}
              icon={<Scan size={36} color={colors.primary[600]} />}
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
              icon={<FileText size={36} color={colors.primary[600]} />}
              onPress={() => navigateTo('/wellness')}
            />
            
            <ActionButton
                title={t('home.records')}
                backgroundColor={recordsColor}
                icon={<ClipboardList size={36} color={colors.primary[600]} />}
                onPress={() => navigateTo('/records', false)}
              />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.searchContainer} 
          onPress={() => navigateTo('/chat')}
        >
          <Search size={24} color={colors.text.tertiary} />
          <Text style={[styles.searchPlaceholder, { color: colors.text.tertiary }]}>{t('home.searchPlaceholder')}</Text>
        </TouchableOpacity>

        <View style={styles.bottomActions}>
          <View style={styles.bottomNavContainer}>
            <TouchableOpacity 
              style={[styles.bottomNavButton, styles.whiteButton]}
              onPress={() => {
                console.log('Bottom nav: Navigating to prescription');
                router.push('/prescription');
              }}
            >
              <FileText size={24} color={colors.text.primary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.bottomNavButton, styles.greenButton]}
              onPress={() => router.push('/chat')}
            >
             <MessageCircle size={24} color={colors.text.inverse} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.floatingActionButton}
          onPress={() => navigateTo('/chat')}
        >
          <View style={styles.fabInner}>
            <Text style={styles.fabText}>+</Text>
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  notificationContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.primary[600],
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  header: {
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
  },
  greeting: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 36, // Reduced to half size
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  question: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 36, // Reduced to half size
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
    fontSize: Typography.fontSize.lg,
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
    borderRadius: 35,
    padding: 12,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  bottomNavButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  floatingActionButton: {
    position: 'absolute',
    bottom: 10,
    right: 20,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  fabInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
  },
  whiteButton: {
    backgroundColor: colors.text.inverse,
  },
  greenButton: {
    backgroundColor: colors.primary[600],
  },
});