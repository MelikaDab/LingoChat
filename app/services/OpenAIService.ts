import axios from 'axios';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
// Required polyfill for React Native
import { Buffer } from 'buffer';
import { Platform } from 'react-native';

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

export const generateResponse = async (message: string): Promise<string> => {
    try {
        // Using the chat completions endpoint instead of completions
        const response = await openAI.post('/chat/completions', {
            // Updated to use a standard model that definitely exists
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are LingoBot, a helpful language learning assistant that responds in both English and French.' },
                { role: 'user', content: message }
            ],
            max_tokens: 150,
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