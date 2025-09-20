import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, StatusBar, Image, Animated } from 'react-native';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const opacity = new Animated.Value(0);
  const scale = new Animated.Value(0.8); // Start smaller to accommodate larger image

  const navigateToMain = () => {
    router.replace('/home');
  };

  useEffect(() => {
    // Animate logo appearance with a super fast animation
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.05,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Navigate to main app after animation
      setTimeout(() => {
        navigateToMain();
      }, 200); // Very short delay before navigation
    });
  }, []);

  const logoStyle = {
    opacity,
    transform: [{ scale }],
  };

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
    width: '100%', // Full width container
  },
  logoImage: {
    width: '100%', // Full width
    height: height * 0.3, // Increase height to 30% of screen height
    maxWidth: width, // Maximum width is full screen width
    maxHeight: 200, // Increase maximum height
  },
});