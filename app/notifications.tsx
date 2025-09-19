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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.sm,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: theme.colors.text.primary,
  },
  unreadBadge: {
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    color: theme.colors.text.inverse,
  },
  markAllButton: {
    padding: Spacing.sm,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  filterContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary[50],
    borderColor: theme.colors.primary[200],
  },
  filterChipText: {
    fontSize: Typography.fontSize.sm,
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
    paddingBottom: Spacing.xl,
  },
  notificationsList: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  notificationItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderLeftWidth: 4,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationItemUnread: {
    backgroundColor: theme.colors.primary[50] + '30',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.lg,
    position: 'relative',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  notificationTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.bold,
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  notificationTime: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: theme.colors.text.secondary,
  },
  notificationMessage: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  notificationAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  notificationActionText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    marginRight: Spacing.xs,
  },
  unreadDot: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: theme.colors.text.tertiary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});