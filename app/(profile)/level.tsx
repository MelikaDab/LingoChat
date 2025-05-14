import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGlobalContext } from '../../context/GlobalContext';
import FirestoreService, { UserOnboardingOptions } from '../../app/services/FirestoreService';

const levels = [
    { id: 'a1', label: 'A1 - Beginner' },
    { id: 'a2', label: 'A2 - Elementary' },
    { id: 'b1', label: 'B1 - Intermediate' },
    { id: 'b2', label: 'B2 - Upper Intermediate' },
    { id: 'c1', label: 'C1 - Advanced' },
    { id: 'c2', label: 'C2 - Proficiency' }
];

export default function LearningLevelScreen() {
    const [selectedLevel, setSelectedLevel] = useState<'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2'>('a1');
    const [isLoading, setIsLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const router = useRouter();
    const { onboardingData, userId, setOnboardingData, saveOnboardingData } = useGlobalContext();

    // Load the current level from onboarding data
    useEffect(() => {
        console.log("Profile level.tsx: Component mounted");
        if (onboardingData.proficiencyLevel) {
            // Make sure we display the correct proficiency level
            const level = onboardingData.proficiencyLevel.toLowerCase();
            console.log("Profile level.tsx: Current proficiency level in data:", level, "type:", typeof level);
            
            // Find matching level
            if (levels.some(l => l.id === level)) {
                console.log("Profile level.tsx: Found matching CEFR level:", level);
                setSelectedLevel(level as 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2');
            } else {
                // Handle legacy format if needed
                console.log("Profile level.tsx: No direct match, handling legacy format");
                if (level === 'beginner') setSelectedLevel('a1');
                else if (level === 'intermediate') setSelectedLevel('b1');
                else if (level === 'advanced') setSelectedLevel('c1');
                else setSelectedLevel('a1'); // Default to A1
            }
        } else {
            console.log("Profile level.tsx: No proficiency level found in data");
        }
    }, [onboardingData.proficiencyLevel]);

    // Track changes in the selected level
    const handleLevelChange = (level: 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2') => {
        console.log("Profile level.tsx: Level changed from", selectedLevel, "to", level);
        setSelectedLevel(level);
        
        // Only set hasChanges if the level is different from what's in the database
        if (onboardingData.proficiencyLevel?.toLowerCase() !== level) {
            setHasChanges(true);
        } else {
            setHasChanges(false);
        }
    };

    const handleSave = async () => {
        if (!hasChanges) {
            console.log("Profile level.tsx: No changes to save");
            router.back();
            return;
        }
        
        try {
            setIsLoading(true);
            console.log("Profile level.tsx: Saving level:", selectedLevel);
            
            // Make sure user is logged in
            if (!userId) {
                Alert.alert('Error', 'You must be logged in to update your profile');
                setIsLoading(false);
                return;
            }

            // Create a complete user onboarding options object
            const updatedData: UserOnboardingOptions = {
                name: onboardingData.name || 'User',
                proficiencyLevel: selectedLevel, // This is already a valid CEFR level code
                targetLanguage: onboardingData.targetLanguage || 'French',
                learningGoals: onboardingData.learningGoals || [],
                preferredTopics: onboardingData.preferredTopics || [],
                dailyGoalMinutes: onboardingData.dailyGoalMinutes || 10
            };
            
            console.log("Profile level.tsx: Updated data to save:", JSON.stringify(updatedData, null, 2));
            
            // Save directly with FirestoreService
            try {
                await FirestoreService.saveUserOnboarding(userId, updatedData);
                console.log("Profile level.tsx: Successfully saved to Firestore directly");
            } catch (error) {
                console.error("Profile level.tsx: Error saving via FirestoreService:", error);
                throw error; // Re-throw to be caught by outer try/catch
            }
            
            // Update context state
            try {
                setOnboardingData(updatedData);
                console.log("Profile level.tsx: Updated onboarding data in context");
            } catch (error) {
                console.error("Profile level.tsx: Error updating context:", error);
                // Continue as this might not be critical if Firestore save worked
            }
            
            // IMPORTANT: Instead of saving via context (which is using stale data),
            // we'll force a refresh of the data from Firestore
            try {
                // Directly load the user's updated data from Firestore
                const refreshedData = await FirestoreService.getUserOnboarding(userId);
                if (refreshedData) {
                    console.log("Profile level.tsx: Refreshed data from Firestore:", refreshedData);
                    // Update the context with the refreshed data
                    setOnboardingData(refreshedData);
                }
            } catch (error) {
                console.error("Profile level.tsx: Error refreshing data:", error);
                // Not critical, since the data is already saved to Firestore
            }
            
            Alert.alert('Success', 'Your language level has been updated!');
            router.back();
        } catch (error) {
            console.error('Error saving level:', error);
            Alert.alert('Error', 'Failed to save your language level. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView style={styles.scrollView}>
                <Text style={styles.title}>Select Your Language Level</Text>
                <Text style={styles.description}>
                    Choose the level that best matches your current French language skills.
                </Text>

                <View style={styles.levelsContainer}>
                    {levels.map((level) => (
                        <TouchableOpacity
                            key={level.id}
                            style={[styles.levelItem, selectedLevel === level.id && styles.selectedLevel]}
                            onPress={() => handleLevelChange(level.id as 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2')}
                        >
                            <View style={styles.radioContainer}>
                                <View style={[styles.radioButton, selectedLevel === level.id && styles.radioSelected]} />
                            </View>
                            <Text style={[styles.levelText, selectedLevel === level.id && styles.selectedLevelText]}>
                                {level.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.bottomContainer}>
                <TouchableOpacity 
                    style={[
                        styles.saveButton, 
                        !hasChanges && styles.disabledButton
                    ]} 
                    onPress={handleSave}
                    disabled={isLoading || !hasChanges}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.saveButtonText}>
                            {hasChanges ? 'Save Changes' : 'No Changes'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFF',
    },
    scrollView: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    description: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
    },
    levelsContainer: {
        marginBottom: 30,
    },
    levelItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    selectedLevel: {
        borderColor: '#3B82F6',
        backgroundColor: '#EBF5FF',
    },
    radioContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#CBD5E1',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    radioButton: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'transparent',
    },
    radioSelected: {
        backgroundColor: '#3B82F6',
    },
    levelText: {
        fontSize: 16,
        color: '#333',
    },
    selectedLevelText: {
        fontWeight: 'bold',
        color: '#3B82F6',
    },
    bottomContainer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        backgroundColor: 'white',
    },
    saveButton: {
        backgroundColor: '#3B82F6',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: '#A9B0C0',
        opacity: 0.7,
    },
}); 