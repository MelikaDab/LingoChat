import 'dotenv/config';

// Debug: Log information about the API key without trying to access string methods
console.log('[app.config.js] API key type:', typeof process.env.OPENAI_API_KEY);
console.log('[app.config.js] API key exists:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');

// A safer way to handle the API key
const apiKey = process.env.OPENAI_API_KEY || '';

export default {
    expo: {
        name: "LingoChat",
        slug: "lingochat",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "light",
        splash: {
            image: "./assets/splash.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        assetBundlePatterns: [
            "**/*"
        ],
        ios: {
            supportsTablet: true
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#ffffff"
            },
            permissions: ["RECORD_AUDIO"]
        },
        web: {
            // favicon: "./assets/favicon.png"
        },
        plugins: [
            [
                "expo-av",
                {
                    "microphonePermission": "Allow LingoChat to access your microphone."
                }
            ]
        ],
        extra: {
            // Make sure we're explicitly setting the OpenAI API key from the environment variable
            openAIApiKey: apiKey,
        }
    }
}; 