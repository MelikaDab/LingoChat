import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function AppearanceScreen() {
    const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', or 'system'
    const router = useRouter();
    const colorScheme = useColorScheme();

    const handleSave = () => {
        // Here you would save appearance settings
        router.back();
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView style={styles.scrollView}>
                <Text style={styles.title}>Appearance</Text>
                <Text style={styles.description}>
                    Personalize how LingoChat looks for you.
                </Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Theme</Text>

                    <TouchableOpacity
                        style={[styles.optionItem, themeMode === 'light' && styles.selectedOption]}
                        onPress={() => setThemeMode('light')}
                    >
                        <View style={styles.optionContent}>
                            <Text style={styles.optionText}>Light Mode</Text>
                            <Text style={styles.optionDescription}>Standard light appearance</Text>
                        </View>
                        {themeMode === 'light' && (
                            <View style={styles.checkmark}>
                                <Text style={styles.checkmarkText}>✓</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.optionItem, themeMode === 'dark' && styles.selectedOption]}
                        onPress={() => setThemeMode('dark')}
                    >
                        <View style={styles.optionContent}>
                            <Text style={styles.optionText}>Dark Mode</Text>
                            <Text style={styles.optionDescription}>Easier on the eyes in low light</Text>
                        </View>
                        {themeMode === 'dark' && (
                            <View style={styles.checkmark}>
                                <Text style={styles.checkmarkText}>✓</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.optionItem, themeMode === 'system' && styles.selectedOption]}
                        onPress={() => setThemeMode('system')}
                    >
                        <View style={styles.optionContent}>
                            <Text style={styles.optionText}>System Default</Text>
                            <Text style={styles.optionDescription}>Matches your device settings</Text>
                        </View>
                        {themeMode === 'system' && (
                            <View style={styles.checkmark}>
                                <Text style={styles.checkmarkText}>✓</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Text Size</Text>

                    <View style={styles.textSizeContainer}>
                        <TouchableOpacity style={styles.textSizeButton}>
                            <Text style={styles.textSizeButtonText}>A-</Text>
                        </TouchableOpacity>

                        <View style={styles.textSizePreview}>
                            <Text style={styles.previewText}>Preview Text</Text>
                        </View>

                        <TouchableOpacity style={styles.textSizeButton}>
                            <Text style={styles.textSizeButtonText}>A+</Text>
                        </TouchableOpacity>
                    </View>
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
    section: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    selectedOption: {
        backgroundColor: '#EBF5FF',
    },
    optionContent: {
        flex: 1,
    },
    optionText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    optionDescription: {
        fontSize: 14,
        color: '#666',
    },
    checkmark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmarkText: {
        color: 'white',
        fontWeight: 'bold',
    },
    textSizeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    textSizeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textSizeButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    textSizePreview: {
        flex: 1,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    previewText: {
        fontSize: 16,
        color: '#333',
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