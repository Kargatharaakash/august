import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Platform,
  Animated,
  TextInput,
  Dimensions,
  ScrollView,
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
import { getPrescriptions } from '@/services/storage';
import { PrescriptionData } from '@/types';

// Get screen dimensions for responsive design
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive sizing calculations
const HEADER_TITLE_FONT_SIZE = SCREEN_WIDTH * 0.055; // 5.5% of screen width
const SECTION_TITLE_FONT_SIZE = SCREEN_WIDTH * 0.045; // 4.5% of screen width
const RECORD_TITLE_FONT_SIZE = SCREEN_WIDTH * 0.04; // 4% of screen width
const RECORD_PROVIDER_FONT_SIZE = SCREEN_WIDTH * 0.035; // 3.5% of screen width
const RECORD_DATE_FONT_SIZE = SCREEN_WIDTH * 0.03; // 3% of screen width
const RECORD_SUMMARY_FONT_SIZE = SCREEN_WIDTH * 0.035; // 3.5% of screen width
const RECORD_SUMMARY_LINE_HEIGHT = SCREEN_WIDTH * 0.05; // 5% of screen width
const TAG_TEXT_FONT_SIZE = SCREEN_WIDTH * 0.03; // 3% of screen width
const FILTER_TAB_TEXT_FONT_SIZE = SCREEN_WIDTH * 0.035; // 3.5% of screen width
const STATS_VALUE_FONT_SIZE = SCREEN_WIDTH * 0.07; // 7% of screen width
const STATS_TITLE_FONT_SIZE = SCREEN_WIDTH * 0.035; // 3.5% of screen width
const TREND_TEXT_FONT_SIZE = SCREEN_WIDTH * 0.03; // 3% of screen width
const SEARCH_INPUT_FONT_SIZE = SCREEN_WIDTH * 0.04; // 4% of screen width
const LOADING_TEXT_FONT_SIZE = SCREEN_WIDTH * 0.04; // 4% of screen width
const EMPTY_TITLE_FONT_SIZE = SCREEN_WIDTH * 0.045; // 4.5% of screen width
const EMPTY_SUBTITLE_FONT_SIZE = SCREEN_WIDTH * 0.04; // 4% of screen width
const RECORD_COUNT_FONT_SIZE = SCREEN_WIDTH * 0.035; // 3.5% of screen width

const STATS_CARD_MIN_WIDTH = SCREEN_WIDTH * 0.35; // 35% of screen width
const STATS_CARD_BORDER_RADIUS = SCREEN_WIDTH * 0.04; // 4% of screen width
const RECORD_CARD_BORDER_RADIUS = SCREEN_WIDTH * 0.04; // 4% of screen width
const FILTER_TAB_BORDER_RADIUS = SCREEN_WIDTH * 0.05; // 5% of screen width
const SEARCH_INPUT_CONTAINER_BORDER_RADIUS = SCREEN_WIDTH * 0.04; // 4% of screen width
const BACK_BUTTON_BORDER_RADIUS = SCREEN_WIDTH * 0.03; // 3% of screen width
const HEADER_ACTION_BORDER_RADIUS = SCREEN_WIDTH * 0.03; // 3% of screen width
const STATS_ICON_SIZE = SCREEN_WIDTH * 0.09; // 9% of screen width
const STATS_ICON_RADIUS = STATS_ICON_SIZE / 2;
const RECORD_ICON_SIZE = SCREEN_WIDTH * 0.1; // 10% of screen width
const RECORD_ICON_RADIUS = RECORD_ICON_SIZE / 2;
const STATUS_BADGE_BORDER_RADIUS = SCREEN_WIDTH * 0.03; // 3% of screen width
const TAG_BORDER_RADIUS = SCREEN_WIDTH * 0.02; // 2% of screen width
const ADD_BUTTON_SIZE = SCREEN_WIDTH * 0.14; // 14% of screen width
const ADD_BUTTON_RADIUS = ADD_BUTTON_SIZE / 2;

interface HealthRecord {
  id: string;
  type: 'prescription' | 'vitals' | 'appointment' | 'lab' | 'imaging';
  title: string;
  date: Date;
  provider?: string;
  status: 'active' | 'completed' | 'pending' | 'expired';
  summary: string;
  tags: string[];
  data?: any;
}

