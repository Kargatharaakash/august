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
- **Animations**: React Native Reanimated
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

> **Important**: For demo purposes, the app includes mock implementations for the OCR functionality, so you can test the app without setting up OCR.space API.

### Running the App

```bash
# Start the development server
npm run dev
# or
yarn dev

# Run on iOS
npm run ios
# or
yarn ios

# Run on Android
npm run android
# or
yarn android
```

## Key Improvements & Customizations

### Onboarding Experience
- Clean, consistent UI with no unnecessary elements
- Progress indicators showing current screen
- Responsive design for all device sizes
- Proper navigation flow (Continue takes to next screen, Start Using takes to home)

### Wellness Screen
- Smooth card swiping functionality with proper gesture handling
- Stack effect showing next card behind current one
- Visual feedback during swiping with rotation and scaling
- Fallback to mock data when API is unavailable

### Splash Screen
- Custom image-based splash screen with brand colors
- Smooth animation on app launch

### User Personalization
- User name changed from "Aakash" to "Raj" throughout the app

## Project Structure

- **app/**: Main application code with Expo Router structure
  - **(tabs)/**: Tab-based navigation components
- **assets/**: Images and static resources
- **components/**: Reusable UI components
- **constants/**: Design system constants (Colors, Typography, Spacing)
- **services/**: API and functionality services (Groq LLM, OCR, Storage)
- **hooks/**: Custom React hooks
- **types/**: TypeScript type definitions
- **utils/**: Helper functions and utilities

## Building for Production

### Android

```bash
npm run build:android
# or
yarn build:android
```

### iOS

```bash
npm run build:ios
# or
yarn build:ios
```

### Web

```bash
npm run build:web
# or
yarn build:web
```

## License

This project is proprietary and confidential.

## Acknowledgements

- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [Groq](https://groq.com/)
- [OCR.space](https://ocr.space/)