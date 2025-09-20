# August.ai - Health Assistant Mobile App

A React Native Expo mobile application for health assistance featuring a chat interface powered by Groq LLM and a prescription reader using OCR.space API.

## Features

### Chat Interface
- Modern chat UI with message bubbles, timestamps, and status indicators
- Image attachment support
- Real-time message updates
- Groq LLM integration for AI responses using meta-llama/llama-4-scout-17b-16e-instruct model
- Local storage for message history
- Error handling and retry mechanisms

### Prescription Reader
- Camera integration for capturing prescription images
- Photo library picker for selecting existing images
- OCR text extraction with status indicators using OCR.space API Engine 2
- Groq LLM parsing for structured prescription data using llama-3.3-70b-versatile model
- Detailed prescription information display
- Error handling and retry options

### Wellness Tips
- Interactive card-based UI for health tips
- Smooth swipe gestures to navigate between tips
- Cached data for offline access
- Multi-language support with health tips generation using llama-3.1-8b-instant model

### Health Records
- Comprehensive health records management
- Prescription history tracking
- Personal health information storage
- Search and filter capabilities

### Profile Management
- Personal information management
- Health profile customization
- Profile picture update support
- User name personalized to "Raj"

### Settings
- Theme customization (Light/Dark mode)
- Multi-language support (English, Hindi, Gujarati)
- Notification preferences
- Privacy and security settings

### Notifications
- In-app notification center with categorized notifications
- Interactive notification cards with actions
- Notification filtering by type (medication, appointments, etc.)
- Unread notification indicators
- Mark all as read functionality
- Pull-to-refresh for updating notifications
- Time-based notification sorting

### Onboarding
- Guided introduction for new users
- Responsive design with consistent UI
- Smooth navigation between screens
- Special text formatting for "Digital Prescriptions" split across three lines

## Tech Stack

- **Frontend**: React Native with Expo v54
- **LLM**: Groq API with multiple models:
  - meta-llama/llama-4-scout-17b-16e-instruct for chat messages
  - llama-3.3-70b-versatile for prescription parsing
  - llama-3.1-8b-instant for health tips generation
- **OCR**: OCR.space API with Engine 2 (supports handwritten text)
- **Storage**: AsyncStorage (local)
- **Navigation**: Expo Router with Tabs
- **Styling**: StyleSheet with design system
- **State Management**: React Hooks + Context
- **Camera**: Expo Camera
- **Image Handling**: Expo ImagePicker
- **Animations**: React Native Animated API
- **Haptics**: Expo Haptics
- **Internationalization**: i18next with multi-language support (English, Hindi, Gujarati)

## Design System

- **Color Scheme**: Professional green-based theme with light/dark mode support
- **Typography**: Consistent font system with multiple weights
- **Spacing**: Standardized spacing system for consistent UI
- **UI Components**: Custom component library for consistent user experience

## Setup & Installation

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator (for local development)
- Groq API Key (for LLM functionality)
- OCR.space API Key (for OCR functionality)

### Environment Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Set up your environment variables:
   - A `.env.example` file is provided as a template
   - Copy it to create your own `.env` file:
     ```bash
     cp .env.example .env
     ```
   - Edit the `.env` file and add your API keys:
     ```
     EXPO_PUBLIC_GROQ_API_KEY=your_actual_groq_api_key_here
     EXPO_PUBLIC_OCR_API_KEY=your_actual_ocr_space_api_key_here
     ```

> **Important**: For demo purposes, the app includes a fallback API key for OCR functionality, but it's recommended to use your own API keys for production usage.

### Running the App

```bash
# Start the development server
npm run dev
# or
yarn dev

# Run on iOS simulator
npm run ios
# or
yarn ios

# Run on Android emulator
npm run android
# or
yarn android

# Run on web browser
npm run web
# or
yarn web
```

## Building for Production

### Prerequisites for EAS Builds
- Expo Account (create at https://expo.dev/)
- EAS CLI installed (`npm install -g eas-cli`)
- Logged in to EAS (`eas login`)

### First-time EAS Setup
1. Run `eas login` to log in to your Expo account
2. Run `eas build --platform android --profile release` to start the build
3. When prompted, confirm creating a new EAS project
4. When prompted, confirm generating a new Android Keystore (for new projects)
5. Wait for the build to complete

### Building APK for Direct Distribution
To generate an APK file that can be sent directly to someone (not for store distribution):

```bash
# Build APK for direct distribution
eas build --platform android --profile release

# Build APK for preview/testing
eas build --platform android --profile preview
```

The build will generate an APK file that can be downloaded and installed directly on Android devices without going through the Google Play Store.

### EAS Configuration Profiles
- **preview**: Generates an APK for testing and direct distribution
- **release**: Generates an APK for direct distribution (internal)
- **production**: Generates an App Bundle for Google Play Store submission

### Android

```bash
# Build for Android using EAS (requires Expo account)
eas build --platform android --profile release

# Build for Android with development profile
eas build --platform android --profile development

# Build for Android with preview profile
eas build --platform android --profile preview
```

### iOS

```bash
# Build for iOS using EAS (requires Expo account and Apple Developer account)
eas build --platform ios --profile release

# Build for iOS with development profile
eas build --platform ios --profile development

# Build for iOS with preview profile
eas build --platform ios --profile preview
```

### Web

```bash
# Export for web deployment
npm run build:web
# or
yarn build:web
```

## EAS Configuration

The project uses EAS (Expo Application Services) for building and deploying mobile apps:

- **Development**: For internal testing with development client
- **Preview**: For internal distribution (TestFlight/App Store Connect)
- **Production**: For App Store/Google Play distribution
- **Release**: For direct store distribution with app bundle generation

To set up EAS for the first time:
1. Run `eas login` to log in to your Expo account
2. Run `eas build --platform android --profile release` to start the build
3. Follow the prompts to configure the EAS project if needed

## License

This project is proprietary and confidential.

## Acknowledgements

- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [Groq](https://groq.com/)
- [OCR.space](https://ocr.space/)