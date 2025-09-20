import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Alert,
  Modal,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import PrescriptionPlaceholder from '@/components/PrescriptionPlaceholder';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { v4 as uuidv4 } from 'uuid';
import { Camera as CameraIcon, Image as ImageIcon, X, RotateCcw } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

import Typography from '@/constants/Typography';
import Spacing from '@/constants/Spacing';
import { PrescriptionData, OCRResult } from '@/types';
import { extractTextFromImage } from '@/services/ocr';
import { parsePrescriptionText } from '@/services/groq';
import { savePrescription } from '@/services/storage';

// Get screen dimensions for responsive design
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive sizing calculations
const HEADER_TITLE_FONT_SIZE = SCREEN_WIDTH * 0.055; // 5.5% of screen width
const SUBTITLE_FONT_SIZE = SCREEN_WIDTH * 0.045; // 4.5% of screen width
const STATUS_MESSAGE_FONT_SIZE = SCREEN_WIDTH * 0.045; // 4.5% of screen width
const CARD_TITLE_FONT_SIZE = SCREEN_WIDTH * 0.045; // 4.5% of screen width
const DATA_LABEL_FONT_SIZE = SCREEN_WIDTH * 0.035; // 3.5% of screen width
const DATA_VALUE_FONT_SIZE = SCREEN_WIDTH * 0.035; // 3.5% of screen width
const RAW_TEXT_FONT_SIZE = SCREEN_WIDTH * 0.03; // 3% of screen width
const ARRAY_INDEX_FONT_SIZE = SCREEN_WIDTH * 0.03; // 3% of screen width
const RETRY_BUTTON_FONT_SIZE = SCREEN_WIDTH * 0.04; // 4% of screen width
const NEW_SCAN_BUTTON_FONT_SIZE = SCREEN_WIDTH * 0.04; // 4% of screen width
const CAMERA_PERMISSION_FONT_SIZE = SCREEN_WIDTH * 0.04; // 4% of screen width
const PERMISSION_BUTTON_FONT_SIZE = SCREEN_WIDTH * 0.04; // 4% of screen width

const ACTION_BUTTON_SIZE = SCREEN_WIDTH * 0.13; // 13% of screen width
const ACTION_BUTTON_RADIUS = ACTION_BUTTON_SIZE / 2;
const PRIMARY_ACTION_BUTTON_SIZE = SCREEN_WIDTH * 0.13; // 13% of screen width
const PRIMARY_ACTION_BUTTON_RADIUS = PRIMARY_ACTION_BUTTON_SIZE / 2;
const SECONDARY_ACTION_BUTTON_SIZE = SCREEN_WIDTH * 0.13; // 13% of screen width
const SECONDARY_ACTION_BUTTON_RADIUS = SECONDARY_ACTION_BUTTON_SIZE / 2;
const ACTION_BUTTONS_CONTAINER_WIDTH = SCREEN_WIDTH * 0.35; // 35% of screen width
const ACTION_BUTTONS_CONTAINER_HEIGHT = SCREEN_WIDTH * 0.15; // 15% of screen width
const ACTION_BUTTONS_CONTAINER_RADIUS = ACTION_BUTTONS_CONTAINER_HEIGHT / 2;

const CAPTURE_BUTTON_SIZE = SCREEN_WIDTH * 0.2; // 20% of screen width
const CAPTURE_BUTTON_RADIUS = CAPTURE_BUTTON_SIZE / 2;
const CAPTURE_BUTTON_OUTER_SIZE = SCREEN_WIDTH * 0.18; // 18% of screen width
const CAPTURE_BUTTON_OUTER_RADIUS = CAPTURE_BUTTON_OUTER_SIZE / 2;
const CAPTURE_BUTTON_INNER_SIZE = SCREEN_WIDTH * 0.15; // 15% of screen width
const CAPTURE_BUTTON_INNER_RADIUS = CAPTURE_BUTTON_INNER_SIZE / 2;

const CONTROL_BUTTON_SIZE = SCREEN_WIDTH * 0.11; // 11% of screen width
const CONTROL_BUTTON_RADIUS = CONTROL_BUTTON_SIZE / 2;
const CONTROL_BUTTON_INNER_SIZE = SCREEN_WIDTH * 0.09; // 9% of screen width
const CONTROL_BUTTON_INNER_RADIUS = CONTROL_BUTTON_INNER_SIZE / 2;

