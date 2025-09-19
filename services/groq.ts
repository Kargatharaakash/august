/**
 * Groq API Service
 * Handles all LLM interactions for chat and prescription parsing
 */

import Groq from 'groq-sdk';
import Constants from 'expo-constants';
import { Alert } from 'react-native';
import { readAsStringAsync } from 'expo-file-system/legacy';

// Get API key from environment variables
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';

// Check if API key is available
if (!GROQ_API_KEY) {
  console.warn('GROQ API key is not set. Please add it to your .env file.');
}

// Initialize Groq client
const groq = new Groq({
  apiKey: GROQ_API_KEY,
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
}

export interface PrescriptionParseResult {
  [key: string]: any; // Completely dynamic - accept any structure
}

export interface HealthTip {
  id: number;
  title: string;
  content: string;
  category: string;
}

/**
 * Convert image URI to base64 format for Groq Llama 4 Scout
 */
export async function convertImageToBase64(imageUri: string): Promise<string> {
  try {
    const base64 = await readAsStringAsync(imageUri, {
      encoding: 'base64',
    });
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error('Failed to process image');
  }
}

/**
 * Send a chat message to Groq using Llama 4 Scout with image support
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  language?: string
): Promise<string> {
  try {
    const userLanguage = language || 'English';
    
    const systemMessage = {
      role: 'system' as const,
      content: `You are August, a helpful AI health assistant. Provide accurate, helpful responses while being friendly and professional. Always remind users to consult healthcare professionals for medical advice. Respond in ${userLanguage} language. If the user asks in a specific language, respond in that language.`,
    };

    const completion = await groq.chat.completions.create({
      messages: [
        systemMessage,
        ...messages as any, // Type assertion for Groq API compatibility
      ],
      model: 'meta-llama/llama-4-scout-17b-16e-instruct', // Use Llama 4 Scout for all messages
      temperature: 0.7,
      max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Groq API Error:', error);
    throw new Error('Failed to get response from AI assistant');
  }
}

/**
 * Parse OCR text from prescription image using Groq
 */
export async function parsePrescriptionText(
  ocrText: string
): Promise<PrescriptionParseResult> {
  try {
    const prompt = `
Extract ALL possible information from this prescription text. Be extremely thorough and capture EVERYTHING you can find. Return a comprehensive JSON object with ALL data you can extract - don't limit yourself to predefined fields.

Prescription text:
${ocrText}

Extract ALL information you can find including but not limited to:
- Patient information (name, age, address, ID, etc.)
- All medications with ALL details (names, dosages, frequencies, instructions, etc.)
- Doctor/prescriber information (name, credentials, license, etc.)
- Medical facility information (name, address, phone, etc.)
- Prescription details (date, number, lot numbers, expiry dates, etc.)
- Any medical codes, references, forms numbers
- Any warnings, notes, instructions
- Any other relevant information you can extract

Return a comprehensive JSON object with ALL extracted data. Use descriptive field names. Group related information logically. Don't skip anything - extract EVERYTHING:

{
  "extracted_data": {
    // Put ALL extracted information here with descriptive field names
    // Use nested objects for grouping related data
    // Extract EVERYTHING - no predefined limits
  }
}

IMPORTANT: Extract ALL information, not just common fields. Be thorough and comprehensive. Return valid JSON only.
`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a medical text parser. Extract prescription information accurately and return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      max_tokens: 1024,
    });

    const response = completion.choices[0]?.message?.content || '{}';
    
    console.log('Raw Groq response:', response);
    
    try {
      // Clean the response - remove markdown formatting and extra characters
      let cleanedResponse = response;
      
      // Remove markdown JSON blocks
      const jsonMatch = cleanedResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                       cleanedResponse.match(/```\s*([\s\S]*?)\s*```/);
      
      if (jsonMatch) {
        cleanedResponse = jsonMatch[1];
      }
      
      // Remove any leading/trailing whitespace
      cleanedResponse = cleanedResponse.trim();
      
      console.log('Cleaned response for parsing:', cleanedResponse);
      
      const parsed = JSON.parse(cleanedResponse);
      // Return the complete dynamic structure
      return parsed;
    } catch (parseError) {
      console.error('Failed to parse Groq response as JSON:', parseError);
      console.log('Response that failed to parse:', response);
      
      // Return fallback dynamic structure
      return {
        error: 'Unable to parse prescription details',
        raw_text: ocrText,
        parsing_failed: true,
        confidence: 0.1,
      };
    }
  } catch (error) {
    console.error('Groq Prescription Parse Error:', error);
    throw new Error('Failed to parse prescription with AI');
  }
}

/**
 * Fetch health tips from Groq LLM
 * Returns an array of 60 health tips
 */
export async function fetchHealthTips(): Promise<HealthTip[]> {
  try {
    const systemPrompt = `You are a health and wellness expert. Generate 60 concise, educational health tips about human health and wellness.
    Each tip should be informative, accurate, and helpful for general health education.
    
    Return ONLY a JSON array with 60 objects having this structure:
    [
      {
        "id": 1,
        "title": "Short, catchy title",
        "content": "Informative content about the health tip (2-3 sentences)",
        "category": "One of: Nutrition, Fitness, Mental Health, Sleep, Preventive Care, Hydration, Posture, Immunity"
      },
      ...
    ]
    
    Make sure tips cover a variety of health topics and are suitable for general audience education.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate 60 educational health tips in JSON format.' },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 4000,
    });

    const responseContent = completion.choices[0]?.message?.content || '';
    
    try {
      // Extract JSON from the response
      const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) || 
                        responseContent.match(/\[\s*\{[\s\S]*?\}\s*\]/);
      
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseContent;
      const result = JSON.parse(jsonString);
      
      return result as HealthTip[];
    } catch (parseError) {
      console.error('Error parsing JSON from LLM response:', parseError);
      // Return a small set of fallback health tips if parsing fails
      return generateFallbackHealthTips();
    }
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw new Error('Failed to fetch health tips. Please try again.');
  }
}

/**
 * Generate fallback health tips in case the API call fails
 */
function generateFallbackHealthTips(): HealthTip[] {
  return [
    {
      id: 1,
      title: "Stay Hydrated",
      content: "Drink at least 8 glasses of water daily. Proper hydration supports all bodily functions and helps maintain energy levels throughout the day.",
      category: "Hydration"
    },
    {
      id: 2,
      title: "Mindful Breathing",
      content: "Practice deep breathing for 5 minutes daily. This simple technique can reduce stress, lower blood pressure, and improve mental clarity.",
      category: "Mental Health"
    },
    {
      id: 3,
      title: "Regular Movement",
      content: "Aim for 30 minutes of moderate exercise daily. Regular physical activity strengthens your heart, improves mood, and helps maintain a healthy weight.",
      category: "Fitness"
    },
    {
      id: 4,
      title: "Balanced Nutrition",
      content: "Fill half your plate with vegetables and fruits. A colorful diet ensures you get a wide range of nutrients essential for optimal health.",
      category: "Nutrition"
    },
    {
      id: 5,
      title: "Quality Sleep",
      content: "Prioritize 7-9 hours of quality sleep nightly. Good sleep hygiene improves cognitive function, mood, and supports immune health.",
      category: "Sleep"
    }
  ];
}