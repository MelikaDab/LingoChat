import React, { useState } from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function NotificationsScreen() {
    const [dailyReminders, setDailyReminders] = useState(true);
    const [practiceReminders, setPracticeReminders] = useState(true);
    const [newContent, setNewContent] = useState(true);
    const [streakAlerts, setStreakAlerts] = useState(true);
    const [emailUpdates, setEmailUpdates] = useState(false);

    const router = useRouter();

    const handleSave = () => {
        // Here you would save notification settings
        router.back();
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView style={styles.scrollView}>
                <Text style={styles.title}>Notification Preferences</Text>
                <Text style={styles.description}>
                    Manage how and when LingoChat sends you notifications.
                </Text>

                <View style={styles.settingsContainer}>
                    <View style={styles.settingItem}>
                        <View>
                            <Text style={styles.settingText}>Daily Reminders</Text>
                            <Text style={styles.settingDescription}>Reminders to practice at your preferred time</Text>
                        </View>
                        <Switch
                            value={dailyReminders}
                            onValueChange={setDailyReminders}
                            trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
                            thumbColor={dailyReminders ? '#3B82F6' : '#f4f3f4'}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View>
                            <Text style={styles.settingText}>Practice Reminders</Text>
                            <Text style={styles.settingDescription}>Reminders when you haven't practiced in a while</Text>
                        </View>
                        <Switch
                            value={practiceReminders}
                            onValueChange={setPracticeReminders}
                            trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
                            thumbColor={practiceReminders ? '#3B82F6' : '#f4f3f4'}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View>
                            <Text style={styles.settingText}>New Content Alerts</Text>
                            <Text style={styles.settingDescription}>Notifications about new lessons and features</Text>
                        </View>
                        <Switch
                            value={newContent}
                            onValueChange={setNewContent}
                            trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
                            thumbColor={newContent ? '#3B82F6' : '#f4f3f4'}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View>
                            <Text style={styles.settingText}>Streak Alerts</Text>
                            <Text style={styles.settingDescription}>Alerts when your streak is at risk</Text>
                        </View>
                        <Switch
                            value={streakAlerts}
                            onValueChange={setStreakAlerts}
                            trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
                            thumbColor={streakAlerts ? '#3B82F6' : '#f4f3f4'}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View>
                            <Text style={styles.settingText}>Email Updates</Text>
                            <Text style={styles.settingDescription}>Receive weekly progress reports via email</Text>
                        </View>
                        <Switch
                            value={emailUpdates}
                            onValueChange={setEmailUpdates}
                            trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
                            thumbColor={emailUpdates ? '#3B82F6' : '#f4f3f4'}
                        />
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
    settingsContainer: {
        marginBottom: 30,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    settingText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 14,
        color: '#666',
        maxWidth: '85%',
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