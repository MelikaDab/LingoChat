import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useGlobalContext } from '../../context/GlobalContext';
import { auth } from '../../firebase';
import FirestoreService, { UserOnboardingOptions } from '../../app/services/FirestoreService';

// Map display levels to CEFR standard levels with proper typing
const LEVEL_MAPPING: Record<string, UserOnboardingOptions['proficiencyLevel']> = {
    "Beginner": "a1",
    "Intermediate": "b1",
    "Advanced": "c1"
};

export default function LevelPage() {
    const router = useRouter();
    const [selectedLevel, setSelectedLevel] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [userName, setUserName] = useState<string>("User");
    const { onboardingData, setOnboardingData, saveOnboardingData, userId, isOnboardingComplete } = useGlobalContext();

    // Pre-select the level if it exists in onboarding data
    useEffect(() => {
        if (onboardingData.proficiencyLevel) {
            // Handle possible formats - might be stored as CEFR (a1, b1, c1) or display names
            const storedLevel = onboardingData.proficiencyLevel.toLowerCase();
            if (storedLevel === "a1" || storedLevel === "beginner") {
                setSelectedLevel("Beginner");
            } else if (storedLevel === "b1" || storedLevel === "intermediate") {
                setSelectedLevel("Intermediate");
            } else if (storedLevel === "c1" || storedLevel === "advanced") {
                setSelectedLevel("Advanced");
            }
        }
        
        // Try to get the name from localStorage
        try {
            const savedName = localStorage.getItem('lingochat_user_name');
            if (savedName) {
                console.log("Found user name in localStorage:", savedName);
                setUserName(savedName);
            } else if (onboardingData.name) {
                setUserName(onboardingData.name);
            }
        } catch (e) {
            console.log("Error accessing localStorage:", e);
            if (onboardingData.name) {
                setUserName(onboardingData.name);
            }
        }
        
        // Debug current state
        console.log("LevelPage mounted, current state:", {
            userId,
            onboardingData,
            isOnboardingComplete
        });
    }, [onboardingData.proficiencyLevel, onboardingData.name]);

    const handleNext = async () => {
        try {
            setIsLoading(true);
            
            if (!selectedLevel) {
                Alert.alert('Error', 'Please select a proficiency level');
                setIsLoading(false);
                return;
            }
            
            // DEBUG: Log the selected level before mapping
            console.log("DEBUG - Raw selectedLevel:", selectedLevel);
            
            // Map the display level to the CEFR level with proper typing
            // Using direct mapping for clarity - no fallback to a1 unless explicitly needed
            let cefrLevel: UserOnboardingOptions['proficiencyLevel'];
            
            if (selectedLevel === "Beginner") {
                cefrLevel = "a1";
            } else if (selectedLevel === "Intermediate") {
                cefrLevel = "b1";
            } else if (selectedLevel === "Advanced") {
                cefrLevel = "c1";
            } else {
                // Only use a1 as a last resort fallback
                console.warn("Warning: Unexpected selectedLevel value:", selectedLevel);
                cefrLevel = "a1";
            }
            
            console.log("DEBUG - Selected level mapping:", selectedLevel, "→", cefrLevel);
            
            // Ensure all required fields are set
            const updatedData: UserOnboardingOptions = {
                name: userName,
                proficiencyLevel: cefrLevel // Use the mapped CEFR level
            };
            
            console.log("Complete onboarding data to save:", updatedData);
            console.log("DEBUG - Final proficiencyLevel being saved:", updatedData.proficiencyLevel);
            
            // Update context data - properly typed
            setOnboardingData(updatedData);
            
            // Make sure user is logged in
            if (!userId) {
                Alert.alert('Error', 'You must be logged in to continue.');
                setIsLoading(false);
                return;
            }
            
            // Save directly with FirestoreService - without any "as any" type assertions
            await FirestoreService.saveUserOnboarding(userId, updatedData);
            console.log("Data saved directly via FirestoreService");
            
            // IMPORTANT: Instead of calling saveOnboardingData() which might use stale data,
            // refresh data directly from Firestore and update the context
            try {
                // Get the latest data from Firestore after our save
                const refreshedData = await FirestoreService.getUserOnboarding(userId);
                if (refreshedData) {
                    console.log("Refreshed data from Firestore:", refreshedData);
                    // Update the context with the refreshed data
                    setOnboardingData(refreshedData);
                    
                    // Check if onboarding is complete
                    const isComplete = !!(
                        refreshedData.name && 
                        refreshedData.name !== 'User' && 
                        refreshedData.proficiencyLevel
                    );
                    console.log("Onboarding complete check:", isComplete);
                }
            } catch (error) {
                console.error("Error refreshing data from Firestore:", error);
                // Not critical since we already saved directly
            }
            
            // Clean up localStorage after successfully saving to Firestore
            try {
                localStorage.removeItem('lingochat_user_name');
                console.log("Cleared localStorage after successful save");
            } catch (e) {
                console.log("Error clearing localStorage:", e);
            }
            
            // Short delay to ensure state updates complete
            setTimeout(() => {
                // Navigate to home screen
                console.log("Navigation to home");
                router.push('/(tabs)/home');
            }, 500);
        } catch (error) {
            console.error('Error saving onboarding data:', error);
            Alert.alert(
                'Error', 
                'Failed to save your preferences. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Title */}
            <View style={styles.topContainer}>
                <Text style={styles.title}>Hi {userName}, what is your French level?</Text>
            </View>

            {/* Level Selection */}
            <View style={styles.levelContainer}>
                {["Beginner", "Intermediate", "Advanced"].map((level) => (
                    <TouchableOpacity
                        key={level}
                        style={styles.option}
                        onPress={() => setSelectedLevel(level)}
                    >
                        <View style={styles.radioCircle}>
                            {selectedLevel === level && <View style={styles.selectedCircle} />}
                        </View>
                        <Text style={styles.optionText}>{level}</Text>
                        <Text style={styles.cefrText}>
                            {level === "Beginner" ? "(A1)" : level === "Intermediate" ? "(B1)" : "(C1)"}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Next Button */}
            <TouchableOpacity 
                style={[
                    styles.nextButton, 
                    !selectedLevel && styles.disabledButton
                ]} 
                onPress={handleNext} 
                disabled={!selectedLevel || isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <Text style={styles.nextButtonText}>Next</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}
 
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
        paddingTop: 80,
        backgroundColor: '#E8F0FE'
    },
    topContainer: {
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 20,
    },
    levelContainer: {
        marginTop: 20,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 50,
    },
    radioCircle: {
        height: 24,
        width: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    selectedCircle: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#000',
    },
    optionText: {
        fontSize: 22,
        color: '#000',
    },
    cefrText: {
        fontSize: 16,
        color: '#666',
        marginLeft: 8,
    },
    nextButton: {
        width: '100%',
        paddingVertical: 15,
        backgroundColor: '#000',
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 40,
    },
    disabledButton: {
        backgroundColor: '#999',
        opacity: 0.8,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    debugInfo: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
    },
    debugText: {
        fontSize: 12,
        color: '#333',
    }
});

