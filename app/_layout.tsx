// Import polyfills first
import '@/utils/polyfills';
import '@/i18n'; // Initialize i18n

import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Onboarding from '@/components/Onboarding';

// Prevent auto-hide splash screen
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  
  // TOGGLE THIS: true = always show onboarding, false = only for first-time users
  const FORCE_ONBOARDING = false;
  
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  const checkOnboardingStatus = async () => {
    try {
      if (FORCE_ONBOARDING) {
        // Always show onboarding when FORCE_ONBOARDING is true
        setShowOnboarding(true);
        return;
      }
      
      const hasCompletedOnboarding = await AsyncStorage.getItem('@august_onboarding_completed');
      setShowOnboarding(hasCompletedOnboarding !== 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setShowOnboarding(true); // Show onboarding by default if error
    }
  };

  const handleOnboardingComplete = () => {
    // Save onboarding completion status
    AsyncStorage.setItem('@august_onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Show onboarding if user hasn't seen it yet
  if (showOnboarding === true) {
    return (
      <ThemeProvider>
        <Onboarding onComplete={handleOnboardingComplete} />
      </ThemeProvider>
    );
  }

  // Don't render anything while checking onboarding status
  if (showOnboarding === null) {
    return null;
  }

  return (
    <ThemeProvider>
      <Stack screenOptions={{ 
        headerShown: false, 
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: 'transparent' }
      }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="chat" options={{ headerShown: false }} />
        <Stack.Screen name="prescription" options={{ headerShown: false }} />
        <Stack.Screen name="wellness" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="records" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="splash" options={{ headerShown: false }} />
        
        <Stack.Screen name="coming-soon" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}