import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileTab() {
    const insets = useSafeAreaInsets();

    return (
        <LinearGradient
            colors={['#a2c6ff', '#FFFFFF']}
            style={styles.container}
        >
            <ScrollView
                style={[
                    styles.scrollView,
                    {
                        paddingTop: insets.top,
                        paddingBottom: insets.bottom
                    }
                ]}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Profile Header */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>JD</Text>
                        </View>
                        <Text style={styles.name}>John Doe</Text>
                        <Text style={styles.email}>john@lingochat.com</Text>
                    </View>
                </View>

                {/* Stats Section */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>💎 1,230</Text>
                        <Text style={styles.statLabel}>Gems</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>🔥 45</Text>
                        <Text style={styles.statLabel}>Day Streak</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>📚 B1</Text>
                        <Text style={styles.statLabel}>Level</Text>
                    </View>
                </View>

                {/* Settings List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    <TouchableOpacity style={styles.listItem}>
                        <Text style={styles.listItemText}>Learning Level</Text>
                        <Text style={styles.listItemChevron}>›</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.listItem}>
                        <Text style={styles.listItemText}>Notification Settings</Text>
                        <Text style={styles.listItemChevron}>›</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.listItem}>
                        <Text style={styles.listItemText}>Appearance</Text>
                        <Text style={styles.listItemChevron}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <TouchableOpacity style={styles.listItem}>
                        <Text style={styles.listItemText}>Edit Profile</Text>
                        <Text style={styles.listItemChevron}>›</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.listItem}>
                        <Text style={[styles.listItemText, styles.logoutText]}>Log Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarContainer: {
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    email: {
        fontSize: 16,
        color: '#666',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
    },
    section: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    listItemText: {
        fontSize: 16,
        color: '#333',
    },
    listItemChevron: {
        fontSize: 24,
        color: '#999',
    },
    logoutText: {
        color: '#EF4444',
    },
});