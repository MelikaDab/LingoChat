import axios from 'axios';
import Constants from 'expo-constants';

// Get the API key from Expo Constants
const API_KEY = Constants.expoConfig?.extra?.openAIApiKey;

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
            model: 'chatgpt-4o-latest', // Using a chat model
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