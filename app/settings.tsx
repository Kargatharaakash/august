import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ScrollView,
  Switch,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

import { useTheme, ThemeMode } from '@/contexts/ThemeContext';
import { getSupportedLanguages, changeLanguage, getCurrentLanguage } from '@/i18n';
import Typography from '@/constants/Typography';
import Spacing from '@/constants/Spacing';
import Icons from '@/constants/Icons';

// Get screen dimensions for responsive design
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive sizing calculations
const HEADER_TITLE_FONT_SIZE = SCREEN_WIDTH * 0.055; // 5.5% of screen width
const SECTION_TITLE_FONT_SIZE = SCREEN_WIDTH * 0.035; // 3.5% of screen width
const SETTING_TITLE_FONT_SIZE = SCREEN_WIDTH * 0.04; // 4% of screen width
const SETTING_SUBTITLE_FONT_SIZE = SCREEN_WIDTH * 0.035; // 3.5% of screen width
const SETTING_VALUE_FONT_SIZE = SCREEN_WIDTH * 0.035; // 3.5% of screen width
const LOGOUT_TEXT_FONT_SIZE = SCREEN_WIDTH * 0.04; // 4% of screen width

const SETTING_ICON_SIZE = SCREEN_WIDTH * 0.104; // 10.4% of screen width
const SETTING_ICON_RADIUS = SETTING_ICON_SIZE / 2;
const BACK_BUTTON_BORDER_RADIUS = SCREEN_WIDTH * 0.03; // 3% of screen width
const HEADER_ACTION_SIZE = SCREEN_WIDTH * 0.115; // 11.5% of screen width
const SETTING_SECTION_BORDER_RADIUS = SCREEN_WIDTH * 0.04; // 4% of screen width
const LOGOUT_BUTTON_BORDER_RADIUS = SCREEN_WIDTH * 0.04; // 4% of screen width
const HEADER_PADDING_VERTICAL = SCREEN_WIDTH * 0.03; // 3% of screen width
const HEADER_PADDING_HORIZONTAL = SCREEN_WIDTH * 0.05; // 5% of screen width
const SECTION_TITLE_MARGIN_BOTTOM = SCREEN_WIDTH * 0.03; // 3% of screen width
const SECTION_TITLE_MARGIN_HORIZONTAL = SCREEN_WIDTH * 0.05; // 5% of screen width
const SECTION_CONTENT_MARGIN_HORIZONTAL = SCREEN_WIDTH * 0.05; // 5% of screen width
const SECTION_CONTENT_MARGIN_BOTTOM = SCREEN_WIDTH * 0.05; // 5% of screen width
const SETTING_ITEM_PADDING_VERTICAL = SCREEN_WIDTH * 0.03; // 3% of screen width
const SETTING_ITEM_PADDING_HORIZONTAL = SCREEN_WIDTH * 0.05; // 5% of screen width
const SETTING_ICON_MARGIN_RIGHT = SCREEN_WIDTH * 0.03; // 3% of screen width
const SETTING_TITLE_MARGIN_BOTTOM = SCREEN_HEIGHT * 0.001; // 0.1% of screen height
const SETTING_VALUE_MARGIN_RIGHT = SCREEN_WIDTH * 0.03; // 3% of screen width
const LOGOUT_BUTTON_MARGIN_HORIZONTAL = SCREEN_WIDTH * 0.05; // 5% of screen width
const LOGOUT_BUTTON_MARGIN_TOP = SCREEN_WIDTH * 0.05; // 5% of screen width
const LOGOUT_BUTTON_PADDING_VERTICAL = SCREEN_WIDTH * 0.05; // 5% of screen width
const BACK_BUTTON_PADDING = SCREEN_WIDTH * 0.025; // 2.5% of screen width
const SCROLL_CONTENT_PADDING_BOTTOM = SCREEN_WIDTH * 0.05; // 5% of screen width
const FOOTER_HEIGHT = SCREEN_WIDTH * 0.05; // 5% of screen width
const SECTION_TITLE_LETTER_SPACING = SCREEN_WIDTH * 0.0013; // 0.13% of screen width

interface SettingItemProps {
  icon: any;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchToggle?: (value: boolean) => void;
  theme: any;
  styles: any;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon: Icon,
  title,
  subtitle,
  value,
  onPress,
  showArrow = true,
  showSwitch = false,
  switchValue = false,
  onSwitchToggle,
  theme,
  styles,
}) => (
  <TouchableOpacity 
    style={styles.settingItem}
    onPress={onPress}
    activeOpacity={0.7}
    disabled={showSwitch}
  >
    <View style={styles.settingItemLeft}>
      <View style={[styles.settingIcon, { backgroundColor: theme.colors.primary[50] }]}>
        <Icon size={20} color={theme.colors.primary[500]} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    <View style={styles.settingItemRight}>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchToggle}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary[200] }}
          thumbColor={switchValue ? theme.colors.primary[500] : theme.colors.surface}
          ios_backgroundColor={theme.colors.border}
        />
      ) : showArrow ? (
        <Icons.Next size={20} color={theme.colors.text.tertiary} />
      ) : null}
    </View>
  </TouchableOpacity>
);

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
  theme: any;
  styles: any;
}

