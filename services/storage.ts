/**
 * Local Storage Service using AsyncStorage
 * Handles persistence of chat messages and prescription data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, Chat, PrescriptionData } from '@/types';

// Storage Keys
const STORAGE_KEYS = {
  CHATS: '@august_ai_chats',
  PRESCRIPTIONS: '@august_ai_prescriptions',
  USER_SETTINGS: '@august_ai_settings',
  HEALTH_TIPS: '@august_ai_health_tips',
} as const;

/**
 * Chat Storage Functions
 */
export async function saveChat(chat: Chat): Promise<void> {
  try {
    const existingChats = await getChats();
    const updatedChats = existingChats.filter(c => c.id !== chat.id);
    updatedChats.unshift(chat); // Add to beginning
    
    await AsyncStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(updatedChats));
  } catch (error) {
    console.error('Failed to save chat:', error);
    throw new Error('Failed to save chat');
  }
}

export async function getChats(): Promise<Chat[]> {
  try {
    const chatsJson = await AsyncStorage.getItem(STORAGE_KEYS.CHATS);
    if (!chatsJson) return [];
    
    const chats = JSON.parse(chatsJson);
    // Convert date strings back to Date objects
    return chats.map((chat: any) => ({
      ...chat,
      createdAt: new Date(chat.createdAt),
      updatedAt: new Date(chat.updatedAt),
      messages: chat.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
    }));
  } catch (error) {
    console.error('Failed to get chats:', error);
    return [];
  }
}

export async function deleteChat(chatId: string): Promise<void> {
  try {
    const existingChats = await getChats();
    const updatedChats = existingChats.filter(c => c.id !== chatId);
    await AsyncStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(updatedChats));
  } catch (error) {
    console.error('Failed to delete chat:', error);
    throw new Error('Failed to delete chat');
  }
}

/**
 * Prescription Storage Functions
 */
export async function savePrescription(prescription: PrescriptionData): Promise<void> {
  try {
    const existingPrescriptions = await getPrescriptions();
    const updatedPrescriptions = existingPrescriptions.filter(p => p.id !== prescription.id);
    updatedPrescriptions.unshift(prescription); // Add to beginning
    
    await AsyncStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(updatedPrescriptions));
  } catch (error) {
    console.error('Failed to save prescription:', error);
    throw new Error('Failed to save prescription');
  }
}

export async function getPrescriptions(): Promise<PrescriptionData[]> {
  try {
    const prescriptionsJson = await AsyncStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS);
    if (!prescriptionsJson) return [];
    
    const prescriptions = JSON.parse(prescriptionsJson);
    // Convert date strings back to Date objects
    return prescriptions.map((prescription: any) => ({
      ...prescription,
      createdAt: new Date(prescription.createdAt),
    }));
  } catch (error) {
    console.error('Failed to get prescriptions:', error);
    return [];
  }
}

export async function deletePrescription(prescriptionId: string): Promise<void> {
  try {
    const existingPrescriptions = await getPrescriptions();
    const updatedPrescriptions = existingPrescriptions.filter(p => p.id !== prescriptionId);
    await AsyncStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(updatedPrescriptions));
  } catch (error) {
    console.error('Failed to delete prescription:', error);
    throw new Error('Failed to delete prescription');
  }
}

/**
 * Settings Storage Functions
 */
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  hapticFeedback: boolean;
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
    throw new Error('Failed to save settings');
  }
}

export async function getSettings(): Promise<UserSettings> {
  try {
    const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    if (!settingsJson) {
      // Return default settings
      return {
        theme: 'system',
        notifications: true,
        hapticFeedback: true,
      };
    }
    
    return JSON.parse(settingsJson);
  } catch (error) {
    console.error('Failed to get settings:', error);
    return {
      theme: 'system',
      notifications: true,
      hapticFeedback: true,
    };
  }
}

/**
 * Utility Functions
 */
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Failed to clear all data:', error);
    throw new Error('Failed to clear all data');
  }
}

/**
 * Generic Storage Functions
 */
export async function storeData(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error(`Failed to store data for key ${key}:`, error);
    throw new Error('Failed to store data');
  }
}

export async function getData(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error(`Failed to get data for key ${key}:`, error);
    throw new Error('Failed to get data');
  }
}

export async function removeData(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove data for key ${key}:`, error);
    throw new Error('Failed to remove data');
  }
}