import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGlobalContext } from '../../context/GlobalContext';

export default function NamePage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const { setOnboardingData, onboardingData } = useGlobalContext();

    // Pre-fill the name field if it already exists in onboarding data or localStorage
    useEffect(() => {
        // Check localStorage first
        try {
            const savedName = localStorage.getItem('lingochat_user_name');
            if (savedName) {
                console.log("Found name in localStorage:", savedName);
                setName(savedName);
                return;
            }
        } catch (e) {
            console.log("Error accessing localStorage:", e);
        }

        // Fallback to context data
        if (onboardingData.name) {
            setName(onboardingData.name);
        }
        
        console.log("Welcome page mounted, current onboarding data:", onboardingData);
    }, [onboardingData.name]);

    const handleNext = () => {
        if (!name.trim()) {
            Alert.alert('Please enter your name');
            return;
        }
        
        console.log("Setting onboarding data with name:", name.trim());
        
        // Store the name in localStorage so it persists across navigation
        try {
            localStorage.setItem('lingochat_user_name', name.trim());
            console.log("Saved name to localStorage");
        } catch (e) {
            console.log("Error saving to localStorage:", e);
        }
        
        // Create a complete data object with all required fields
        const updatedData = {
            ...onboardingData,
            name: name.trim(),
            // Ensure we have at least placeholder data for other fields
            proficiencyLevel: onboardingData.proficiencyLevel || undefined,
            targetLanguage: onboardingData.targetLanguage || undefined
        };
        
        setOnboardingData(updatedData);
        
        // Use various navigation methods to try and overcome routing issues
        try {
            console.log("Attempting hardcoded navigation to LevelPage");
            // Try using a direct href navigation instead
            // This bypasses the router.push mechanism which might be getting intercepted
            window.location.href = "/LevelPage";
        } catch (error) {
            console.error("Navigation error:", error);
            // Fallback to router.push if window.location fails
            try {
                router.push("/LevelPage");
            } catch (error) {
                console.error("Fallback navigation error:", error);
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.topContainer}>
                <Text style={styles.title}>How should we refer to you?</Text>
                <Text style={styles.subtitle}>Please enter your name.</Text>

                <TextInput
                    style={styles.input}
                    placeholderTextColor="#999"
                    value={name}
                    onChangeText={setName}
                />
            </View>

            <TouchableOpacity 
                style={[
                    styles.nextButton,
                    !name.trim() && styles.disabledButton
                ]} 
                onPress={handleNext}
                disabled={!name.trim()}
            >
                <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
        paddingTop: 60,
        backgroundColor: '#E8F0FE'
    },
    topContainer: {
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#333',
        marginBottom: 24,
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 25,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        fontSize: 16,
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
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    }
});