interface StatsCardProps {
  title: string;
  value: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon: any;
  color: string;
  theme: any;
  styles: any;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, trend, trendValue, icon: Icon, color, theme, styles }) => {
  return (
    <TouchableOpacity style={[styles.statsCard, { borderLeftColor: color }]} activeOpacity={0.7}>
      <View style={styles.statsContent}>
        <View style={styles.statsHeader}>
          <View style={[styles.statsIcon, { backgroundColor: color + '15' }]}>
            <Icon size={20} color={color} />
          </View>
          {trend && (
            <View style={[styles.trendBadge, { backgroundColor: trend === 'up' ? theme.colors.success + '15' : trend === 'down' ? theme.colors.error + '15' : theme.colors.surface }]}>
              <Icons.Previous 
                size={12} 
                color={trend === 'up' ? theme.colors.success : trend === 'down' ? theme.colors.error : theme.colors.text.secondary}
                style={{ transform: [{ rotate: trend === 'up' ? '-90deg' : trend === 'down' ? '90deg' : '0deg' }] }}
              />
              <Text style={[styles.trendText, { color: trend === 'up' ? theme.colors.success : trend === 'down' ? theme.colors.error : theme.colors.text.secondary }]}>
                {trendValue}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.statsValue}>{value}</Text>
        <Text style={styles.statsTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function HealthRecordsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'prescription' | 'vitals' | 'appointment' | 'lab' | 'imaging'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;
  const searchRef = useRef<TextInput>(null);

  const filterOptions = [
    { key: 'all', label: 'All Records', icon: Icons.MedicalRecord },
    { key: 'prescription', label: 'Prescriptions', icon: Icons.Medication },
    { key: 'vitals', label: 'Vitals', icon: Icons.MedicalKit },
    { key: 'appointment', label: 'Appointments', icon: Icons.Calendar },
    { key: 'lab', label: 'Lab Results', icon: Icons.MedicalRecord },
    { key: 'imaging', label: 'Imaging', icon: Icons.Camera },
  ];

  const quickStats = [
    {
      title: 'Active Prescriptions',
      value: '3',
      trend: 'stable' as const,
      trendValue: '0%',
      icon: Icons.Medication,
      color: theme.colors.primary[500],
    },
    {
      title: 'Recent Checkups',
      value: '2',
      trend: 'up' as const,
      trendValue: '+1',
      icon: Icons.MedicalKit,
      color: theme.colors.success,
    },
    {
      title: 'Pending Results',
      value: '1',
      trend: 'down' as const,
      trendValue: '-2',
      icon: Icons.Time,
      color: theme.colors.warning,
    },
    {
      title: 'This Month',
      value: '5',
      trend: 'up' as const,
      trendValue: '+40%',
      icon: Icons.Calendar,
      color: theme.colors.info,
    },
  ];

  useEffect(() => {
    loadHealthRecords();
  }, []);

  const loadHealthRecords = async () => {
    try {
      setIsLoading(true);
      // Load prescriptions from storage
      const prescriptions = await getPrescriptions();
      
      // Convert prescriptions to health records format
      const prescriptionRecords: HealthRecord[] = prescriptions.map(prescription => ({
        id: prescription.id,
        type: 'prescription',
        title: getFirstMedicationName(prescription.parsedData) || 'Prescription',
        date: prescription.createdAt,
        provider: 'Dr. Smith', // This would come from prescription data
        status: 'active',
        summary: getRecordSummary(prescription.parsedData),
        tags: getMedicationTags(prescription.parsedData),
        data: prescription,
      }));

      // Add sample records for demonstration
      const sampleRecords: HealthRecord[] = [
        {
          id: 'vital-1',
          type: 'vitals',
          title: 'Blood Pressure Check',
          date: new Date(Date.now() - 86400000), // 1 day ago
          provider: 'Dr. Johnson',
          status: 'completed',
          summary: '120/80 mmHg - Normal range',
          tags: ['blood-pressure', 'routine'],
        },
        {
          id: 'apt-1',
          type: 'appointment',
          title: 'Annual Physical',
          date: new Date(Date.now() + 604800000), // 1 week from now
          provider: 'Dr. Wilson',
          status: 'pending',
          summary: 'Scheduled for comprehensive health examination',
          tags: ['annual', 'physical', 'checkup'],
        },
        {
          id: 'lab-1',
          type: 'lab',
          title: 'Blood Work Results',
          date: new Date(Date.now() - 172800000), // 2 days ago
          provider: 'Lab Corp',
          status: 'completed',
          summary: 'Complete blood count - All values normal',
          tags: ['blood-work', 'routine', 'normal'],
        },
      ];

      setRecords([...prescriptionRecords, ...sampleRecords]);
    } catch (error) {
      console.error('Failed to load health records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFirstMedicationName = (data: any): string => {
    if (!data) return 'Prescription';
    
    // Try to extract first medication name from dynamic data structure
    const findMedicationName = (obj: any): string => {
      if (!obj) return 'Prescription';
      
      if (typeof obj === 'string' && obj.length > 3 && obj.length < 50) {
        // Likely a medication name if it's a reasonable length string
        if (/^[A-Za-z\s\-]+$/.test(obj)) {
          return obj;
        }
      }
      
      if (typeof obj === 'object' && obj !== null) {
        try {
          for (const value of Object.values(obj)) {
            if (value != null) {
              const result = findMedicationName(value);
              if (result !== 'Prescription') return result;
            }
          }
        } catch (error) {
          console.warn('Error processing medication data:', error);
        }
      }
      
      return 'Prescription';
    };

    return findMedicationName(data);
  };

  const getRecordSummary = (data: any): string => {
    if (!data) return 'Medical prescription details';
    
    const medicationCount = countMedications(data);
    const name = getFirstMedicationName(data);
    
    if (medicationCount > 1) {
      return `${name} and ${medicationCount - 1} other medication${medicationCount > 2 ? 's' : ''}`;
    }
    
    return `${name} prescription`;
  };

  const countMedications = (data: any): number => {
    // Simple heuristic to count medications in dynamic data
    const stringify = JSON.stringify(data);
    const matches = stringify.match(/mg|tablet|capsule|ml|dose/gi);
    return Math.max(1, Math.min(5, (matches?.length || 0) / 2));
  };

  const getMedicationTags = (data: any): string[] => {
    const tags = ['prescription'];
    if (!data) return tags;
    
    try {
      const stringify = JSON.stringify(data)?.toLowerCase() || '';
      
      if (stringify.includes('daily') || stringify.includes('once')) tags.push('daily');
      if (stringify.includes('twice') || stringify.includes('bid')) tags.push('twice-daily');
      if (stringify.includes('pain') || stringify.includes('analgesic')) tags.push('pain-relief');
      if (stringify.includes('antibiotic')) tags.push('antibiotic');
      if (stringify.includes('chronic')) tags.push('chronic');
    } catch (error) {
      console.warn('Error processing medication tags:', error);
    }
    
    return tags;
  };

  const filteredRecords = records.filter(record => {
    const matchesFilter = selectedFilter === 'all' || record.type === selectedFilter;
    const matchesSearch = searchQuery === '' || 
      record.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.provider?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.tags?.some(tag => tag?.toLowerCase()?.includes(searchQuery.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'prescription': return Icons.Medication;
      case 'vitals': return Icons.MedicalKit;
      case 'appointment': return Icons.Calendar;
      case 'lab': return Icons.MedicalRecord;
      case 'imaging': return Icons.Camera;
      default: return Icons.MedicalRecord;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.colors.success;
      case 'completed': return theme.colors.primary[500];
      case 'pending': return theme.colors.warning;
      case 'expired': return theme.colors.error;
      default: return theme.colors.text.secondary;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays === -1) return 'Tomorrow';
    if (diffDays > 0 && diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 0 && diffDays > -7) return `In ${Math.abs(diffDays)} days`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  const renderRecord = ({ item }: { item: HealthRecord }) => {
    const Icon = getRecordIcon(item.type);
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity 
        style={styles.recordCard}
        activeOpacity={0.7}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          // Navigate to record details
        }}
      >
        <View style={styles.recordHeader}>
          <View style={[styles.recordIcon, { backgroundColor: statusColor + '15' }]}>
            <Icon size={20} color={statusColor} />
          </View>
          <View style={styles.recordInfo}>
            <Text style={styles.recordTitle}>{item.title}</Text>
            <Text style={styles.recordProvider}>{item.provider}</Text>
          </View>
          <View style={styles.recordMeta}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {item.status}
              </Text>
            </View>
            <Text style={styles.recordDate}>{formatDate(item.date)}</Text>
          </View>
        </View>
        
        <Text style={styles.recordSummary}>{item.summary}</Text>
        
        <View style={styles.recordTags}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {item.tags.length > 3 && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>+{item.tags.length - 3}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const styles = getStyles(theme);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['left', 'right', 'bottom']}>
      <StatusBar barStyle={theme.mode === 'dark' ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
      
      {/* Header with Search */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch (error) {
                console.warn('Haptics not available:', error);
              }
              router.back();
            }}
          >
            <Icons.Back size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Health Records</Text>
          
          <TouchableOpacity style={styles.headerAction}>
            <Icons.More size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icons.Search size={20} color={theme.colors.text.secondary} />
            <TextInput
              ref={searchRef}
              style={styles.searchInput}
              placeholder={t('records.searchPlaceholder')}
              placeholderTextColor={theme.colors.text.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  searchRef.current?.blur();
                }}
              >
                <Icons.Close size={20} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Overview</Text>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsContainer}
          >
            {quickStats.map((stat, index) => (
              <StatsCard key={index} {...stat} theme={theme} styles={styles} />
            ))}
          </ScrollView>
        </View>

        {/* Filter Tabs */}
        <View style={styles.section}>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {filterOptions.map((filter) => {
              const isSelected = selectedFilter === filter.key;
              return (
                <TouchableOpacity
                  key={filter.key}
                  style={[styles.filterTab, isSelected && styles.filterTabActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedFilter(filter.key as any);
                  }}
                  activeOpacity={0.7}
                >
                  <filter.icon 
                    size={16} 
                    color={isSelected ? theme.colors.primary[500] : theme.colors.text.secondary} 
                  />
                  <Text style={[
                    styles.filterTabText,
                    isSelected && styles.filterTabTextActive
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Records List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedFilter === 'all' ? 'All Records' : filterOptions.find(f => f.key === selectedFilter)?.label}
            </Text>
            <Text style={styles.recordCount}>
              {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading health records...</Text>
            </View>
          ) : filteredRecords.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icons.MedicalRecord size={48} color={theme.colors.text.tertiary} />
              <Text style={styles.emptyTitle}>No records found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Try adjusting your search terms' : 'Your health records will appear here'}
              </Text>
            </View>
          ) : (
            <View style={styles.recordsList}>
              {filteredRecords.map((record) => (
                <View key={record.id}>
                  {renderRecord({ item: record })}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/prescription');
        }}
        activeOpacity={0.8}
      >
        <Icons.Add size={24} color={theme.colors.text.inverse} />
      </TouchableOpacity>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_WIDTH * 0.05, // 5% of screen width
    paddingVertical: SCREEN_WIDTH * 0.04, // 4% of screen width
  },
  backButton: {
    padding: SCREEN_WIDTH * 0.025, // 2.5% of screen width
    borderRadius: BACK_BUTTON_BORDER_RADIUS,
    backgroundColor: theme.colors.surface,
  },
  headerTitle: {
    fontSize: HEADER_TITLE_FONT_SIZE,
    fontFamily: Typography.fontFamily.bold,
    color: theme.colors.text.primary,
  },
  headerAction: {
    padding: SCREEN_WIDTH * 0.025, // 2.5% of screen width
    borderRadius: HEADER_ACTION_BORDER_RADIUS,
    backgroundColor: theme.colors.surface,
  },
  searchContainer: {
    paddingHorizontal: SCREEN_WIDTH * 0.05, // 5% of screen width
    paddingBottom: SCREEN_WIDTH * 0.04, // 4% of screen width
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: SEARCH_INPUT_CONTAINER_BORDER_RADIUS,
    paddingHorizontal: SCREEN_WIDTH * 0.03, // 3% of screen width
    paddingVertical: SCREEN_WIDTH * 0.02, // 2% of screen width
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: SEARCH_INPUT_FONT_SIZE,
    fontFamily: Typography.fontFamily.regular,
    color: theme.colors.text.primary,
    marginLeft: SCREEN_WIDTH * 0.025, // 2.5% of screen width
    marginRight: SCREEN_WIDTH * 0.025, // 2.5% of screen width
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: SCREEN_HEIGHT * 0.03, // 3% of screen height
  },
  sectionTitle: {
    fontSize: SECTION_TITLE_FONT_SIZE,
    fontFamily: Typography.fontFamily.bold,
    color: theme.colors.text.primary,
    marginBottom: SCREEN_WIDTH * 0.03, // 3% of screen width
    paddingHorizontal: SCREEN_WIDTH * 0.05, // 5% of screen width
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.05, // 5% of screen width
    marginBottom: SCREEN_WIDTH * 0.03, // 3% of screen width
  },
  recordCount: {
    fontSize: RECORD_COUNT_FONT_SIZE,
    fontFamily: Typography.fontFamily.medium,
    color: theme.colors.text.secondary,
  },
  statsContainer: {
    paddingHorizontal: SCREEN_WIDTH * 0.05, // 5% of screen width
  },
  statsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: STATS_CARD_BORDER_RADIUS,
    padding: SCREEN_WIDTH * 0.03, // 3% of screen width
    marginRight: SCREEN_WIDTH * 0.03, // 3% of screen width
    borderLeftWidth: 4,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: SCREEN_HEIGHT * 0.002 }, // 0.2% of screen height
    shadowOpacity: 0.1,
    shadowRadius: SCREEN_WIDTH * 0.02, // 2% of screen width
    elevation: 3,
    minWidth: STATS_CARD_MIN_WIDTH,
  },
  statsContent: {
    alignItems: 'flex-start',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: SCREEN_WIDTH * 0.025, // 2.5% of screen width
  },
  statsIcon: {
    width: STATS_ICON_SIZE,
    height: STATS_ICON_SIZE,
    borderRadius: STATS_ICON_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.015, // 1.5% of screen width
    paddingVertical: SCREEN_HEIGHT * 0.001, // 0.1% of screen height
    borderRadius: SCREEN_WIDTH * 0.02, // 2% of screen width
  },
  trendText: {
    fontSize: TREND_TEXT_FONT_SIZE,
    fontFamily: Typography.fontFamily.medium,
    marginLeft: SCREEN_WIDTH * 0.005, // 0.5% of screen width
  },
  statsValue: {
    fontSize: STATS_VALUE_FONT_SIZE,
    fontFamily: Typography.fontFamily.bold,
    color: theme.colors.text.primary,
    marginBottom: SCREEN_HEIGHT * 0.001, // 0.1% of screen height
  },
  statsTitle: {
    fontSize: STATS_TITLE_FONT_SIZE,
    fontFamily: Typography.fontFamily.regular,
    color: theme.colors.text.secondary,
  },
  filterContainer: {
    paddingHorizontal: SCREEN_WIDTH * 0.05, // 5% of screen width
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.03, // 3% of screen width
    paddingVertical: SCREEN_WIDTH * 0.02, // 2% of screen width
    borderRadius: FILTER_TAB_BORDER_RADIUS,
    backgroundColor: theme.colors.surface,
    marginRight: SCREEN_WIDTH * 0.03, // 3% of screen width
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterTabActive: {
    backgroundColor: theme.colors.primary[50],
    borderColor: theme.colors.primary[200],
  },
  filterTabText: {
    fontSize: FILTER_TAB_TEXT_FONT_SIZE,
    fontFamily: Typography.fontFamily.medium,
    color: theme.colors.text.secondary,
    marginLeft: SCREEN_WIDTH * 0.015, // 1.5% of screen width
  },
  filterTabTextActive: {
    color: theme.colors.primary[500],
  },
  recordsList: {
    paddingHorizontal: SCREEN_WIDTH * 0.05, // 5% of screen width
  },
  recordCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: RECORD_CARD_BORDER_RADIUS,
    padding: SCREEN_WIDTH * 0.03, // 3% of screen width
    marginBottom: SCREEN_WIDTH * 0.03, // 3% of screen width
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: SCREEN_HEIGHT * 0.001 }, // 0.1% of screen height
    shadowOpacity: 0.05,
    shadowRadius: SCREEN_WIDTH * 0.01, // 1% of screen width
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SCREEN_WIDTH * 0.025, // 2.5% of screen width
  },
  recordIcon: {
    width: RECORD_ICON_SIZE,
    height: RECORD_ICON_SIZE,
    borderRadius: RECORD_ICON_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SCREEN_WIDTH * 0.03, // 3% of screen width
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: RECORD_TITLE_FONT_SIZE,
    fontFamily: Typography.fontFamily.bold,
    color: theme.colors.text.primary,
    marginBottom: SCREEN_HEIGHT * 0.001, // 0.1% of screen height
  },
  recordProvider: {
    fontSize: RECORD_PROVIDER_FONT_SIZE,
    fontFamily: Typography.fontFamily.regular,
    color: theme.colors.text.secondary,
  },
  recordMeta: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: SCREEN_WIDTH * 0.03, // 3% of screen width
    paddingVertical: SCREEN_HEIGHT * 0.002, // 0.2% of screen height
    borderRadius: STATUS_BADGE_BORDER_RADIUS,
    marginBottom: SCREEN_HEIGHT * 0.002, // 0.2% of screen height
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    textTransform: 'capitalize',
  },
  recordDate: {
    fontSize: RECORD_DATE_FONT_SIZE,
    fontFamily: Typography.fontFamily.regular,
    color: theme.colors.text.secondary,
  },
  recordSummary: {
    fontSize: RECORD_SUMMARY_FONT_SIZE,
    fontFamily: Typography.fontFamily.regular,
    color: theme.colors.text.primary,
    lineHeight: RECORD_SUMMARY_LINE_HEIGHT,
    marginBottom: SCREEN_WIDTH * 0.03, // 3% of screen width
  },
  recordTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: theme.colors.surfaceSecondary,
    paddingHorizontal: SCREEN_WIDTH * 0.03, // 3% of screen width
    paddingVertical: SCREEN_HEIGHT * 0.002, // 0.2% of screen height
    borderRadius: TAG_BORDER_RADIUS,
    marginRight: SCREEN_WIDTH * 0.015, // 1.5% of screen width
    marginBottom: SCREEN_WIDTH * 0.015, // 1.5% of screen width
  },
  tagText: {
    fontSize: TAG_TEXT_FONT_SIZE,
    fontFamily: Typography.fontFamily.medium,
    color: theme.colors.text.secondary,
  },
  loadingContainer: {
    padding: SCREEN_WIDTH * 0.05, // 5% of screen width
    alignItems: 'center',
  },
  loadingText: {
    fontSize: LOADING_TEXT_FONT_SIZE,
    fontFamily: Typography.fontFamily.regular,
    color: theme.colors.text.secondary,
  },
  emptyContainer: {
    padding: SCREEN_WIDTH * 0.05, // 5% of screen width
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: EMPTY_TITLE_FONT_SIZE,
    fontFamily: Typography.fontFamily.bold,
    color: theme.colors.text.tertiary,
    marginTop: SCREEN_WIDTH * 0.03, // 3% of screen width
    marginBottom: SCREEN_WIDTH * 0.015, // 1.5% of screen width
  },
  emptySubtitle: {
    fontSize: EMPTY_SUBTITLE_FONT_SIZE,
    fontFamily: Typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: SCREEN_WIDTH * 0.05, // 5% of screen width
    right: SCREEN_WIDTH * 0.05, // 5% of screen width
    width: ADD_BUTTON_SIZE,
    height: ADD_BUTTON_SIZE,
    borderRadius: ADD_BUTTON_RADIUS,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary[500],
    shadowOffset: { width: 0, height: SCREEN_HEIGHT * 0.004 }, // 0.4% of screen height
    shadowOpacity: 0.3,
    shadowRadius: SCREEN_WIDTH * 0.02, // 2% of screen width
    elevation: 8,
  },
});