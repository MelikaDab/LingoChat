import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LevelPage() {
    const router = useRouter();
    const [selectedLevel, setSelectedLevel] = useState(null);

    const handleNext = () => {
        // Store the selected level in state or pass it to the next screen
        router.push('/(onboarding)/NextPage');
    };

    return (
        <LinearGradient
            colors={['#a2c6ff', '#FFFFFF']}
            style={styles.container}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
        >
            {/* Title */}
            <View style={styles.topContainer}>
                <Text style={styles.title}>What is your French level?</Text>
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
            <TouchableOpacity style={styles.nextButton} onPress={handleNext} disabled={!selectedLevel}>
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
        paddingTop: 80, // Pushes content to the top
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
        opacity: 0.8,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});

