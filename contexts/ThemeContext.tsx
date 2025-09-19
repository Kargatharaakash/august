/**
 * August.ai Theme System
 * Complete dark/light mode implementation with context provider
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, ColorSchemeName } from 'react-native';

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'light' | 'dark';

interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceTertiary: string;
  
  // Primary colors
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  
  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    disabled: string;
  };
  
  // UI colors
  border: string;
  borderSecondary: string;
  separator: string;
  
  // Semantic colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Shadow and overlay
  shadow: string;
  overlay: string;
  
  // Card and surface variants
  card: string;
  cardSecondary: string;
  
  // Input colors
  input: {
    background: string;
    border: string;
    focused: string;
    placeholder: string;
  };
  
  // Notification colors
  notification: {
    background: string;
    border: string;
    text: string;
  };
}

interface Theme {
  mode: ColorScheme;
  colors: ThemeColors;
}

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

// Light theme colors
const lightColors: ThemeColors = {
  background: '#ffffff',
  surface: '#f8fafc',
  surfaceSecondary: '#f1f5f9',
  surfaceTertiary: '#e2e8f0',
  
  primary: {
    50: '#e6f5ef',
    100: '#cceadf',
    200: '#99d5bf',
    300: '#66c09f',
    400: '#33ab7f',
    500: '#00965f',
    600: '#00784c',
    700: '#005a39',
    800: '#003c26',
    900: '#001e13',
  },
  
  text: {
    primary: '#0f172a',
    secondary: '#64748b',
    tertiary: '#94a3b8',
    inverse: '#ffffff',
    disabled: '#cbd5e1',
  },
  
  border: '#e2e8f0',
  borderSecondary: '#cbd5e1',
  separator: '#f1f5f9',
  
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  card: '#ffffff',
  cardSecondary: '#f8fafc',
  
  input: {
    background: '#ffffff',
    border: '#e2e8f0',
    focused: '#00965f',
    placeholder: '#94a3b8',
  },
  
  notification: {
    background: '#ffffff',
    border: '#e2e8f0',
    text: '#0f172a',
  },
};

// Dark theme colors - True Black Dark Mode
const darkColors: ThemeColors = {
  background: '#000000',
  surface: '#111111',
  surfaceSecondary: '#1a1a1a',
  surfaceTertiary: '#2a2a2a',
  
  primary: {
    50: '#001e13',
    100: '#003c26',
    200: '#005a39',
    300: '#00784c',
    400: '#00965f',
    500: '#33ab7f',
    600: '#66c09f',
    700: '#99d5bf',
    800: '#cceadf',
    900: '#e6f5ef',
  },
  
  text: {
    primary: '#ffffff',
    secondary: '#cccccc',
    tertiary: '#999999',
    inverse: '#000000',
    disabled: '#666666',
  },
  
  border: '#333333',
  borderSecondary: '#444444',
  separator: '#222222',
  
  success: '#10b981',
  warning: '#f59e0b',
  error: '#f87171',
  info: '#60a5fa',
  
  shadow: 'rgba(0, 0, 0, 0.5)',
  overlay: 'rgba(0, 0, 0, 0.8)',
  
  card: '#111111',
  cardSecondary: '#1a1a1a',
  
  input: {
    background: '#111111',
    border: '#333333',
    focused: '#33ab7f',
    placeholder: '#666666',
  },
  
  notification: {
    background: '#111111',
    border: '#333333',
    text: '#ffffff',
  },
};

// Theme objects
const lightTheme: Theme = {
  mode: 'light',
  colors: lightColors,
};

const darkTheme: Theme = {
  mode: 'dark',
  colors: darkColors,
};

// Storage key
const THEME_STORAGE_KEY = '@august_theme_mode';

// Create context
const ThemeContext = createContext<ThemeContextType | null>(null);

// Theme provider component
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [systemColorScheme, setSystemColorScheme] = useState<ColorScheme>(
    Appearance.getColorScheme() || 'light'
  );

  // Load theme mode from storage on mount
  useEffect(() => {
    loadThemeMode();
  }, []);

  // Listen to system color scheme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme || 'light');
    });

    return () => subscription.remove();
  }, []);

  const loadThemeMode = async () => {
    try {
      const storedThemeMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (storedThemeMode && ['light', 'dark', 'system'].includes(storedThemeMode)) {
        setThemeModeState(storedThemeMode as ThemeMode);
      }
    } catch (error) {
      console.error('Failed to load theme mode:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  };

  // Determine the actual color scheme to use
  const getColorScheme = (): ColorScheme => {
    if (themeMode === 'system') {
      return systemColorScheme;
    }
    return themeMode;
  };

  const colorScheme = getColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const isDark = colorScheme === 'dark';

  const value: ThemeContextType = {
    theme,
    themeMode,
    setThemeMode,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Helper function to get theme-aware colors (backward compatibility)
export const getThemeColors = (isDark: boolean): ThemeColors => {
  return isDark ? darkColors : lightColors;
};

// Export theme objects for direct use if needed
export { lightTheme, darkTheme, lightColors, darkColors };