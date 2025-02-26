import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';


export default function NamePage() {
    const router = useRouter();
    const [name, setName] = useState('');

    const handleNext = () => {
        router.push('/(onboarding)/LevelPage');
    };

    return (
        <LinearGradient
            colors={['#a2c6ff', '#FFFFFF']}
            style={styles.container}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
        >
            {/* Content positioned at the top */}
            <View style={styles.topContainer}>
                <Text style={styles.title}>How should we refer to you?</Text>
                <Text style={styles.subtitle}>Please enter your name.</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Your name"
                    placeholderTextColor="#999"
                    value={name}
                    onChangeText={setName}
                />
            </View>

            {/* Next button pinned at the bottom */}
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
        paddingTop: 60, // Moves content to the top
    },
    topContainer: {
        alignItems: 'flex-start', // Align items to the left
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
        width: '100%', // Make input full width
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
    nextButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});