const IMAGE_PREVIEW_HEIGHT = SCREEN_HEIGHT * 0.4; // 40% of screen height
const IMAGE_PREVIEW_RADIUS = SCREEN_WIDTH * 0.03; // 3% of screen width

const PLACEHOLDER_SIZE = SCREEN_WIDTH * 0.5; // 50% of screen width

type ProcessingStatus = 'idle' | 'capturing' | 'processing' | 'analyzing' | 'complete' | 'error';

export default function PrescriptionScreen() {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = getStyles(theme);
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData | null>(null);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const cameraRef = useRef<CameraView>(null);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  
  useEffect(() => {
    setHasPermission(cameraPermission?.granted ?? false);
  }, [cameraPermission]);
  
  useEffect(() => {
    (async () => {
      if (!cameraPermission?.granted) {
        await requestCameraPermission();
      }
      
      const imageLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (imageLibraryStatus.status !== 'granted') {
        Alert.alert(t('common.error'), 'Please allow access to your photo library to use this feature.');
      }
    })();
  }, [cameraPermission, requestCameraPermission]);

  const takePicture = async () => {
    if (!cameraRef.current) return;
    
    try {
      setProcessingStatus('capturing');
      setStatusMessage(t('prescription.captureImage'));
      
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        console.warn('Haptics not available:', error);
      }
      
      const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
      setImageUri(photo.uri);
      setCameraVisible(false);
      processImage(photo.uri);
      
    } catch (error) {
      console.error('Error taking picture:', error);
      setProcessingStatus('error');
      setStatusMessage('Failed to capture image. Please try again.');
      
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (error) {
        console.warn('Haptics not available:', error);
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        setImageUri(selectedImage.uri);
        
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (error) {
          console.warn('Haptics not available:', error);
        }
        
        processImage(selectedImage.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(t('common.error'), 'Failed to select image. Please try again.');
    }
  };

  const processImage = async (uri: string) => {
    try {
      setProcessingStatus('processing');
      setStatusMessage(t('prescription.extractingText'));
      
      const ocrResult: OCRResult = await extractTextFromImage(uri);
      
      if (!ocrResult.text || ocrResult.text.trim().length < 10) {
        setProcessingStatus('error');
        setStatusMessage(t('prescription.notEnoughText'));
        return;
      }
      
      setProcessingStatus('analyzing');
      setStatusMessage(t('prescription.analyzingDetails'));
      
      const parsedPrescription = await parsePrescriptionText(ocrResult.text);
      
      const newPrescription: PrescriptionData = {
        id: uuidv4(),
        parsedData: parsedPrescription,
        extractedText: ocrResult.text,
        imageUri: uri,
        createdAt: new Date(),
      };
      
      setStatusMessage(t('prescription.savingData'));
      await savePrescription(newPrescription);
      
      setPrescriptionData(newPrescription);
      setProcessingStatus('complete');
      
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.warn('Haptics not available:', error);
      }
      
    } catch (error) {
      console.error('Error processing prescription:', error);
      setProcessingStatus('error');
      setStatusMessage(t('prescription.error'));
      
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (error) {
        console.warn('Haptics not available:', error);
      }
    }
  };

  const resetProcess = () => {
    setImageUri(null);
    setPrescriptionData(null);
    setProcessingStatus('idle');
    setStatusMessage('');
  };

  const renderDynamicData = (data: any, depth: number = 0): React.ReactNode => {
    if (!data || depth > 3) return null;
    
    if (Array.isArray(data)) {
      return data.map((item, index) => (
        <View key={index} style={styles.arrayItem}>
          <Text style={styles.arrayIndex}>#{index + 1}</Text>
          {renderDynamicData(item, depth + 1)}
        </View>
      ));
    }
    
    if (typeof data === 'object') {
      return Object.entries(data).map(([key, value]) => (
        <View key={key} style={styles.dataItem}>
          <Text style={styles.dataLabel}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</Text>
          {typeof value === 'string' || typeof value === 'number' ? (
            <Text style={styles.dataValue}>{String(value)}</Text>
          ) : (
            <View style={styles.nestedData}>
              {renderDynamicData(value, depth + 1)}
            </View>
          )}
        </View>
      ));
    }
    
    return <Text style={styles.dataValue}>{String(data)}</Text>;
  };

  const renderActionButtons = () => {
    if (processingStatus === 'idle') {
      return (
        <View style={styles.actionButtonsWrapper}>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                } catch (error) {
                  console.warn('Haptics not available:', error);
                }
                setCameraVisible(true);
              }}
              activeOpacity={0.9}
            >
              <CameraIcon size={24} color={theme.colors.text.inverse} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryActionButton}
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch (error) {
                  console.warn('Haptics not available:', error);
                }
                pickImage();
              }}
              activeOpacity={0.9}
            >
              <ImageIcon size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return null;
  };

  const renderProcessingStatus = () => {
    if (processingStatus === 'idle') return null;
    
    return (
      <BlurView intensity={15} tint="light" style={styles.processingContainer}>
        {(processingStatus === 'processing' || processingStatus === 'analyzing' || processingStatus === 'capturing') && (
          <ActivityIndicator size="large" color={theme.colors.primary[600]} style={styles.loader} />
        )}
        
        <Text style={styles.statusMessage}>{statusMessage}</Text>
        
        {processingStatus === 'error' && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              } catch (error) {
                console.warn('Haptics not available:', error);
              }
              resetProcess();
            }}
            activeOpacity={0.8}
          >
            <View style={styles.retryButtonInner}>
              <RotateCcw size={20} color={theme.colors.text.inverse} style={{marginRight: Spacing.sm}} />
              <Text style={styles.retryButtonText}>{t('prescription.tryAgain')}</Text>
            </View>
          </TouchableOpacity>
        )}
      </BlurView>
    );
  };

  const renderPrescriptionDetails = () => {
    if (!prescriptionData || processingStatus !== 'complete') return null;
    
    const data = prescriptionData.parsedData;
    
    return (
      <ScrollView 
        style={styles.prescriptionContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.dynamicCard}>
          <Text style={styles.cardTitle}>{t('prescription.prescriptionDetails')}</Text>
          {renderDynamicData(data)}
        </View>
        
        <View style={styles.rawTextCard}>
          <Text style={styles.cardTitle}>{t('prescription.extractedText')}</Text>
          <Text style={styles.rawText} numberOfLines={5}>
            {prescriptionData.extractedText}
          </Text>
        </View>
      </ScrollView>
    );
  };

  const renderBottomScanButton = () => {
    if (processingStatus !== 'complete' || !prescriptionData) return null;
    
    return (
      <View style={styles.bottomScanButtonWrapper}>
        <TouchableOpacity
          style={styles.newScanButton}
          onPress={() => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch (error) {
              console.warn('Haptics not available:', error);
            }
            resetProcess();
          }}
          activeOpacity={0.8}
        >
          <View style={styles.newScanButtonInner}>
            <Text style={styles.newScanButtonText}>{t('prescription.scanAnother')}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderImagePreview = () => {
    if (!imageUri || processingStatus === 'complete') return null;
    
    return (
      <View style={styles.imagePreviewContainer}>
        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
      </View>
    );
  };

  const renderCameraView = () => {
    if (!cameraVisible) return null;
    
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={cameraVisible}
        onRequestClose={() => setCameraVisible(false)}
      >
        <View style={styles.cameraContainer}>
          {hasPermission === null ? (
            <View style={styles.cameraPermissionContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary[600]} />
              <Text style={styles.cameraPermissionText}>{t('prescription.cameraPermission')}</Text>
            </View>
          ) : hasPermission === false ? (
            <View style={styles.cameraPermissionContainer}>
              <Text style={styles.cameraPermissionText}>{t('prescription.noCameraAccess')}</Text>
              <TouchableOpacity
                style={styles.permissionButton}
                onPress={() => setCameraVisible(false)}
                activeOpacity={0.8}
              >
                <View style={styles.permissionButtonInner}>
                  <Text style={styles.permissionButtonText}>{t('prescription.goBack')}</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={cameraType}
              />
              
              <View style={styles.cameraControls}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setCameraVisible(false)}
                  activeOpacity={0.7}
                >
                  <View style={styles.closeButtonInner}>
                    <X size={24} color="#fff" />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={takePicture}
                  activeOpacity={0.8}
                >
                  <View style={styles.captureButtonOuter}>
                    <View style={styles.captureButtonInner} />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.flipButton}
                  onPress={() => {
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch (error) {
                      console.warn('Haptics not available:', error);
                    }
                    setCameraType(cameraType === 'back' ? 'front' : 'back');
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.flipButtonInner}>
                    <RotateCcw size={20} color="#fff" />
                  </View>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('prescription.title')}</Text>
      </View>
      
      <View style={styles.container}>
        {processingStatus === 'idle' && (
          <View style={styles.headerContainer}>
            <PrescriptionPlaceholder width={PLACEHOLDER_SIZE} height={PLACEHOLDER_SIZE} />
            <Text style={styles.subtitle}>
              {t('prescription.subtitle')}
            </Text>
          </View>
        )}
        
        {renderImagePreview()}
        {renderProcessingStatus()}
        {renderPrescriptionDetails()}
        {renderActionButtons()}
        {renderCameraView()}
      </View>
      
      {renderBottomScanButton()}
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    width: '100%',
  },
  headerTitle: {
    fontSize: HEADER_TITLE_FONT_SIZE,
    fontFamily: Typography.fontFamily.bold,
    color: theme.colors.text.primary,
    marginVertical: Spacing.sm,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? SCREEN_HEIGHT * 0.12 : SCREEN_HEIGHT * 0.1,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? SCREEN_HEIGHT * 0.25 : SCREEN_HEIGHT * 0.22,
    left: Spacing.lg,
    right: Spacing.lg,
  },
  subtitle: {
    fontSize: SUBTITLE_FONT_SIZE,
    fontFamily: Typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  actionButtonsWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? SCREEN_HEIGHT * 0.06 : SCREEN_HEIGHT * 0.04,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.text.primary,
    borderRadius: ACTION_BUTTONS_CONTAINER_RADIUS,
    padding: 12,
    width: ACTION_BUTTONS_CONTAINER_WIDTH,
    height: ACTION_BUTTONS_CONTAINER_HEIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryActionButton: {
    width: PRIMARY_ACTION_BUTTON_SIZE,
    height: PRIMARY_ACTION_BUTTON_SIZE,
    borderRadius: PRIMARY_ACTION_BUTTON_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    backgroundColor: theme.colors.primary[600],
  },
  secondaryActionButton: {
    width: SECONDARY_ACTION_BUTTON_SIZE,
    height: SECONDARY_ACTION_BUTTON_SIZE,
    borderRadius: SECONDARY_ACTION_BUTTON_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    backgroundColor: theme.colors.text.inverse,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraPermissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: Spacing.xl,
  },
  cameraPermissionText: {
    fontSize: CAMERA_PERMISSION_FONT_SIZE,
    fontFamily: Typography.fontFamily.medium,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  permissionButton: {
    borderRadius: SCREEN_WIDTH * 0.03,
    shadowColor: theme.colors.primary[600],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
    overflow: 'hidden',
  },
  permissionButtonInner: {
    backgroundColor: theme.colors.primary[600],
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: SCREEN_WIDTH * 0.03,
  },
  permissionButtonText: {
    color: theme.colors.text.inverse,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: PERMISSION_BUTTON_FONT_SIZE,
    fontWeight: '600',
    textAlign: 'center',
  },
  cameraControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? SCREEN_HEIGHT * 0.05 : SCREEN_HEIGHT * 0.03,
    paddingTop: Spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  captureButton: {
    width: CAPTURE_BUTTON_SIZE,
    height: CAPTURE_BUTTON_SIZE,
    borderRadius: CAPTURE_BUTTON_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonOuter: {
    width: CAPTURE_BUTTON_OUTER_SIZE,
    height: CAPTURE_BUTTON_OUTER_SIZE,
    borderRadius: CAPTURE_BUTTON_OUTER_RADIUS,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  captureButtonInner: {
    width: CAPTURE_BUTTON_INNER_SIZE,
    height: CAPTURE_BUTTON_INNER_SIZE,
    borderRadius: CAPTURE_BUTTON_INNER_RADIUS,
    backgroundColor: theme.colors.text.inverse,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  closeButton: {
    padding: Spacing.sm,
    width: CONTROL_BUTTON_SIZE,
    height: CONTROL_BUTTON_SIZE,
    borderRadius: CONTROL_BUTTON_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonInner: {
    width: CONTROL_BUTTON_INNER_SIZE,
    height: CONTROL_BUTTON_INNER_SIZE,
    borderRadius: CONTROL_BUTTON_INNER_RADIUS,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  flipButton: {
    width: CONTROL_BUTTON_SIZE,
    height: CONTROL_BUTTON_SIZE,
    borderRadius: CONTROL_BUTTON_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.sm,
  },
  flipButtonInner: {
    width: CONTROL_BUTTON_INNER_SIZE,
    height: CONTROL_BUTTON_INNER_SIZE,
    borderRadius: CONTROL_BUTTON_INNER_RADIUS,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  imagePreviewContainer: {
    width: '100%',
    height: IMAGE_PREVIEW_HEIGHT,
    borderRadius: IMAGE_PREVIEW_RADIUS,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  processingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    overflow: 'hidden',
  },
  loader: {
    marginBottom: Spacing.md,
  },
  statusMessage: {
    fontSize: STATUS_MESSAGE_FONT_SIZE,
    fontFamily: Typography.fontFamily.medium,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
  },
  retryButton: {
    borderRadius: SCREEN_WIDTH * 0.03,
    marginTop: Spacing.md,
    shadowColor: theme.colors.primary[600],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
    overflow: 'hidden',
  },
  retryButtonInner: {
    backgroundColor: theme.colors.primary[600],
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SCREEN_WIDTH * 0.03,
  },
  retryButtonText: {
    color: theme.colors.text.inverse,
    fontSize: RETRY_BUTTON_FONT_SIZE,
    fontFamily: Typography.fontFamily.semiBold,
    fontWeight: '600',
  },
  prescriptionContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  scrollContent: {
    paddingBottom: SCREEN_HEIGHT * 0.12,
  },
  newScanButton: {
    borderRadius: SCREEN_WIDTH * 0.04,
    alignSelf: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    shadowColor: theme.colors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  newScanButtonInner: {
    backgroundColor: theme.colors.primary[600],
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    borderRadius: SCREEN_WIDTH * 0.04,
  },
  newScanButtonText: {
    color: theme.colors.text.inverse,
    fontSize: NEW_SCAN_BUTTON_FONT_SIZE,
    fontFamily: Typography.fontFamily.semiBold,
    fontWeight: '600',
  },
  bottomScanButtonWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? SCREEN_HEIGHT * 0.06 : SCREEN_HEIGHT * 0.04,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  dynamicCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: SCREEN_WIDTH * 0.04,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: CARD_TITLE_FONT_SIZE,
    fontFamily: Typography.fontFamily.bold,
    color: theme.colors.text.primary,
    marginBottom: Spacing.md,
  },
  dataItem: {
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.sm,
  },
  dataLabel: {
    fontSize: DATA_LABEL_FONT_SIZE,
    fontFamily: Typography.fontFamily.semiBold,
    color: theme.colors.primary[600],
    marginBottom: 2,
  },
  dataValue: {
    fontSize: DATA_VALUE_FONT_SIZE,
    fontFamily: Typography.fontFamily.regular,
    color: theme.colors.text.primary,
    lineHeight: DATA_VALUE_FONT_SIZE * 1.4,
  },
  nestedData: {
    marginLeft: Spacing.md,
    marginTop: Spacing.xs,
    paddingLeft: Spacing.sm,
    borderLeftWidth: SCREEN_WIDTH * 0.005,
    borderLeftColor: theme.colors.primary[200],
  },
  arrayItem: {
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: SCREEN_WIDTH * 0.02,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
    borderLeftWidth: SCREEN_WIDTH * 0.008,
    borderLeftColor: theme.colors.primary[400],
  },
  arrayIndex: {
    fontSize: ARRAY_INDEX_FONT_SIZE,
    fontFamily: Typography.fontFamily.bold,
    color: theme.colors.primary[600],
    marginBottom: 4,
  },
  rawTextCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: SCREEN_WIDTH * 0.04,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  rawText: {
    fontSize: RAW_TEXT_FONT_SIZE,
    fontFamily: Typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    lineHeight: RAW_TEXT_FONT_SIZE * 1.4,
    backgroundColor: theme.colors.surfaceSecondary,
    padding: Spacing.sm,
    borderRadius: 8,
  },
});