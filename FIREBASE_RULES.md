# Firebase Security Rules for LingoChat

## Current Issue
You're encountering a "Missing or insufficient permissions" error when trying to save flashcards to Firebase. This is because the default Firebase security rules are set to deny all reads and writes.

## How to Fix the Firebase Security Rules

1. Go to your [Firebase Console](https://console.firebase.google.com/)
2. Select your project "lingochat-21823"
3. In the left sidebar, click on "Firestore Database"
4. Click on the "Rules" tab
5. Replace the current rules with the following:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /users/{userId} {
      // Allow users to read and write their own documents
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow users to read and write their own flashcards subcollection
      match /flashcards/{flashcardId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Allow users to read and write their own chat history
      match /chat_history/{messageId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Default deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

6. Click "Publish" to update the rules

## What These Rules Do

These rules allow:
- Authenticated users to read and write their own user document
- Authenticated users to read and write their own flashcards
- Authenticated users to read and write their own chat history
- No other access is allowed for security

## Temporary Workaround

Until you update the Firebase rules, the app will:
1. Still translate words when you click on them
2. Store flashcards locally in your browser's localStorage 
3. Show you a different alert message indicating the cards were saved locally

Once you update the Firebase rules, the app will start saving flashcards to Firebase automatically. 