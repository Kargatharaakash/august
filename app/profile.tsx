import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/contexts/ThemeContext';
import Typography from '@/constants/Typography';
import Spacing from '@/constants/Spacing';
import Icons from '@/constants/Icons';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodType: string;
  emergencyContact: string;
  avatar?: string;
}

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ title, children }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  return (
    <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        {title}
      </Text>
      {children}
    </View>
  );
};

interface ProfileFieldProps {
  label: string;
  value: string;
  onPress?: () => void;
  editable?: boolean;
  icon?: any;
}

const ProfileField: React.FC<ProfileFieldProps> = ({ 
  label, 
  value, 
  onPress, 
  editable = false,
  icon: Icon 
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  return (
    <TouchableOpacity 
      style={[styles.profileField, { borderBottomColor: theme.colors.border }]}
      onPress={onPress}
      disabled={!editable && !onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.fieldContent}>
        {Icon && (
          <View style={[styles.fieldIcon, { backgroundColor: theme.colors.primary[100] }]}>
            <Icon size={20} color={theme.colors.primary[500]} />
          </View>
        )}
        <View style={styles.fieldText}>
          <Text style={[styles.fieldLabel, { color: theme.colors.text.secondary }]}>
            {label}
          </Text>
          <Text style={[styles.fieldValue, { color: theme.colors.text.primary }]}>
            {value || 'Not set'}
          </Text>
        </View>
      </View>
      {(editable || onPress) && (
        <Icons.Next size={16} color={theme.colors.text.tertiary} />
      )}
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  
  const styles = createStyles(theme);
  
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Raj',
    email: 'raj@example.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: 'January 15, 1995',
    gender: 'Male',
    bloodType: 'O+',
    emergencyContact: '+1 (555) 987-6543',
  });
  
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<keyof UserProfile | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAvatarPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Alert.alert(
      'Change Profile Picture',
      'Choose how you would like to update your profile picture',
      [
        { text: 'Camera', onPress: () => pickImage('camera') },
        { text: 'Photo Library', onPress: () => pickImage('library') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const pickImage = async (source: 'camera' | 'library') => {
    try {
      let result;
      
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setProfile(prev => ({ ...prev, avatar: result.assets[0].uri }));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleEditField = (field: keyof UserProfile) => {
    setEditingField(field);
    setEditValue(profile[field] || '');
    setEditModalVisible(true);
  };

  const saveEdit = () => {
    if (editingField) {
      setProfile(prev => ({ ...prev, [editingField]: editValue }));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setEditModalVisible(false);
    setEditingField(null);
    setEditValue('');
  };

  const handleSettingsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/settings');
  };

  const handleSignOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => {
            // Implement sign out logic here
            console.log('User signed out');
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['left', 'right', 'bottom']}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity 
          style={[styles.headerButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <Icons.Back size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          {t('profile.title')}
        </Text>
        
        <TouchableOpacity 
          style={[styles.headerButton, { backgroundColor: theme.colors.surface }]}
          onPress={handleSettingsPress}
        >
          <Icons.Settings size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: theme.colors.card }]}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarPress}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary[100] }]}>
                <Icons.User size={48} color={theme.colors.primary[500]} />
              </View>
            )}
            <View style={[styles.editAvatarButton, { backgroundColor: theme.colors.primary[500] }]}>
              <Icons.Camera size={14} color={theme.colors.text.inverse} />
            </View>
          </TouchableOpacity>
          
          <Text style={[styles.profileName, { color: theme.colors.text.primary }]}>
            {profile.name}
          </Text>
          <Text style={[styles.profileEmail, { color: theme.colors.text.secondary }]}>
            {profile.email}
          </Text>
          
          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary[500] }]}>12</Text>
              <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Prescriptions</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.success }]}>8</Text>
              <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Checkups</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.info }]}>3</Text>
              <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Reports</Text>
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <ProfileSection title={t('profile.personalInfo')}>
          <ProfileField
            label={t('profile.name')}
            value={profile.name}
            onPress={() => handleEditField('name')}
            editable
            icon={Icons.User}
          />
          <ProfileField
            label={t('profile.email')}
            value={profile.email}
            onPress={() => handleEditField('email')}
            editable
            icon={Icons.User} // Using User icon as placeholder
          />
          <ProfileField
            label={t('profile.phone')}
            value={profile.phone}
            onPress={() => handleEditField('phone')}
            editable
            icon={Icons.User} // Using User icon as placeholder
          />
          <ProfileField
            label={t('profile.dateOfBirth')}
            value={profile.dateOfBirth}
            onPress={() => handleEditField('dateOfBirth')}
            editable
            icon={Icons.Calendar}
          />
        </ProfileSection>

        {/* Medical Information */}
        <ProfileSection title={t('profile.medicalInfo')}>
          <ProfileField
            label={t('profile.gender')}
            value={profile.gender}
            onPress={() => handleEditField('gender')}
            editable
            icon={Icons.User}
          />
          <ProfileField
            label={t('profile.bloodType')}
            value={profile.bloodType}
            onPress={() => handleEditField('bloodType')}
            editable
            icon={Icons.MedicalKit}
          />
          <ProfileField
            label={t('profile.emergencyContact')}
            value={profile.emergencyContact}
            onPress={() => handleEditField('emergencyContact')}
            editable
            icon={Icons.User}
          />
        </ProfileSection>

        {/* Quick Actions */}
        <ProfileSection title={t('profile.quickActions')}>
          <ProfileField
            label={t('profile.healthRecords')}
            value={t('profile.viewAllRecords')}
            onPress={() => router.push('/records')}
            icon={Icons.MedicalRecord}
          />
          <ProfileField
            label={t('common.notifications')}
            value={t('profile.managePreferences')}
            onPress={() => router.push('/notifications')}
            icon={Icons.Notifications}
          />
          <ProfileField
            label={t('profile.exportData')}
            value={t('profile.downloadHealthData')}
            onPress={() => Alert.alert('Export Data', 'Feature coming soon!')}
            icon={Icons.Share}
          />
        </ProfileSection>

        {/* Sign Out */}
        <TouchableOpacity 
          style={[styles.signOutButton, { backgroundColor: theme.colors.error + '15' }]}
          onPress={handleSignOut}
        >
          <Icons.Delete size={20} color={theme.colors.error} />
          <Text style={[styles.signOutText, { color: theme.colors.error }]}>
            {t('profile.signOut')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <BlurView intensity={95} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
              Edit {editingField}
            </Text>
            
            <TextInput
              style={[
                styles.modalInput,
                { 
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  color: theme.colors.text.primary
                }
              ]}
              value={editValue}
              onChangeText={setEditValue}
              placeholder={`Enter ${editingField}`}
              placeholderTextColor={theme.colors.text.tertiary}
              autoFocus
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.surface }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text.secondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.primary[500] }]}
                onPress={saveEdit}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text.inverse }]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + Spacing.md : Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: Spacing.sm,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: theme.colors.text.primary,
  },
  headerAction: {
    width: 44,
    height: 44,
  },
  headerButton: {
    padding: Spacing.sm,
    borderRadius: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.lg,
    marginHorizontal: Spacing.lg,
    borderRadius: 16,
    marginTop: Spacing.md,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  profileName: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.xs,
  },
  profileEmail: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    marginBottom: Spacing.lg,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  statDivider: {
    width: 1,
    height: 24,
    marginHorizontal: Spacing.md,
  },
  section: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  profileField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  fieldContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fieldIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  fieldText: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  signOutText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    marginLeft: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  modalContent: {
    width: '100%',
    borderRadius: 16,
    padding: Spacing.xl,
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    marginBottom: Spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
  },
});
