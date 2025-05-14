// This script removes the fields we no longer need from Firebase Firestore
const admin = require('firebase-admin');
const serviceAccount = require('../firebase-credentials.json'); // Adjust path as needed

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const usersCollection = db.collection('users');

async function cleanupFields() {
  console.log('Starting cleanup of unused fields from Firestore...');
  
  try {
    // Get all user documents
    const snapshot = await usersCollection.get();
    
    if (snapshot.empty) {
      console.log('No user documents found.');
      return;
    }
    
    let updateCount = 0;
    
    // Process each document
    const promises = snapshot.docs.map(async (doc) => {
      const data = doc.data();
      const fieldsToRemove = {
        targetLanguage: admin.firestore.FieldValue.delete(),
        learningGoals: admin.firestore.FieldValue.delete(),
        preferredTopics: admin.firestore.FieldValue.delete(),
        dailyGoalMinutes: admin.firestore.FieldValue.delete()
      };
      
      // Check if any of the fields exist before updating
      const needsUpdate = 
        'targetLanguage' in data || 
        'learningGoals' in data || 
        'preferredTopics' in data || 
        'dailyGoalMinutes' in data;
      
      if (needsUpdate) {
        await doc.ref.update(fieldsToRemove);
        updateCount++;
        console.log(`Updated document ${doc.id}: removed deprecated fields`);
      }
    });
    
    await Promise.all(promises);
    console.log(`Cleanup complete. Updated ${updateCount} documents.`);
    
  } catch (error) {
    console.error('Error cleaning up fields:', error);
  } finally {
    // Exit the script when done
    process.exit(0);
  }
}

// Run the cleanup
cleanupFields(); 