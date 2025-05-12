import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useGlobalContext } from '../../context/GlobalContext';
import { auth } from '../../firebase';
import FirestoreService from '../../app/services/FirestoreService';

export default function LevelPage() {
    const router = useRouter();
    const [selectedLevel, setSelectedLevel] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [userName, setUserName] = useState<string>("User");
    const { onboardingData, setOnboardingData, saveOnboardingData, userId, isOnboardingComplete } = useGlobalContext();

    // Pre-select the level if it exists in onboarding data
    useEffect(() => {
        if (onboardingData.proficiencyLevel) {
            setSelectedLevel(onboardingData.proficiencyLevel);
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
            
            // Update onboarding data with selected level
            console.log("Saving level:", selectedLevel);
            
            // Ensure all required fields are set
            const updatedData = {
                name: userName, // Use the name from state which could be from localStorage
                proficiencyLevel: selectedLevel as any,
                targetLanguage: onboardingData.targetLanguage || 'French', // Default target language
                learningGoals: onboardingData.learningGoals || [],
                preferredTopics: onboardingData.preferredTopics || [],
                dailyGoalMinutes: onboardingData.dailyGoalMinutes || 10
            };
            
            console.log("Complete onboarding data to save:", updatedData);
            
            // Update context data
            setOnboardingData(updatedData);
            
            // Make sure user is logged in
            if (!userId) {
                Alert.alert('Error', 'You must be logged in to continue.');
                setIsLoading(false);
                return;
            }
            
            // Save directly with FirestoreService to ensure we're saving the right data
            // This bypasses any potential state update delays
            await FirestoreService.saveUserOnboarding(userId, updatedData);
            console.log("Data saved directly via FirestoreService");
            
            // Update GlobalContext state
            await saveOnboardingData();
            console.log("Data saved via context, isComplete:", isOnboardingComplete);
            
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

            {/* Debug information */}
            {__DEV__ && (
                <View style={styles.debugInfo}>
                    <Text style={styles.debugText}>
                        UserId: {userId ? userId.substring(0, 8) + '...' : 'Not logged in'}
                    </Text>
                    <Text style={styles.debugText}>
                        IsComplete: {isOnboardingComplete ? 'Yes' : 'No'}
                    </Text>
                    <Text style={styles.debugText}>
                        Selected Level: {selectedLevel}
                    </Text>
                    <Text style={styles.debugText}>
                        Name: {userName}
                    </Text>
                </View>
            )}
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

