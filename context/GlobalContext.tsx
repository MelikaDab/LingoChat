import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserOnboardingOptions } from '../app/services/FirestoreService';
import { auth } from '../firebase';
import FirestoreService from '../app/services/FirestoreService';

interface GlobalContextProps {
  onboardingData: Partial<UserOnboardingOptions>;
  setOnboardingData: (data: Partial<UserOnboardingOptions>) => void;
  saveOnboardingData: () => Promise<void>;
  userId: string | null;
  isLoggedIn: boolean;
  isOnboardingComplete: boolean;
  checkOnboardingStatus: () => boolean;
}

const defaultContext: GlobalContextProps = {
  onboardingData: {},
  setOnboardingData: () => {},
  saveOnboardingData: async () => {},
  userId: null,
  isLoggedIn: false,
  isOnboardingComplete: false,
  checkOnboardingStatus: () => false,
};

const GlobalContext = createContext<GlobalContextProps>(defaultContext);

export const useGlobalContext = () => useContext(GlobalContext);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onboardingData, setOnboardingData] = useState<Partial<UserOnboardingOptions>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean>(false);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        setIsLoggedIn(true);
        
        // Load user's onboarding data if they're logged in
        loadUserOnboarding(user.uid);
      } else {
        setUserId(null);
        setIsLoggedIn(false);
        setOnboardingData({});
        setIsOnboardingComplete(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load user onboarding data from Firestore
  const loadUserOnboarding = async (uid: string) => {
    try {
      console.log("Loading user onboarding data for:", uid);
      const data = await FirestoreService.getUserOnboarding(uid);
      
      // If we have data from firestore
      if (data) {
        console.log("Loaded onboarding data from Firestore:", data);
        console.log("Loaded proficiency level:", data.proficiencyLevel);
        
        // Ensure proficiency level is in correct format
        // (at this point it should already be in CEFR format from Firestore)
        const originalLevel = data.proficiencyLevel;
        
        // Check if we need to merge with localStorage data
        try {
          const savedName = localStorage.getItem('lingochat_user_name');
          if (savedName && (!data.name || data.name === 'User')) {
            console.log("Merging localStorage name with Firestore data:", savedName);
            data.name = savedName;
          }
        } catch (e) {
          console.log("Error accessing localStorage:", e);
        }
        
        setOnboardingData(data);
        // Check if onboarding is complete
        const complete = checkOnboardingDataComplete(data);
        console.log("Onboarding complete?", complete);
        setIsOnboardingComplete(complete);
      } else {
        // No data in Firestore, check localStorage
        try {
          const savedName = localStorage.getItem('lingochat_user_name');
          if (savedName) {
            console.log("No Firestore data, but found name in localStorage:", savedName);
            setOnboardingData({ name: savedName });
          }
        } catch (e) {
          console.log("Error accessing localStorage:", e);
        }
        
        console.log("No onboarding data found in Firestore");
        setIsOnboardingComplete(false);
      }
    } catch (error) {
      console.error('Error loading user onboarding data:', error);
      setIsOnboardingComplete(false);
    }
  };

  // Check if onboarding data is complete
  const checkOnboardingDataComplete = (data: Partial<UserOnboardingOptions>): boolean => {
    // Check if required fields exist and are not empty
    const isComplete = !!(
      data.name && 
      data.name !== 'User' && // Explicit check that name isn't just the default
      data.proficiencyLevel
    );
    
    console.log("Checking onboarding data complete:", {
      name: data.name,
      proficiencyLevel: data.proficiencyLevel,
      isComplete
    });
    
    return isComplete;
  };

  // Function to check onboarding status - returns current state
  const checkOnboardingStatus = (): boolean => {
    return isOnboardingComplete;
  };

  // Save onboarding data to Firestore
  const saveOnboardingData = async () => {
    if (!userId) {
      console.error('Cannot save onboarding data: No user is logged in');
      return;
    }

    try {
      console.log("Saving onboarding data to Firestore:", onboardingData);
      console.log("Current proficiency level in context:", onboardingData.proficiencyLevel);
      
      // Try to get name from localStorage if not in context
      let nameToUse = onboardingData.name;
      try {
        const savedName = localStorage.getItem('lingochat_user_name');
        if (savedName && (!nameToUse || nameToUse === 'User')) {
          console.log("Using name from localStorage for saving:", savedName);
          nameToUse = savedName;
        }
      } catch (e) {
        console.log("Error accessing localStorage:", e);
      }
      
      // Validate and ensure proficiencyLevel is a valid CEFR level or legacy format
      let validatedLevel = onboardingData.proficiencyLevel || 'a1';
      
      // Convert any legacy format names to CEFR codes if needed
      if (validatedLevel.toLowerCase() === 'beginner') {
        validatedLevel = 'a1';
      } else if (validatedLevel.toLowerCase() === 'intermediate') {
        validatedLevel = 'b1';
      } else if (validatedLevel.toLowerCase() === 'advanced') {
        validatedLevel = 'c1';
      }
      
      console.log("Validated proficiency level:", validatedLevel);
      
      // Ensure we have all required fields before saving
      const dataToSave: UserOnboardingOptions = {
        name: nameToUse || 'User',
        proficiencyLevel: validatedLevel as any // Use validated level
      };
      
      console.log("Final data being saved to Firestore:", JSON.stringify(dataToSave, null, 2));
      console.log("Proficiency level type:", typeof dataToSave.proficiencyLevel);
      
      // Double-check we're only using CEFR codes for storage
      if (!['a1', 'a2', 'b1', 'b2', 'c1', 'c2'].includes(dataToSave.proficiencyLevel.toLowerCase())) {
        console.warn("Warning: Saving non-CEFR level format:", dataToSave.proficiencyLevel);
      }
      
      // Save the data
      await FirestoreService.saveUserOnboarding(userId, dataToSave);
      
      // Check if the data is complete AFTER saving
      const isComplete = checkOnboardingDataComplete(dataToSave);
      console.log("Setting isOnboardingComplete to:", isComplete);
      
      // Update state to reflect completion
      setIsOnboardingComplete(isComplete);
      
      console.log('Onboarding data saved successfully');
      
      // Force a refresh of data from Firestore to ensure consistency
      await loadUserOnboarding(userId);
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      throw error;
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        onboardingData,
        setOnboardingData,
        saveOnboardingData,
        userId,
        isLoggedIn,
        isOnboardingComplete,
        checkOnboardingStatus,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContext; 