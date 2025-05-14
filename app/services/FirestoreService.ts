import { db, auth } from '../../firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp, 
  collection,
  addDoc,
  query,
  orderBy,
  limit as firestoreLimit,
  getDocs
} from 'firebase/firestore';

// Define user onboarding options interface
export interface UserOnboardingOptions {
  name: string;
  proficiencyLevel: 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2' | 'Beginner' | 'Intermediate' | 'Advanced';
}

// User profile interface
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: any;
  updatedAt: any;
  // Onboarding data now directly on user profile
  name?: string;
  proficiencyLevel?: 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2' | 'Beginner' | 'Intermediate' | 'Advanced';
}

// Define flashcard interface
export interface Flashcard {
  id?: string;
  english: string;
  french: string;
  createdAt?: any;
}

const FirestoreService = {
  // Save user onboarding data
  saveUserOnboarding: async (
    userId: string, 
    onboardingOptions: UserOnboardingOptions
  ): Promise<void> => {
    try {
      console.log("FirestoreService: Saving user onboarding for user:", userId);
      console.log("FirestoreService: Onboarding data:", JSON.stringify(onboardingOptions, null, 2));
      console.log("FirestoreService: Proficiency level:", onboardingOptions.proficiencyLevel);
      console.log("FirestoreService: Proficiency level type:", typeof onboardingOptions.proficiencyLevel);
      
      // Normalize proficiency level to CEFR format if needed
      let normalizedLevel = onboardingOptions.proficiencyLevel;
      
      // Convert to lowercase for consistent comparisons
      const levelLower = normalizedLevel.toLowerCase();
      
      // Map legacy display names to CEFR codes if needed
      if (levelLower === 'beginner') {
        normalizedLevel = 'a1';
      } else if (levelLower === 'intermediate') {
        normalizedLevel = 'b1';
      } else if (levelLower === 'advanced') {
        normalizedLevel = 'c1';
      }
      
      // Check if it's a valid CEFR level after normalization
      if (!['a1', 'a2', 'b1', 'b2', 'c1', 'c2'].includes(normalizedLevel.toLowerCase())) {
        console.warn("FirestoreService: Non-standard proficiency level:", normalizedLevel);
      }
      
      console.log("FirestoreService: Normalized level for database:", normalizedLevel);
      
      // Verify required fields
      if (!onboardingOptions.name || !normalizedLevel) {
        console.error("FirestoreService: Missing required onboarding fields:", {
          hasName: !!onboardingOptions.name,
          hasProficiency: !!normalizedLevel
        });
      }
      
      // Reference to the user document
      const userDocRef = doc(db, 'users', userId);
      
      // Check if user document exists
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        // Update existing user document with fields at top level
        console.log("FirestoreService: Updating existing user document");
        await updateDoc(userDocRef, {
          // Add onboarding data as top-level fields
          name: onboardingOptions.name,
          displayName: onboardingOptions.name, // Also update displayName field
          proficiencyLevel: normalizedLevel, // Use normalized CEFR level
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new user document with fields at top level
        console.log("FirestoreService: Creating new user document");
        await setDoc(userDocRef, {
          uid: userId,
          email: auth.currentUser?.email || '',
          displayName: onboardingOptions.name, // Set displayName to the name field
          photoURL: auth.currentUser?.photoURL || '',
          // Add onboarding data as top-level fields
          name: onboardingOptions.name,
          proficiencyLevel: normalizedLevel, // Use normalized CEFR level
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      // Verify the data was saved correctly
      const verificationDoc = await getDoc(userDocRef);
      if (verificationDoc.exists()) {
        const data = verificationDoc.data();
        console.log("FirestoreService: Verification - data was saved:", {
          name: data.name,
          proficiencyLevel: data.proficiencyLevel
        });
        
        // Verify the proficiency level was saved in the correct CEFR format
        const savedLevel = data.proficiencyLevel?.toLowerCase();
        if (!['a1', 'a2', 'b1', 'b2', 'c1', 'c2'].includes(savedLevel)) {
          console.error("FirestoreService: ERROR - proficiencyLevel was not saved in CEFR format!", savedLevel);
        } else {
          console.log("FirestoreService: SUCCESS - proficiencyLevel correctly saved as CEFR level:", savedLevel);
        }
      }
      
      console.log('User onboarding options saved successfully!');
    } catch (error) {
      console.error('Error saving user onboarding options:', error);
      throw error;
    }
  },

  // Get user onboarding data
  getUserOnboarding: async (userId: string): Promise<UserOnboardingOptions | null> => {
    try {
      console.log("FirestoreService: Getting user onboarding for user:", userId);
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Extract onboarding fields from top-level data
        if (userData.name || userData.proficiencyLevel) {
          console.log("FirestoreService: Found onboarding data at top level");
          
          // Normalize proficiency level
          let proficiencyLevel = userData.proficiencyLevel;
          
          // Make sure we have a valid CEFR level
          if (proficiencyLevel) {
            // Convert to lowercase for consistent comparison
            const lowerLevel = proficiencyLevel.toLowerCase();
            
            // Handle legacy format if found in database
            if (lowerLevel === 'beginner') {
              proficiencyLevel = 'a1';
            } else if (lowerLevel === 'intermediate') {
              proficiencyLevel = 'b1';
            } else if (lowerLevel === 'advanced') {
              proficiencyLevel = 'c1';
            } else if (['a1', 'a2', 'b1', 'b2', 'c1', 'c2'].includes(lowerLevel)) {
              // It's already a valid CEFR level code, just normalize the case
              proficiencyLevel = lowerLevel;
            }
            
            console.log("FirestoreService: Normalized proficiency level:", proficiencyLevel);
          }
          
          // Construct onboarding data from top-level fields
          const onboardingData: UserOnboardingOptions = {
            name: userData.name || '',
            proficiencyLevel: proficiencyLevel as any || 'a1'
          };
          
          console.log("FirestoreService: Converted top-level data:", onboardingData);
          return onboardingData;
        } else {
          console.log("FirestoreService: User exists but has no onboarding data");
        }
      } else {
        console.log("FirestoreService: User document does not exist");
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user onboarding options:', error);
      throw error;
    }
  },

  // Update user profile
  updateUserProfile: async (userId: string, data: Partial<UserProfile>): Promise<void> => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      
      console.log('User profile updated successfully!');
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Save chat history
  saveChatMessage: async (
    userId: string, 
    message: { 
      text: string, 
      sender: 'user' | 'bot', 
      audioUri?: string 
    }
  ): Promise<void> => {
    try {
      const chatCollectionRef = collection(db, 'users', userId, 'chat_history');
      await addDoc(chatCollectionRef, {
        ...message,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving chat message:', error);
      throw error;
    }
  },

  // Get recent chat history
  getChatHistory: async (userId: string, limitCount = 20) => {
    try {
      const chatCollectionRef = collection(db, 'users', userId, 'chat_history');
      const q = query(
        chatCollectionRef, 
        orderBy('timestamp', 'desc'), 
        firestoreLimit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .reverse();
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  },

  // Save a flashcard
  saveFlashcard: async (userId: string, flashcard: Flashcard): Promise<string> => {
    try {
      console.log("FirestoreService: Saving flashcard for user:", userId);
      
      // Reference to the flashcards collection for this user
      const flashcardsCollectionRef = collection(db, 'users', userId, 'flashcards');
      
      // Add timestamp to the flashcard
      const flashcardWithTimestamp = {
        ...flashcard,
        createdAt: serverTimestamp()
      };
      
      // Add to Firestore
      const docRef = await addDoc(flashcardsCollectionRef, flashcardWithTimestamp);
      console.log("Flashcard saved with ID:", docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('Error saving flashcard:', error);
      throw error;
    }
  },

  // Get all flashcards for a user
  getFlashcards: async (userId: string): Promise<Flashcard[]> => {
    try {
      console.log("FirestoreService: Getting flashcards for user:", userId);
      
      // Reference to the flashcards collection
      const flashcardsCollectionRef = collection(db, 'users', userId, 'flashcards');
      
      // Query with most recent first
      const q = query(
        flashcardsCollectionRef,
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      // Convert to Flashcard objects
      const flashcards: Flashcard[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Flashcard));
      
      console.log(`Retrieved ${flashcards.length} flashcards for user ${userId}`);
      return flashcards;
    } catch (error) {
      console.error('Error getting flashcards:', error);
      throw error;
    }
  }
};

export default FirestoreService; 