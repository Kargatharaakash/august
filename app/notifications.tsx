/**
 * August.ai Notifications Screen
 * Premium notification center with categorized notifications and actions
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ScrollView,
  Animated,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/contexts/ThemeContext';
import Typography from '@/constants/Typography';
import Spacing from '@/constants/Spacing';
import Icons from '@/constants/Icons';

// Get screen dimensions for responsive design
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive sizing calculations
const HEADER_TITLE_FONT_SIZE = SCREEN_WIDTH * 0.055; // 5.5% of screen width
const NOTIFICATION_TITLE_FONT_SIZE = SCREEN_WIDTH * 0.04; // 4% of screen width
const NOTIFICATION_MESSAGE_FONT_SIZE = SCREEN_WIDTH * 0.035; // 3.5% of screen width
const NOTIFICATION_TIME_FONT_SIZE = SCREEN_WIDTH * 0.03; // 3% of screen width
const NOTIFICATION_ACTION_TEXT_FONT_SIZE = SCREEN_WIDTH * 0.035; // 3.5% of screen width
const FILTER_CHIP_TEXT_FONT_SIZE = SCREEN_WIDTH * 0.035; // 3.5% of screen width
const EMPTY_TITLE_FONT_SIZE = SCREEN_WIDTH * 0.045; // 4.5% of screen width
const EMPTY_SUBTITLE_FONT_SIZE = SCREEN_WIDTH * 0.04; // 4% of screen width
const UNREAD_BADGE_TEXT_FONT_SIZE = SCREEN_WIDTH * 0.025; // 2.5% of screen width

const NOTIFICATION_ICON_SIZE = SCREEN_WIDTH * 0.104; // 10.4% of screen width
const NOTIFICATION_ICON_RADIUS = NOTIFICATION_ICON_SIZE / 2;
const UNREAD_DOT_SIZE = SCREEN_WIDTH * 0.02; // 2% of screen width
const UNREAD_DOT_RADIUS = UNREAD_DOT_SIZE / 2;
const BACK_BUTTON_BORDER_RADIUS = SCREEN_WIDTH * 0.03; // 3% of screen width
const MARK_ALL_BUTTON_BORDER_RADIUS = SCREEN_WIDTH * 0.03; // 3% of screen width
const FILTER_CHIP_BORDER_RADIUS = SCREEN_WIDTH * 0.05; // 5% of screen width
const NOTIFICATION_ITEM_BORDER_RADIUS = SCREEN_WIDTH * 0.04; // 4% of screen width
const HEADER_PADDING_VERTICAL = SCREEN_WIDTH * 0.03; // 3% of screen width
const HEADER_PADDING_HORIZONTAL = SCREEN_WIDTH * 0.05; // 5% of screen width
const HEADER_TITLE_CONTAINER_MARGIN_LEFT = SCREEN_WIDTH * 0.03; // 3% of screen width
const UNREAD_BADGE_MARGIN_LEFT = SCREEN_WIDTH * 0.03; // 3% of screen width
const UNREAD_BADGE_PADDING_HORIZONTAL = SCREEN_WIDTH * 0.03; // 3% of screen width
const UNREAD_BADGE_PADDING_VERTICAL = SCREEN_HEIGHT * 0.002; // 0.2% of screen height
const UNREAD_BADGE_MIN_WIDTH = SCREEN_WIDTH * 0.064; // 6.4% of screen width
const UNREAD_BADGE_BORDER_RADIUS = SCREEN_WIDTH * 0.03; // 3% of screen width
const FILTER_CONTAINER_PADDING_BOTTOM = SCREEN_WIDTH * 0.03; // 3% of screen width
const FILTER_CHIP_PADDING_HORIZONTAL = SCREEN_WIDTH * 0.03; // 3% of screen width
const FILTER_CHIP_PADDING_VERTICAL = SCREEN_WIDTH * 0.02; // 2% of screen width
const FILTER_CHIP_MARGIN_RIGHT = SCREEN_WIDTH * 0.03; // 3% of screen width
const NOTIFICATION_HEADER_PADDING = SCREEN_WIDTH * 0.05; // 5% of screen width
const NOTIFICATION_ICON_MARGIN_RIGHT = SCREEN_WIDTH * 0.03; // 3% of screen width
const NOTIFICATION_META_MARGIN_BOTTOM = SCREEN_WIDTH * 0.015; // 1.5% of screen width
const NOTIFICATION_TITLE_MARGIN_RIGHT = SCREEN_WIDTH * 0.03; // 3% of screen width
const NOTIFICATION_MESSAGE_LINE_HEIGHT = SCREEN_WIDTH * 0.052; // 5.2% of screen width
const NOTIFICATION_MESSAGE_MARGIN_BOTTOM = SCREEN_WIDTH * 0.03; // 3% of screen width
const NOTIFICATION_ACTION_MARGIN_TOP = SCREEN_WIDTH * 0.015; // 1.5% of screen width
const NOTIFICATION_ACTION_TEXT_MARGIN_RIGHT = SCREEN_WIDTH * 0.015; // 1.5% of screen width
const UNREAD_DOT_POSITION_TOP = SCREEN_WIDTH * 0.05; // 5% of screen width
const UNREAD_DOT_POSITION_RIGHT = SCREEN_WIDTH * 0.05; // 5% of screen width
const EMPTY_CONTAINER_PADDING_VERTICAL = SCREEN_WIDTH * 0.1; // 10% of screen width
const EMPTY_CONTAINER_PADDING_HORIZONTAL = SCREEN_WIDTH * 0.05; // 5% of screen width
const EMPTY_TITLE_MARGIN_TOP = SCREEN_WIDTH * 0.05; // 5% of screen width
const EMPTY_TITLE_MARGIN_BOTTOM = SCREEN_WIDTH * 0.03; // 3% of screen width
const EMPTY_SUBTITLE_LINE_HEIGHT = SCREEN_WIDTH * 0.06; // 6% of screen width
const NOTIFICATIONS_LIST_PADDING_TOP = SCREEN_WIDTH * 0.03; // 3% of screen width
const NOTIFICATIONS_LIST_PADDING_HORIZONTAL = SCREEN_WIDTH * 0.05; // 5% of screen width
const NOTIFICATION_ITEM_MARGIN_BOTTOM = SCREEN_WIDTH * 0.03; // 3% of screen width
const BACK_BUTTON_PADDING = SCREEN_WIDTH * 0.025; // 2.5% of screen width
const MARK_ALL_BUTTON_PADDING = SCREEN_WIDTH * 0.025; // 2.5% of screen width
const SCROLL_CONTENT_PADDING_BOTTOM = SCREEN_WIDTH * 0.05; // 5% of screen width

interface Notification {
  id: string;
  type: 'medication' | 'appointment' | 'healthTip' | 'system' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  actionable?: boolean;
  actionText?: string;
  actionUrl?: string;
}

interface NotificationItemProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
  onAction?: (notification: Notification) => void;
  theme: any;
  styles: any;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onAction,
  theme,
  styles,
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'medication': return Icons.Medication;
      case 'appointment': return Icons.Calendar;
      case 'healthTip': return Icons.MedicalKit;
      case 'system': return Icons.Settings;
      case 'reminder': return Icons.Notifications;
      default: return Icons.Notifications;
    }
  };

  const getIconColor = () => {
    switch (notification.priority) {
      case 'high': return theme.colors.error;
      case 'medium': return theme.colors.warning;
      case 'low': return theme.colors.info;
      default: return theme.colors.primary[500];
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  const Icon = getIcon();
  const iconColor = getIconColor();

  return (
    <TouchableOpacity 
      style={[
        styles.notificationItem,
        !notification.isRead && styles.notificationItemUnread,
        { borderLeftColor: iconColor }
      ]}
      onPress={() => onPress(notification)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationHeader}>
        <View style={[styles.notificationIcon, { backgroundColor: iconColor + '15' }]}>
          <Icon size={20} color={iconColor} />
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.notificationMeta}>
            <Text style={styles.notificationTitle}>{notification.title}</Text>
            <Text style={styles.notificationTime}>{formatTime(notification.timestamp)}</Text>
          </View>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {notification.message}
          </Text>
          {notification.actionable && (
            <TouchableOpacity 
              style={styles.notificationAction}
              onPress={() => onAction?.(notification)}
              activeOpacity={0.7}
            >
              <Text style={[styles.notificationActionText, { color: iconColor }]}>
                {notification.actionText || 'Take Action'}
              </Text>
              <Icons.Next size={14} color={iconColor} />
            </TouchableOpacity>
          )}
        </View>
        {!notification.isRead && <View style={[styles.unreadDot, { backgroundColor: iconColor }]} />}
      </View>
    </TouchableOpacity>
  );
};

interface NotificationFilterProps {
  filters: string[];
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  theme: any;
  styles: any;
}

const NotificationFilter: React.FC<NotificationFilterProps> = ({
  filters,
  selectedFilter,
  onFilterChange,
  theme,
  styles,
}) => (
  <ScrollView 
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.filterContainer}
  >
    {filters.map((filter) => {
      const isSelected = selectedFilter === filter;
      return (
        <TouchableOpacity
          key={filter}
          style={[styles.filterChip, isSelected && styles.filterChipActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onFilterChange(filter);
          }}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.filterChipText,
            isSelected && styles.filterChipTextActive
          ]}>
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

export default function NotificationsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useTranslation();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const styles = getStyles(theme);

  const filters = ['all', 'medication', 'appointment', 'healthTip', 'system'];

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    const count = notifications.filter(n => !n.isRead).length;
    setUnreadCount(count);
  }, [notifications]);

  const loadNotifications = async () => {
    // Simulate loading notifications
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'medication',
        title: t('notifications.timeToTake'),
        message: 'Time to take your Aspirin 100mg. Don\'t forget to take it with food.',
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        isRead: false,
        priority: 'high',
        actionable: true,
        actionText: 'Mark as Taken',
      },
      {
        id: '2',
        type: 'appointment',
        title: t('notifications.upcomingAppointment'),
        message: 'You have a checkup with Dr. Smith tomorrow at 2:00 PM.',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        isRead: false,
        priority: 'medium',
        actionable: true,
        actionText: 'View Details',
      },
      {
        id: '3',
        type: 'healthTip',
        title: t('notifications.newHealthTip'),
        message: 'Daily walking for 30 minutes can reduce your risk of heart disease by up to 35%.',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        isRead: true,
        priority: 'low',
      },
      {
        id: '4',
        type: 'system',
        title: t('notifications.systemUpdate'),
        message: 'August.ai has been updated with new features and improvements.',
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        isRead: true,
        priority: 'low',
      },
      {
        id: '5',
        type: 'medication',
        title: 'Prescription Refill Reminder',
        message: 'Your prescription for Metformin is running low. Consider refilling soon.',
        timestamp: new Date(Date.now() - 172800000), // 2 days ago
        isRead: false,
        priority: 'medium',
        actionable: true,
        actionText: 'Refill Now',
      },
      {
        id: '6',
        type: 'healthTip',
        title: 'Hydration Reminder',
        message: 'Remember to drink 8 glasses of water daily to stay properly hydrated.',
        timestamp: new Date(Date.now() - 259200000), // 3 days ago
        isRead: true,
        priority: 'low',
      },
    ];
    
    setNotifications(mockNotifications);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Simulate refresh delay
    setTimeout(() => {
      loadNotifications();
      setIsRefreshing(false);
    }, 1000);
  };

  const markAllAsRead = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      t('notifications.markAllRead'),
      'Are you sure you want to mark all notifications as read?',
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('notifications.markAllRead'),
          onPress: () => {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleNotificationPress = (notification: Notification) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
    );
    
    // Handle navigation based on notification type
    switch (notification.type) {
      case 'medication':
        router.push('/records');
        break;
      case 'appointment':
        router.push('/records');
        break;
      case 'healthTip':
        router.push('/chat');
        break;
      default:
        break;
    }
  };

  const handleNotificationAction = (notification: Notification) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      notification.actionText || 'Take Action',
      `Action for: ${notification.title}`,
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: notification.actionText || 'Confirm',
          onPress: () => {
            // Handle specific actions
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const filteredNotifications = notifications.filter(notification => {
    if (selectedFilter === 'all') return true;
    return notification.type === selectedFilter;
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['left', 'right', 'bottom']}>
      <StatusBar barStyle={theme.mode === 'dark' ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <Icons.Back size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
            {unreadCount > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: theme.colors.error }]}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.markAllButton}
            onPress={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <Icons.Check size={20} color={unreadCount > 0 ? theme.colors.primary[500] : theme.colors.text.tertiary} />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <NotificationFilter
          filters={filters}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          theme={theme}
          styles={styles}
        />
      </Animated.View>

      {/* Notifications List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary[500]}
            colors={[theme.colors.primary[500]]}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icons.Notifications size={64} color={theme.colors.text.tertiary} />
            <Text style={styles.emptyTitle}>{t('notifications.noNotifications')}</Text>
            <Text style={styles.emptySubtitle}>{t('notifications.noNotificationsSubtitle')}</Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onPress={handleNotificationPress}
                onAction={handleNotificationAction}
                theme={theme}
                styles={styles}
              />
            ))}
          </View>
        )}
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
    backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HEADER_PADDING_HORIZONTAL,
    paddingVertical: HEADER_PADDING_VERTICAL,
  },
  backButton: {
    padding: BACK_BUTTON_PADDING,
    borderRadius: BACK_BUTTON_BORDER_RADIUS,
    backgroundColor: theme.colors.surface,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: HEADER_TITLE_CONTAINER_MARGIN_LEFT,
  },
  headerTitle: {
    fontSize: HEADER_TITLE_FONT_SIZE,
    fontFamily: Typography.fontFamily.bold,
    color: theme.colors.text.primary,
  },
  unreadBadge: {
    marginLeft: UNREAD_BADGE_MARGIN_LEFT,
    paddingHorizontal: UNREAD_BADGE_PADDING_HORIZONTAL,
    paddingVertical: UNREAD_BADGE_PADDING_VERTICAL,
    borderRadius: UNREAD_BADGE_BORDER_RADIUS,
    minWidth: UNREAD_BADGE_MIN_WIDTH,
    alignItems: 'center',
  },
  unreadBadgeText: {
    fontSize: UNREAD_BADGE_TEXT_FONT_SIZE,
    fontFamily: Typography.fontFamily.bold,
    color: theme.colors.text.inverse,
  },
  markAllButton: {
    padding: MARK_ALL_BUTTON_PADDING,
    borderRadius: MARK_ALL_BUTTON_BORDER_RADIUS,
    backgroundColor: theme.colors.surface,
  },
  filterContainer: {
    paddingHorizontal: HEADER_PADDING_HORIZONTAL,
    paddingBottom: FILTER_CONTAINER_PADDING_BOTTOM,
  },
  filterChip: {
    paddingHorizontal: FILTER_CHIP_PADDING_HORIZONTAL,
    paddingVertical: FILTER_CHIP_PADDING_VERTICAL,
    borderRadius: FILTER_CHIP_BORDER_RADIUS,
    backgroundColor: theme.colors.surface,
    marginRight: FILTER_CHIP_MARGIN_RIGHT,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary[50],
    borderColor: theme.colors.primary[200],
  },
  filterChipText: {
    fontSize: FILTER_CHIP_TEXT_FONT_SIZE,
    fontFamily: Typography.fontFamily.medium,
    color: theme.colors.text.secondary,
  },
  filterChipTextActive: {
    color: theme.colors.primary[500],
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SCROLL_CONTENT_PADDING_BOTTOM,
  },
  notificationsList: {
    paddingHorizontal: NOTIFICATIONS_LIST_PADDING_HORIZONTAL,
    paddingTop: NOTIFICATIONS_LIST_PADDING_TOP,
  },
  notificationItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: NOTIFICATION_ITEM_BORDER_RADIUS,
    marginBottom: NOTIFICATION_ITEM_MARGIN_BOTTOM,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderLeftWidth: 4,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: SCREEN_HEIGHT * 0.001 }, // 0.1% of screen height
    shadowOpacity: 0.05,
    shadowRadius: SCREEN_WIDTH * 0.01, // 1% of screen width
    elevation: 2,
  },
  notificationItemUnread: {
    backgroundColor: theme.colors.primary[50] + '30',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: NOTIFICATION_HEADER_PADDING,
    position: 'relative',
  },
  notificationIcon: {
    width: NOTIFICATION_ICON_SIZE,
    height: NOTIFICATION_ICON_SIZE,
    borderRadius: NOTIFICATION_ICON_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: NOTIFICATION_ICON_MARGIN_RIGHT,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: NOTIFICATION_META_MARGIN_BOTTOM,
  },
  notificationTitle: {
    fontSize: NOTIFICATION_TITLE_FONT_SIZE,
    fontFamily: Typography.fontFamily.bold,
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: NOTIFICATION_TITLE_MARGIN_RIGHT,
  },
  notificationTime: {
    fontSize: NOTIFICATION_TIME_FONT_SIZE,
    fontFamily: Typography.fontFamily.regular,
    color: theme.colors.text.secondary,
  },
  notificationMessage: {
    fontSize: NOTIFICATION_MESSAGE_FONT_SIZE,
    fontFamily: Typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    lineHeight: NOTIFICATION_MESSAGE_LINE_HEIGHT,
    marginBottom: NOTIFICATION_MESSAGE_MARGIN_BOTTOM,
  },
  notificationAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: NOTIFICATION_ACTION_MARGIN_TOP,
  },
  notificationActionText: {
    fontSize: NOTIFICATION_ACTION_TEXT_FONT_SIZE,
    fontFamily: Typography.fontFamily.bold,
    marginRight: NOTIFICATION_ACTION_TEXT_MARGIN_RIGHT,
  },
  unreadDot: {
    position: 'absolute',
    top: UNREAD_DOT_POSITION_TOP,
    right: UNREAD_DOT_POSITION_RIGHT,
    width: UNREAD_DOT_SIZE,
    height: UNREAD_DOT_SIZE,
    borderRadius: UNREAD_DOT_RADIUS,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: EMPTY_CONTAINER_PADDING_HORIZONTAL,
    paddingVertical: EMPTY_CONTAINER_PADDING_VERTICAL,
  },
  emptyTitle: {
    fontSize: EMPTY_TITLE_FONT_SIZE,
    fontFamily: Typography.fontFamily.bold,
    color: theme.colors.text.tertiary,
    marginTop: EMPTY_TITLE_MARGIN_TOP,
    marginBottom: EMPTY_TITLE_MARGIN_BOTTOM,
  },
  emptySubtitle: {
    fontSize: EMPTY_SUBTITLE_FONT_SIZE,
    fontFamily: Typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: EMPTY_SUBTITLE_LINE_HEIGHT,
  },
});