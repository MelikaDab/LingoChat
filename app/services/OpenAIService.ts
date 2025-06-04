import axios from 'axios';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
// Required polyfill for React Native
import { Buffer } from 'buffer';
import { Platform } from 'react-native';
import { OpenAI } from 'openai';

// Get the API key from Expo Constants
const API_KEY = Constants.expoConfig?.extra?.openAIApiKey;

// Debug the API key type and value
console.log('API_KEY type:', typeof API_KEY);
console.log('API key exists:', API_KEY ? 'Yes' : 'No');
console.log('API key value:', API_KEY);

// Check if API key is available
if (!API_KEY) {
    console.error('OpenAI API key is missing! Make sure it is properly set in your .env file.');
}

const openAI = axios.create({
    baseURL: 'https://api.openai.com/v1',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
    },
});

export const generateResponse = async (
  message: string, 
  proficiencyLevel: string = 'a1'
): Promise<string> => {
    try {
        // Normalize proficiency level
        const normalizedLevel = proficiencyLevel.toLowerCase();
        
        // Create a tailored system prompt based on user's proficiency level
        let systemPrompt = '';
        
        switch(normalizedLevel) {
            case 'a1':
                systemPrompt = `You are LingoBot, a friendly French conversation partner for beginners (A1 level). 
                - Use very simple French vocabulary and basic grammar.
                - Keep sentences short (3-5 words).
                - Use familiar greetings and everyday phrases.
                - Occasionally suggest simple corrections when appropriate.
                - Provide translations for new words in parentheses.
                - Speak about concrete, familiar topics (family, food, weather).
                - Respond in a mix of simple French (70%) and English (30%).
                - Keep your replies conversational and friendly, not instructional.`;
                break;
            case 'a2':
                systemPrompt = `You are LingoBot, a friendly French conversation partner for elementary speakers (A2 level). 
                - Use simple French vocabulary and straightforward grammar.
                - Keep sentences moderate length with common connectors.
                - Introduce some everyday expressions and idioms.
                - Gently correct major errors in a conversational way.
                - Only translate particularly difficult words in parentheses.
                - Speak about practical, everyday topics.
                - Respond in a mix of French (80%) and English (20%).
                - Keep your replies conversational and friendly, not instructional.`;
                break;
            case 'b1':
                systemPrompt = `You are LingoBot, a friendly French conversation partner for intermediate speakers (B1 level). 
                - Use moderate vocabulary and include some idiomatic expressions.
                - Form complete sentences with proper grammar.
                - Discuss various topics including opinions and experiences.
                - Subtly correct errors by rephrasing correctly in your response.
                - Only translate uncommon words in parentheses.
                - Respond primarily in French (90%) with minimal English.
                - Keep your replies conversational and friendly, not instructional.`;
                break;
            case 'b2':
                systemPrompt = `You are LingoBot, a friendly French conversation partner for upper intermediate speakers (B2 level). 
                - Use rich vocabulary and varied grammatical structures.
                - Include idiomatic expressions and colloquialisms.
                - Discuss abstract concepts and opinions.
                - Only correct significant errors through rephrasing.
                - No need to translate words except for very specialized terms.
                - Respond entirely in French unless asked for clarification.
                - Keep your replies conversational and friendly, not instructional.`;
                break;
            case 'c1':
            case 'c2':
                systemPrompt = `You are LingoBot, a friendly French conversation partner for advanced speakers (C1-C2 level). 
                - Use sophisticated, nuanced vocabulary and complex structures.
                - Include cultural references, slang, and regional expressions.
                - Discuss any topic in depth - abstract, academic, or professional.
                - Don't correct errors unless asked specifically for feedback.
                - Respond exclusively in French with authentic expression.
                - Speak as a native French speaker would in casual conversation.
                - Keep your replies conversational and friendly, not instructional.`;
                break;
            default:
                // Default to A1 if level is unknown
                systemPrompt = `You are LingoBot, a friendly French conversation partner for beginners (A1 level). 
                - Use very simple French vocabulary and basic grammar.
                - Keep sentences short (3-5 words).
                - Use familiar greetings and everyday phrases.
                - Occasionally suggest simple corrections when appropriate.
                - Provide translations for new words in parentheses.
                - Speak about concrete, familiar topics (family, food, weather).
                - Respond in a mix of simple French (70%) and English (30%).
                - Keep your replies conversational and friendly, not instructional.`;
        }

        // Using the chat completions endpoint with the enhanced system prompt
        const response = await openAI.post('/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ],
            max_tokens: 250, // Increased to allow for more natural responses
            temperature: 0.7, // Slightly increased for more variation in responses
        });

        // Different response structure for chat completions
        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error generating response:', error);
        throw error;
    }
}; 

