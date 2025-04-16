# LingoChat
LingoChat is an AI-driven mobile application designed to help French learning through immersive, personalized, and interactive experiences. Users engage in level-appropriate conversations with AI, save new vocabulary as flashcards, and practice realistic conversation situations with AI. 

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Environment Setup

This application uses environment variables to store sensitive information like API keys. 

### Setup Steps:

1. Copy the `.env.example` file to create your own `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file and add your actual OpenAI API key:
   ```
   OPENAI_API_KEY=your_actual_api_key_here
   ```

3. Make sure your `.env` file is included in `.gitignore` to prevent it from being pushed to version control.

## Get started

1. Install dependencies

   ```

## Running the App

```bash
npm install
npx expo start
```

In the output, you'll find options to open the app in a:
- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).