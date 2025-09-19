import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, StatusBar, Image } from 'react-native';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  runOnJS
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  const navigateToMain = () => {
    router.replace('/home');
  };

  useEffect(() => {
    // Animate logo appearance with a super fast animation
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withSequence(
      withTiming(1.05, { duration: 250 }),
      withTiming(1, { duration: 150 }, () => {
        // Navigate to main app after animation
        setTimeout(() => {
          runOnJS(navigateToMain)();
        }, 200); // Very short delay before navigation
      })
    );
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1f6e56" />
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <Image 
          source={require('@/assets/splash-text.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f6e56', // Deep green background
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: width * 0.8, // 80% of screen width
    height: height * 0.2, // 20% of screen height
    maxWidth: 300, // Maximum width
    maxHeight: 100, // Maximum height
  },
});