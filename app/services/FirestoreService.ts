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
  // Streak tracking
  currentStreak?: number;
  longestStreak?: number;
  lastLoginDate?: string; // Format: YYYY-MM-DD
  totalLoginDays?: number;
  // Gems tracking
  gems?: number;
  totalGemsEarned?: number;
  lastGemEarned?: any; // timestamp
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
          
          // Construct onboarding data from top-level fields with extended properties
          const onboardingData: any = {
            name: userData.name || '',
            proficiencyLevel: proficiencyLevel as any || 'a1',
            // Include additional profile data
            email: userData.email || '',
            photoURL: userData.photoURL || '',
            displayName: userData.displayName || userData.name || ''
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
  },

  // Update user streak based on login
  updateUserStreak: async (userId: string): Promise<{ currentStreak: number; longestStreak: number }> => {
    try {
      console.log("FirestoreService: Updating user streak for user:", userId);
      
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      // Get current date in YYYY-MM-DD format (local timezone)
      const now = new Date();
      const today = now.toLocaleDateString('en-CA'); // This gives us YYYY-MM-DD format
      console.log("FirestoreService: Today's date (local):", today);
      
      let currentStreak = 1;
      let longestStreak = 1;
      let totalLoginDays = 1;
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const lastLoginDate = userData.lastLoginDate;
        currentStreak = userData.currentStreak || 0;
        longestStreak = userData.longestStreak || 0;
        totalLoginDays = userData.totalLoginDays || 0;
        
        console.log("Current user data:", {
          lastLoginDate,
          currentStreak,
          longestStreak,
          totalLoginDays,
          today
        });
        
        // If user already logged in today, don't update streak
        if (lastLoginDate === today) {
          console.log("User already logged in today, no streak update needed");
          return { currentStreak, longestStreak };
        }
        
        // Calculate yesterday's date (local timezone)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString('en-CA');
        console.log("FirestoreService: Yesterday's date (local):", yesterdayStr);
        
        if (lastLoginDate === yesterdayStr) {
          // User logged in yesterday, continue streak
          currentStreak += 1;
          console.log("Continuing streak, new streak:", currentStreak);
        } else if (lastLoginDate && lastLoginDate < yesterdayStr) {
          // User missed a day, reset streak
          console.log("Streak broken! Last login was:", lastLoginDate, "which is before yesterday:", yesterdayStr);
          currentStreak = 1;
          console.log("Streak broken, resetting to 1");
        } else if (!lastLoginDate) {
          // First time login
          currentStreak = 1;
          console.log("First time login, setting streak to 1");
        } else {
          // Edge case: last login is in the future somehow, treat as first login
          console.log("Edge case: last login date is in future, resetting streak");
          currentStreak = 1;
        }
        
        // Update longest streak if current is higher
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
          console.log("New longest streak record:", longestStreak);
        }
        
        // Increment total login days (only if not logged in today)
        totalLoginDays += 1;
        console.log("Updated total login days:", totalLoginDays);
      }
      
      // Update the user document
      const updateData = {
        currentStreak,
        longestStreak,
        lastLoginDate: today,
        totalLoginDays,
        updatedAt: serverTimestamp()
      };
      
      console.log("FirestoreService: Updating user document with:", updateData);
      
      if (userDoc.exists()) {
        await updateDoc(userDocRef, updateData);
        console.log("Updated existing user streak data");
      } else {
        // Create new user document if it doesn't exist
        await setDoc(userDocRef, {
          uid: userId,
          email: auth.currentUser?.email || '',
          displayName: auth.currentUser?.displayName || '',
          photoURL: auth.currentUser?.photoURL || '',
          createdAt: serverTimestamp(),
          ...updateData
        });
        console.log("Created new user with streak data");
      }
      
      console.log("Streak updated successfully:", { currentStreak, longestStreak });
      return { currentStreak, longestStreak };
      
    } catch (error) {
      console.error('Error updating user streak:', error);
      throw error;
    }
  },

  // Force streak update (for testing or manual correction)
  forceStreakUpdate: async (userId: string): Promise<{ currentStreak: number; longestStreak: number }> => {
    try {
      console.log("FirestoreService: Force updating streak for user:", userId);
      
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        let currentStreak = (userData.currentStreak || 0) + 1;
        let longestStreak = userData.longestStreak || 0;
        let totalLoginDays = (userData.totalLoginDays || 0) + 1;
        
        // Update longest streak if current is higher
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }
        
        const today = new Date().toLocaleDateString('en-CA');
        
        const updateData = {
          currentStreak,
          longestStreak,
          lastLoginDate: today,
          totalLoginDays,
          updatedAt: serverTimestamp()
        };
        
        await updateDoc(userDocRef, updateData);
        console.log("Force updated streak data:", updateData);
        
        return { currentStreak, longestStreak };
      } else {
        console.log("User document doesn't exist for force update");
        return { currentStreak: 0, longestStreak: 0 };
      }
    } catch (error) {
      console.error('Error force updating streak:', error);
      throw error;
    }
  },

  // Get user streak information
  getUserStreak: async (userId: string): Promise<{ currentStreak: number; longestStreak: number; totalLoginDays: number } | null> => {
    try {
      console.log("FirestoreService: Getting user streak for user:", userId);
      
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const streakData = {
          currentStreak: userData.currentStreak || 0,
          longestStreak: userData.longestStreak || 0,
          totalLoginDays: userData.totalLoginDays || 0
        };
        
        console.log("Retrieved streak data:", streakData);
        return streakData;
      }
      
      console.log("User document does not exist, returning null");
      return null;
    } catch (error) {
      console.error('Error getting user streak:', error);
      throw error;
    }
  },

  // Check if user has logged in today
  hasLoggedInToday: async (userId: string): Promise<boolean> => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const lastLoginDate = userData.lastLoginDate;
        const today = new Date().toISOString().split('T')[0];
        
        return lastLoginDate === today;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking if user logged in today:', error);
      return false;
    }
  },

  // Award gems to user
  awardGems: async (userId: string, amount: number, reason: string = 'activity'): Promise<{ newTotal: number; gemsAwarded: number }> => {
    try {
      console.log(`FirestoreService: Awarding ${amount} gems to user ${userId} for ${reason}`);
      
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      let currentGems = 0;
      let totalGemsEarned = 0;
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        currentGems = userData.gems || 0;
        totalGemsEarned = userData.totalGemsEarned || 0;
      }
      
      const newGemTotal = currentGems + amount;
      const newTotalEarned = totalGemsEarned + amount;
      
      console.log(`Gems: ${currentGems} + ${amount} = ${newGemTotal}`);
      
      // Update user document with new gem amounts
      const updateData = {
        gems: newGemTotal,
        totalGemsEarned: newTotalEarned,
        lastGemEarned: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      if (userDoc.exists()) {
        await updateDoc(userDocRef, updateData);
      } else {
        // Create user document if it doesn't exist
        await setDoc(userDocRef, {
          uid: userId,
          email: auth.currentUser?.email || '',
          displayName: auth.currentUser?.displayName || '',
          photoURL: auth.currentUser?.photoURL || '',
          createdAt: serverTimestamp(),
          ...updateData
        });
      }
      
      // Log the gem transaction
      await FirestoreService.logGemTransaction(userId, amount, reason, newGemTotal);
      
      console.log(`Gems awarded successfully! New total: ${newGemTotal}`);
      return { newTotal: newGemTotal, gemsAwarded: amount };
      
    } catch (error) {
      console.error('Error awarding gems:', error);
      throw error;
    }
  },

  // Log gem transaction for history
  logGemTransaction: async (userId: string, amount: number, reason: string, newBalance: number): Promise<void> => {
    try {
      const transactionCollectionRef = collection(db, 'users', userId, 'gem_transactions');
      await addDoc(transactionCollectionRef, {
        amount,
        reason,
        newBalance,
        timestamp: serverTimestamp(),
        type: amount > 0 ? 'earned' : 'spent'
      });
      
      console.log('Gem transaction logged successfully');
    } catch (error) {
      console.error('Error logging gem transaction:', error);
      // Don't throw - this is just for logging
    }
  },

  // Get user gems
  getUserGems: async (userId: string): Promise<{ gems: number; totalGemsEarned: number } | null> => {
    try {
      console.log("FirestoreService: Getting user gems for user:", userId);
      
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const gemData = {
          gems: userData.gems || 0,
          totalGemsEarned: userData.totalGemsEarned || 0
        };
        
        console.log("Retrieved gem data:", gemData);
        return gemData;
      }
      
      console.log("User document does not exist, returning null");
      return null;
    } catch (error) {
      console.error('Error getting user gems:', error);
      throw error;
    }
  },

  // Calculate gems for flashcard completion
  calculateFlashcardGems: (cardCount: number, streak: number = 0): number => {
    // Base gems: 5 per card reviewed
    const baseGems = cardCount * 5;
    
    // Streak bonus: +1 gem per card for every 7 days of streak
    const streakMultiplier = Math.floor(streak / 7);
    const streakBonus = cardCount * streakMultiplier;
    
    // Minimum 5 gems, even for 1 card
    const totalGems = Math.max(5, baseGems + streakBonus);
    
    console.log(`Flashcard gems calculation: ${cardCount} cards, ${streak} streak = ${totalGems} gems (base: ${baseGems}, bonus: ${streakBonus})`);
    return totalGems;
  },
};

export default FirestoreService; 