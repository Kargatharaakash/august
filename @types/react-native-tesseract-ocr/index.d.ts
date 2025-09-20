declare module 'react-native-tesseract-ocr' {
  // Language constants
  export const LANG_ENGLISH: string;
  export const LANG_FRENCH: string;
  export const LANG_ITALIAN: string;
  export const LANG_GERMAN: string;
  export const LANG_SPANISH: string;
  export const LANG_PORTUGUESE: string;
  export const LANG_DUTCH: string;
  export const LANG_CHINESE: string;
  export const LANG_JAPANESE: string;
  export const LANG_KOREAN: string;

  // Options interface
  export interface TesseractOptions {
    lang?: string;
    whitelist?: string;
    blacklist?: string;
    [key: string]: any;
  }

  // Result interface
  export interface TesseractResult {
    text: string;
    confidence?: number;
  }

  // Main methods
  declare const TesseractOcr: {
    recognize(imageUri: string, options: TesseractOptions): Promise<string>;
    recognizeTokens(imageUri: string, options: TesseractOptions): Promise<string[]>;
  };
  
  export default TesseractOcr;
}