const SettingSection: React.FC<SettingSectionProps> = ({ title, children, theme, styles }) => (
  <View style={styles.settingSection}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>
      {children}
    </View>
  </View>
);

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, themeMode, setThemeMode } = useTheme();
  const { t, i18n } = useTranslation();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [medicationReminders, setMedicationReminders] = useState(true);
  const [dataSync, setDataSync] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);

  const styles = getStyles(theme);
  const supportedLanguages = getSupportedLanguages();
  const currentLanguage = getCurrentLanguage();

  const handleThemeChange = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Alert.alert(
      t('settings.selectTheme'),
      '',
      [
        {
          text: t('settings.lightMode'),
          onPress: () => setThemeMode('light'),
        },
        {
          text: t('settings.darkMode'),
          onPress: () => setThemeMode('dark'),
        },
        {
          text: t('settings.systemMode'),
          onPress: () => setThemeMode('system'),
        },
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
      ]
    );
  };

  const handleLanguageChange = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const languageOptions = supportedLanguages.map(lang => ({
      text: `${lang.nativeName} (${lang.name})`,
      onPress: async () => {
        await changeLanguage(lang.code);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
    }));

    Alert.alert(
      t('settings.selectLanguage'),
      '',
      [
        ...languageOptions,
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
      ]
    );
  };

  const getThemeDisplayName = () => {
    switch (themeMode) {
      case 'light': return t('settings.lightMode');
      case 'dark': return t('settings.darkMode');
      case 'system': return t('settings.systemMode');
      default: return t('settings.systemMode');
    }
  };

  const getCurrentLanguageDisplay = () => {
    const lang = supportedLanguages.find(l => l.code === currentLanguage);
    return lang ? `${lang.nativeName} (${lang.name})` : 'English';
  };

  const handleContactSupport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL('mailto:support@august.ai?subject=Support Request');
  };

  const handlePrivacyPolicy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL('https://august.ai/privacy');
  };

  const handleTermsOfService = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL('https://august.ai/terms');
  };

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      t('settings.logout'),
      'Are you sure you want to logout?',
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('settings.logout'),
          style: 'destructive',
          onPress: () => {
            // Handle logout logic here
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['left', 'right', 'bottom']}>
      <StatusBar barStyle={theme.mode === 'dark' ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <Icons.Back size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        
        <View style={styles.headerAction} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Appearance Section */}
        <SettingSection title={t('settings.appearance')} theme={theme} styles={styles}>
          <SettingItem
            icon={Icons.Settings}
            title={t('settings.theme')}
            subtitle={t('settings.themeSubtitle')}
            value={getThemeDisplayName()}
            onPress={handleThemeChange}
            theme={theme}
            styles={styles}
          />
        </SettingSection>

        {/* Language Section */}
        <SettingSection title={t('settings.language')} theme={theme} styles={styles}>
          <SettingItem
            icon={Icons.Chat}
            title={t('settings.language')}
            subtitle={t('settings.languageSubtitle')}
            value={getCurrentLanguageDisplay()}
            onPress={handleLanguageChange}
            theme={theme}
            styles={styles}
          />
        </SettingSection>

        {/* Notifications Section */}
        <SettingSection title={t('settings.notifications')} theme={theme} styles={styles}>
          <SettingItem
            icon={Icons.Notifications}
            title={t('settings.pushNotifications')}
            subtitle={t('settings.pushNotificationsSubtitle')}
            showSwitch={true}
            switchValue={notificationsEnabled}
            onSwitchToggle={setNotificationsEnabled}
            showArrow={false}
            theme={theme}
            styles={styles}
          />
          <SettingItem
            icon={Icons.Time}
            title={t('settings.medicationReminders')}
            subtitle={t('settings.medicationRemindersSubtitle')}
            showSwitch={true}
            switchValue={medicationReminders}
            onSwitchToggle={setMedicationReminders}
            showArrow={false}
            theme={theme}
            styles={styles}
          />
        </SettingSection>

        {/* Privacy & Security Section */}
        <SettingSection title={t('settings.privacy')} theme={theme} styles={styles}>
          <SettingItem
            icon={Icons.Settings}
            title="Biometric Authentication"
            subtitle="Use Face ID or fingerprint to secure app"
            showSwitch={true}
            switchValue={biometricAuth}
            onSwitchToggle={setBiometricAuth}
            showArrow={false}
            theme={theme}
            styles={styles}
          />
          <SettingItem
            icon={Icons.Share}
            title="Data Synchronization"
            subtitle="Sync your health data across devices"
            showSwitch={true}
            switchValue={dataSync}
            onSwitchToggle={setDataSync}
            showArrow={false}
            theme={theme}
            styles={styles}
          />
          <SettingItem
            icon={Icons.Settings}
            title={t('settings.privacyPolicy')}
            subtitle="View our privacy policy"
            onPress={handlePrivacyPolicy}
            theme={theme}
            styles={styles}
          />
        </SettingSection>

        {/* Support Section */}
        <SettingSection title={t('settings.support')} theme={theme} styles={styles}>
          <SettingItem
            icon={Icons.Help}
            title={t('settings.contactSupport')}
            subtitle="Get help with the app"
            onPress={handleContactSupport}
            theme={theme}
            styles={styles}
          />
          <SettingItem
            icon={Icons.MedicalRecord}
            title={t('settings.termsOfService')}
            subtitle="Read our terms of service"
            onPress={handleTermsOfService}
            theme={theme}
            styles={styles}
          />
        </SettingSection>

        {/* About Section */}
        <SettingSection title={t('settings.about')} theme={theme} styles={styles}>
          <SettingItem
            icon={Icons.Info}
            title={t('settings.version')}
            subtitle="August.ai Health Assistant"
            value="1.0.0"
            showArrow={false}
            theme={theme}
            styles={styles}
          />
        </SettingSection>

        {/* Logout */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Icons.Logout size={20} color={theme.colors.error} />
          <Text style={[styles.logoutText, { color: theme.colors.error }]}>
            {t('settings.logout')}
          </Text>
        </TouchableOpacity>

        {/* Footer Spacing */}
        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HEADER_PADDING_HORIZONTAL,
    paddingVertical: HEADER_PADDING_VERTICAL,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + HEADER_PADDING_VERTICAL : HEADER_PADDING_VERTICAL,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: BACK_BUTTON_PADDING,
    borderRadius: BACK_BUTTON_BORDER_RADIUS,
    backgroundColor: theme.colors.surface,
  },
  headerTitle: {
    fontSize: HEADER_TITLE_FONT_SIZE,
    fontFamily: Typography.fontFamily.bold,
    color: theme.colors.text.primary,
  },
  headerAction: {
    width: HEADER_ACTION_SIZE,
    height: HEADER_ACTION_SIZE,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SCROLL_CONTENT_PADDING_BOTTOM,
  },
  settingSection: {
    marginBottom: SECTION_CONTENT_MARGIN_BOTTOM,
  },
  sectionTitle: {
    fontSize: SECTION_TITLE_FONT_SIZE,
    fontFamily: Typography.fontFamily.bold,
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: SECTION_TITLE_LETTER_SPACING,
    marginBottom: SECTION_TITLE_MARGIN_BOTTOM,
    marginHorizontal: SECTION_TITLE_MARGIN_HORIZONTAL,
  },
  sectionContent: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: SECTION_CONTENT_MARGIN_HORIZONTAL,
    borderRadius: SETTING_SECTION_BORDER_RADIUS,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SETTING_ITEM_PADDING_HORIZONTAL,
    paddingVertical: SETTING_ITEM_PADDING_VERTICAL,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: SETTING_ICON_SIZE,
    height: SETTING_ICON_SIZE,
    borderRadius: SETTING_ICON_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SETTING_ICON_MARGIN_RIGHT,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: SETTING_TITLE_FONT_SIZE,
    fontFamily: Typography.fontFamily.bold,
    color: theme.colors.text.primary,
    marginBottom: SETTING_TITLE_MARGIN_BOTTOM,
  },
  settingSubtitle: {
    fontSize: SETTING_SUBTITLE_FONT_SIZE,
    fontFamily: Typography.fontFamily.regular,
    color: theme.colors.text.secondary,
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: SETTING_VALUE_FONT_SIZE,
    fontFamily: Typography.fontFamily.medium,
    color: theme.colors.text.secondary,
    marginRight: SETTING_VALUE_MARGIN_RIGHT,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: LOGOUT_BUTTON_MARGIN_HORIZONTAL,
    borderRadius: LOGOUT_BUTTON_BORDER_RADIUS,
    paddingVertical: LOGOUT_BUTTON_PADDING_VERTICAL,
    borderWidth: 1,
    borderColor: theme.colors.error + '20',
    marginTop: LOGOUT_BUTTON_MARGIN_TOP,
  },
  logoutText: {
    fontSize: LOGOUT_TEXT_FONT_SIZE,
    fontFamily: Typography.fontFamily.bold,
    marginLeft: SETTING_ICON_MARGIN_RIGHT,
  },
  footer: {
    height: FOOTER_HEIGHT,
  },
});