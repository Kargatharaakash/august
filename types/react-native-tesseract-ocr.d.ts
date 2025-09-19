declare module 'react-native-tesseract-ocr' {
  export const LANG_ENGLISH: string;
  export const LANG_FRENCH: string;
  export const LANG_GERMAN: string;
  export const LANG_SPANISH: string;
  export const LANG_PORTUGUESE: string;
  export const LANG_CHINESE_SIMPLIFIED: string;
  export const LANG_CHINESE_TRADITIONAL: string;
  export const LANG_JAPANESE: string;
  export const LANG_KOREAN: string;
  export const LANG_ARABIC: string;
  export const LANG_HINDI: string;

  export interface TesseractOptions {
    whitelist?: string;
    blacklist?: string;
  }

  export interface TesseractResult {
    text: string;
    confidence?: number;
  }

  export default {
    recognize: (imagePath: string, lang?: string, options?: TesseractOptions) => Promise<string>,
    recognizeTokens: (imagePath: string, lang?: string, options?: TesseractOptions) => Promise<string[]>,
    recognizeWithConfidence: (imagePath: string, lang?: string, options?: TesseractOptions) => Promise<TesseractResult>,
  };
}