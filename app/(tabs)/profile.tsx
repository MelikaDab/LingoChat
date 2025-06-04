import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGlobalContext } from '../../context/GlobalContext';
import { useEffect, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

// Map CEFR levels to display format
const formatLevel = (level?: string) => {
    if (!level) return 'A1';
    
    // Convert to uppercase for display
    const upperLevel = level.toUpperCase();
    
    // If it's already in CEFR format (A1, B1, etc)
    if (/^[A-C][1-2]$/.test(upperLevel)) {
        return upperLevel;
    }
    
    // Map legacy format
    switch (level.toLowerCase()) {
        case 'beginner': return 'A1';
        case 'intermediate': return 'B1';
        case 'advanced': return 'C1';
        default: return 'A1';
    }
};

export default function ProfileTab() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const tabBarHeight = useBottomTabBarHeight();
    const { 
        onboardingData, 
        userId,
        currentStreak,
        longestStreak,
        totalLoginDays,
        isLoadingStreak,
        updateStreak,
        gems,
        isLoadingGems,
        awardGems
    } = useGlobalContext();
    const [userLevel, setUserLevel] = useState('A1');
    const [displayName, setDisplayName] = useState('User');
    const [userEmail, setUserEmail] = useState('kylan02@gmail.com');
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);

    // Load user data
    useEffect(() => {
        if (onboardingData) {
            // Format user's level for display
            setUserLevel(formatLevel(onboardingData.proficiencyLevel));
            
            // Set display name
            if (onboardingData.name && onboardingData.name !== 'User') {
                setDisplayName(onboardingData.name);
            }
            
            // Try to use Firebase data - check if onboardingData has extended properties
            const extendedData = onboardingData as any;
            if (extendedData.photoURL) {
                setPhotoUrl(extendedData.photoURL);
            }
            
            // Set email if available
            if (extendedData.email) {
                setUserEmail(extendedData.email);
            }
            
            // Generate initials from name (for fallback)
            if (displayName !== 'User') {
                setInitials(getInitials(displayName));
            }
        }
    }, [onboardingData]);

    // Get user initials for avatar
    const [initials, setInitials] = useState('KO');
    
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const handleLogout = async () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Log Out",
                    onPress: async () => {
                        // Clear onboarding flag and navigate to signup
                        await AsyncStorage.removeItem("hasOnboarded");
                        router.replace("/signup");
                    },
                    style: "destructive"
                }
            ]
        );
    };

    // Navigation handler to avoid TypeScript errors
    const navigateTo = (path: string) => {
        router.push(path as any);
    };

    return (
        <LinearGradient
            colors={['#a2c6ff', '#FFFFFF']}
            style={styles.container}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
        >
            {/* Header */}
            <View style={[
                styles.header,
                { paddingTop: insets.top + 16 } // Add safe area top inset to padding
            ]}>
                <Text style={styles.headerTitle}>Profile</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: tabBarHeight + 20 } // Add space at bottom for tab bar
                ]}
            >
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        {photoUrl ? (
                            <Image 
                                source={{ uri: photoUrl }} 
                                style={styles.avatarImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>{initials}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.name}>{displayName}</Text>
                    <View style={styles.emailContainer}>
                        <MaterialIcons name="email" size={16} color="#666" style={styles.emailIcon} />
                        <Text style={styles.email}>{userEmail}</Text>
                    </View>
                </View>

                {/* Stats Section */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>
                            💎 {isLoadingGems ? '...' : gems.toLocaleString()}
                        </Text>
                        <Text style={styles.statLabel}>Gems</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>
                            🔥 {isLoadingStreak ? '...' : currentStreak}
                        </Text>
                        <Text style={styles.statLabel}>Day Streak</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>📚 {userLevel}</Text>
                        <Text style={styles.statLabel}>Level</Text>
                    </View>
                </View>

                {/* Additional Streak Stats */}
                <View style={styles.streakStatsContainer}>
                    <Text style={styles.sectionTitle}>Learning Statistics</Text>
                    
                    <View style={styles.streakStatRow}>
                        <View style={styles.streakStatItem}>
                            <MaterialIcons name="local-fire-department" size={24} color="#FF6B6B" />
                            <View style={styles.streakStatText}>
                                <Text style={styles.streakStatValue}>
                                    {isLoadingStreak ? '...' : longestStreak}
                                </Text>
                                <Text style={styles.streakStatLabel}>Longest Streak</Text>
                            </View>
                        </View>
                        
                        <View style={styles.streakStatItem}>
                            <MaterialIcons name="event" size={24} color="#4ECDC4" />
                            <View style={styles.streakStatText}>
                                <Text style={styles.streakStatValue}>
                                    {isLoadingStreak ? '...' : totalLoginDays}
                                </Text>
                                <Text style={styles.streakStatLabel}>Total Days</Text>
                            </View>
                        </View>
                    </View>
                    
                    {currentStreak > 0 && (
                        <View style={styles.streakMessage}>
                            <Text style={styles.streakMessageText}>
                                {currentStreak === 1 
                                    ? "Great start! Keep going tomorrow to build your streak! 🎯"
                                    : currentStreak < 7
                                    ? `${currentStreak} days in a row! You're building a great habit! 💪`
                                    : currentStreak < 30
                                    ? `Amazing ${currentStreak}-day streak! You're on fire! 🔥`
                                    : `Incredible ${currentStreak}-day streak! You're a learning champion! 🏆`
                                }
                            </Text>
                        </View>
                    )}
                </View>

                {/* Settings Sections */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigateTo("/(profile)/level")}
                    >
                        <View style={styles.menuIconContainer}>
                            <MaterialIcons name="school" size={20} color="#3B82F6" />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuText}>Learning Level</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color="#999" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigateTo("/(profile)/notifications")}
                    >
                        <View style={styles.menuIconContainer}>
                            <MaterialIcons name="notifications" size={20} color="#3B82F6" />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuText}>Notification Settings</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color="#999" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigateTo("/(profile)/appearance")}
                    >
                        <View style={styles.menuIconContainer}>
                            <MaterialIcons name="palette" size={20} color="#3B82F6" />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuText}>Appearance</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color="#999" />
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigateTo("/(profile)/edit")}
                    >
                        <View style={styles.menuIconContainer}>
                            <MaterialIcons name="edit" size={20} color="#3B82F6" />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuText}>Edit Profile</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color="#999" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[styles.menuItem, styles.logoutItem]}
                        onPress={handleLogout}
                    >
                        <View style={[styles.menuIconContainer, styles.logoutIcon]}>
                            <MaterialIcons name="logout" size={20} color="#EF4444" />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={[styles.menuText, styles.logoutText]}>Log Out</Text>
                        </View>
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
    header: {
        padding: 16,
        paddingBottom: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e1e1e1',
        zIndex: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    profileCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: 'white',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emailContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    emailIcon: {
        marginRight: 6,
    },
    email: {
        fontSize: 16,
        color: '#666',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
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
    sectionContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
        paddingHorizontal: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E8F0FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuContent: {
        flex: 1,
    },
    menuText: {
        fontSize: 16,
        color: '#333',
    },
    logoutItem: {
        borderBottomWidth: 0,
    },
    logoutIcon: {
        backgroundColor: '#FFEAEA',
    },
    logoutText: {
        color: '#EF4444',
    },
    streakStatsContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    streakStatRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    streakStatItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    streakStatText: {
        marginLeft: 8,
    },
    streakStatValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    streakStatLabel: {
        fontSize: 14,
        color: '#666',
    },
    streakMessage: {
        backgroundColor: '#E8F0FF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    streakMessageText: {
        fontSize: 16,
        color: '#333',
    },
});