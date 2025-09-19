/**
 * August.ai Type Definitions
 */

// Chat Types
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  status: 'sending' | 'sent' | 'failed' | 'typing';
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'file';
  uri: string;
  name: string;
  size?: number;
}

export interface Chat {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// Prescription Types
export interface PrescriptionData {
  id: string;
  extractedText: string;
  imageUri: string;
  createdAt: Date;
  parsedData: { [key: string]: any }; // Completely dynamic parsed data
}

// Keep Medicine interface for backward compatibility but make it optional
export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
}

// OCR Types
export interface OCRResult {
  text: string;
  confidence: number;
}

// API Types
export interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// Navigation Types
export type RootStackParamList = {
  '(tabs)': undefined;
  splash: undefined;
};

export type TabParamList = {
  chat: undefined;
  explore: undefined;
  nutrition: undefined;
  settings: undefined;
};