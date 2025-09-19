/**
 * OCR Service using OCR.space API with Engine 2
 * Handles text extraction from prescription images including handwritten text
 */

import * as ImageManipulator from 'expo-image-manipulator';
import { readAsStringAsync } from 'expo-file-system/legacy';

export interface OCROptions {
  enhanceImage?: boolean; // Whether to enhance the image before OCR
  detectOrientation?: boolean; // Auto-rotate image if needed
  isTable?: boolean; // Optimize for table-like structures
}

export interface OCRResult {
  text: string;
  confidence: number;
}

/**
 * Enhanced image for better OCR results
 */
async function enhanceImageForOCR(imageUri: string): Promise<string> {
  try {
    console.log('Enhancing image for better OCR results...');
    
    // Apply image enhancements for better OCR accuracy
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        // Resize to optimal size for OCR (1200px width as per project memory)
        { resize: { width: 1200 } },
      ],
      {
        compress: 0.9, // High quality for better text recognition
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );
    
    console.log('Image enhanced successfully:', manipulatedImage.uri);
    return manipulatedImage.uri;
  } catch (error) {
    console.warn('Failed to enhance image, using original:', error);
    return imageUri; // Return original if enhancement fails
  }
}

/**
 * Convert image to base64 for OCR.space API
 */
async function imageToBase64(imageUri: string): Promise<string> {
  try {
    const base64 = await readAsStringAsync(imageUri, {
      encoding: 'base64' as any,
    });
    return base64;
  } catch (error) {
    console.error('Failed to convert image to base64:', error);
    throw new Error('Failed to process image');
  }
}

/**
 * OCR using OCR.space API with Engine 2 (supports handwritten text)
 */
async function performOCRSpaceAPI(base64Image: string, options: OCROptions = {}): Promise<string> {
  try {
    // Access API key from environment - Expo automatically loads .env variables with EXPO_PUBLIC_ prefix
    const apiKey = process.env.EXPO_PUBLIC_OCR_API_KEY || 'K87765209888957'; // Fallback to demo key
    
    console.log('Calling OCR.space API with Engine 2...');
    
    const formData = new FormData();
    formData.append('base64Image', `data:image/jpeg;base64,${base64Image}`);
    formData.append('language', 'eng'); // English, but Engine 2 can auto-detect
    formData.append('OCREngine', '2'); // Engine 2 for handwritten text support
    formData.append('detectOrientation', options.detectOrientation ? 'true' : 'false');
    formData.append('scale', 'true'); // Improve OCR for low-resolution images
    formData.append('isTable', options.isTable ? 'true' : 'false');
    // Remove filetype restriction - let API auto-detect
    
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OCR API request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log('OCR.space API response:', result);
    
    if (result.OCRExitCode !== 1) {
      const errorMessage = result.ErrorMessage && result.ErrorMessage.length > 0 
        ? result.ErrorMessage[0] 
        : 'OCR processing failed';
      throw new Error(`OCR failed: ${errorMessage}`);
    }
    
    if (!result.ParsedResults || result.ParsedResults.length === 0) {
      throw new Error('No text could be extracted from the image');
    }
    
    // Extract text from the first parsed result
    const extractedText = result.ParsedResults[0].ParsedText;
    
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No readable text found in the image');
    }
    
    return extractedText.trim();
  } catch (error) {
    console.error('OCR.space API error:', error);
    throw error;
  }
}

/**
 * Extract text from image using OCR.space API with Engine 2
 */
export async function extractTextFromImage(
  imageUri: string,
  options: OCROptions = {}
): Promise<OCRResult> {
  try {
    console.log('Starting OCR process for image:', imageUri);
    
    // Enhance image if requested (default: true, following project memory)
    let processedImageUri = imageUri;
    if (options.enhanceImage !== false) {
      processedImageUri = await enhanceImageForOCR(imageUri);
    }
    
    // Convert image to base64 for API
    console.log('Converting image to base64...');
    const base64Image = await imageToBase64(processedImageUri);
    
    // Perform OCR using OCR.space API with Engine 2
    console.log('Performing OCR using OCR.space API Engine 2...');
    const extractedText = await performOCRSpaceAPI(base64Image, {
      detectOrientation: options.detectOrientation ?? true,
      isTable: options.isTable ?? false,
    });
    
    console.log('OCR extraction completed. Text length:', extractedText.length);
    console.log('Extracted text preview:', extractedText.substring(0, 200) + '...');
    
    if (!extractedText || extractedText.length < 5) {
      throw new Error('Could not extract enough readable text from the image. Please try with a clearer, well-lit image of the prescription.');
    }
    
    // Calculate confidence based on text length and common medical terms
    const confidence = calculateOCRConfidence(extractedText);
    
    console.log('OCR completed successfully with confidence:', confidence);

    return {
      text: extractedText,
      confidence,
    };
  } catch (error) {
    console.error('OCR Error details:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Provide more helpful error messages
    let errorMessage = 'Failed to extract text from image';
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'OCR service configuration error. Please check API key.';
      } else if (error.message.includes('No text')) {
        errorMessage = 'No readable text found in the image. Please ensure the prescription is clear and well-lit';
      } else if (error.message.includes('too short')) {
        errorMessage = error.message;
      } else {
        errorMessage = `OCR failed: ${error.message}`;
      }
    }
    
    throw new Error(errorMessage);
  }
}

/**
 * Calculate OCR confidence based on text characteristics
 */
function calculateOCRConfidence(text: string): number {
  if (!text || text.length < 10) return 0.1;

  let confidence = 0.5; // Base confidence

  // Check for common medical/prescription terms
  const medicalTerms = [
    'mg', 'ml', 'tablet', 'capsule', 'dose', 'daily', 'twice', 'morning',
    'evening', 'before', 'after', 'meal', 'prescription', 'rx', 'dr',
    'doctor', 'patient', 'take', 'medication', 'medicine'
  ];

  const lowerText = text.toLowerCase();
  const foundTerms = medicalTerms.filter(term => lowerText.includes(term));
  
  // Increase confidence based on medical terms found
  confidence += (foundTerms.length / medicalTerms.length) * 0.3;

  // Check for numbers (dosages, dates)
  const hasNumbers = /\d/.test(text);
  if (hasNumbers) confidence += 0.1;

  // Check for proper capitalization patterns
  const hasProperCase = /[A-Z]/.test(text) && /[a-z]/.test(text);
  if (hasProperCase) confidence += 0.1;

  return Math.min(confidence, 1.0);
}