// Transcribe audio to text using OpenAI's Whisper API
export const transcribeAudio = async (audioUri: string): Promise<string> => {
    try {
        if (Platform.OS === 'web') {
            // For web, we need to fetch the blob from the URI and send it directly
            const response = await fetch(audioUri);
            const audioBlob = await response.blob();
            
            // Create FormData to send the audio file
            const formData = new FormData();
            formData.append('file', audioBlob, 'recording.webm');
            formData.append('model', 'whisper-1');
            formData.append('language', 'en');
            
            // Send the audio to OpenAI's Whisper API
            const transcriptionResponse = await axios.post(
                'https://api.openai.com/v1/audio/transcriptions',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${API_KEY}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            
            return transcriptionResponse.data.text;
        } else {
            // For native platforms, use expo-file-system
            const result = await FileSystem.uploadAsync(
                'https://api.openai.com/v1/audio/transcriptions',
                audioUri,
                {
                    httpMethod: 'POST',
                    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
                    fieldName: 'file',
                    mimeType: 'audio/m4a', // Adjust based on your recording format
                    parameters: {
                        model: 'whisper-1',
                        language: 'en' // Or use 'fr' for French
                    },
                    headers: {
                        'Authorization': `Bearer ${API_KEY}`
                    }
                }
            );

            // Parse the response
            const responseData = JSON.parse(result.body);
            return responseData.text;
        }
    } catch (error) {
        console.error('Error transcribing audio:', error);
        throw error;
    }
};

// Synthesize speech from text using OpenAI's TTS API
export const synthesizeSpeech = async (text: string): Promise<string> => {
    try {
        // Define headers with both Authorization and Content-Type
        const headers = {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        };

        // Make request to OpenAI TTS API
        const response = await axios.post(
            'https://api.openai.com/v1/audio/speech',
            {
                model: 'tts-1',
                voice: 'alloy',
                input: text
            },
            {
                headers: headers,
                responseType: 'arraybuffer'
            }
        );

        // Handle platform differences
        if (Platform.OS === 'web') {
            // For web, create a blob URL that can be used directly
            const blob = new Blob([response.data], { type: 'audio/mpeg' });
            const url = URL.createObjectURL(blob);
            return url;
        } else {
            // For native platforms (iOS, Android), save to file system
            // Convert arraybuffer to base64
            const base64Audio = Buffer.from(response.data).toString('base64');
            
            // Save the audio file
            const fileUri = `${FileSystem.documentDirectory}speech-${Date.now()}.mp3`;
            await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
                encoding: FileSystem.EncodingType.Base64
            });
            
            return fileUri;
        }
    } catch (error) {
        console.error('Error synthesizing speech:', error);
        throw error;
    }
};

// Translate a word from English to French or French to English
export async function translateWord(word: string): Promise<{ english: string; french: string }> {
  try {
    console.log(`Translating word: ${word}`);
    
    // Use the same API_KEY that's defined at the top of the file
    if (!API_KEY) {
      console.error('OpenAI API key is not set');
      throw new Error('OpenAI API key is not set');
    }
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: API_KEY,
      dangerouslyAllowBrowser: true
    });
    
    // Prompt OpenAI to translate and detect the language
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful translation assistant. Detect if the word is English or French, and provide the translation in the other language. Return ONLY a JSON object with 'english' and 'french' keys. No additional text, commentary or explanation."
        },
        {
          role: "user",
          content: `Translate this word: ${word}`
        }
      ],
      temperature: 0.3,
      max_tokens: 150,
      response_format: { type: "json_object" }
    });
    
    // Extract the response text
    const responseText = response.choices[0]?.message?.content || '';
    console.log("OpenAI translation response:", responseText);
    
    try {
      // Parse the JSON response
      const translationData = JSON.parse(responseText);
      
      // Validate the response format
      if (!translationData.english || !translationData.french) {
        console.error("Invalid translation data format:", translationData);
        throw new Error("Translation data is missing required fields");
      }
      
      return {
        english: translationData.english.trim(),
        french: translationData.french.trim()
      };
    } catch (parseError) {
      console.error("Error parsing translation response:", parseError);
      throw new Error("Failed to parse translation response");
    }
  } catch (error) {
    console.error('Error translating word:', error);
    throw error;
  }
} 