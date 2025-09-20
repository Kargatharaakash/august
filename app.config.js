module.exports = {
  name: "August.ai",
  slug: "august-ai",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  scheme: "augustai", // Added scheme for deep linking
  splash: {
    image: "./assets/splash-text.png", // We'll create this asset
    resizeMode: "contain",
    backgroundColor: "#1a6751" // Match the deep green from the image
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.august.ai"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#1a6751", // Match the deep green from the image
      softwareKeyboardLayoutMode: "pan"

    },
    package: "com.august.ai"
  },
  web: {
    favicon: "./assets/icon.png"
  },
  extra: {
    // Access environment variables
    EXPO_PUBLIC_GROQ_API_KEY: process.env.EXPO_PUBLIC_GROQ_API_KEY,
    EXPO_PUBLIC_OCR_API_KEY: process.env.EXPO_PUBLIC_OCR_API_KEY,
    eas: {
      projectId: "4953fea8-325d-4263-97d2-f3aaee742624"
    }
  },
  plugins: [
    "expo-router",
    "expo-font",
    "expo-web-browser",
    [
      "expo-camera",
      {
        "cameraPermission": "Allow August.ai to access your camera to scan prescriptions."
      }
    ],
    [
      "expo-image-picker",
      {
        "photosPermission": "Allow August.ai to access your photos to upload prescription images."
      }
    ]
  ]
};