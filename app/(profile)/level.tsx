import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const levels = [
    { id: 'a1', label: 'A1 - Beginner' },
    { id: 'a2', label: 'A2 - Elementary' },
    { id: 'b1', label: 'B1 - Intermediate' },
    { id: 'b2', label: 'B2 - Upper Intermediate' },
    { id: 'c1', label: 'C1 - Advanced' },
    { id: 'c2', label: 'C2 - Proficiency' }
];

export default function LearningLevelScreen() {
    const [selectedLevel, setSelectedLevel] = useState('a1');
    const router = useRouter();

    const handleSave = () => {
        // Here you would save the selected level to your backend or local storage
        // For now, we'll just navigate back
        router.back();
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
                            onPress={() => setSelectedLevel(level.id)}
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
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Save Changes</Text>
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
}); 