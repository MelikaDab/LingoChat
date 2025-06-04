import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useGlobalContext } from '../../context/GlobalContext';
import FirestoreService from '../../app/services/FirestoreService';

// Add a type definition for Firebase user data
interface FirebaseUserData {
  displayName?: string;
  email?: string;
  photoURL?: string;
  name?: string;
  [key: string]: any; // Allow other fields from Firebase
}

export default function EditProfileScreen() {
    const { onboardingData, userId, setOnboardingData } = useGlobalContext();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('kylan02@gmail.com'); // Default email
    const [photoURL, setPhotoURL] = useState<string | null>(null);
    const [initials, setInitials] = useState('KO'); // Default initials
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    useEffect(() => {
        // Cast onboardingData to FirebaseUserData type to avoid TypeScript errors
        const userData = onboardingData as unknown as FirebaseUserData;
        
        if (userData) {
            console.log("User data loaded:", userData); // Debug log
            
            // Set display name (prefer displayName over name)
            if (userData.displayName) {
                setName(userData.displayName);
                
                // Generate initials from displayName
                const userInitials = userData.displayName
                    .split(' ')
                    .map(part => part.charAt(0))
                    .join('')
                    .toUpperCase()
                    .substring(0, 2);
                setInitials(userInitials);
            } else if (userData.name) {
                setName(userData.name);
                
                // Generate initials from name
                const userInitials = userData.name
                    .split(' ')
                    .map(part => part.charAt(0))
                    .join('')
                    .toUpperCase()
                    .substring(0, 2);
                setInitials(userInitials);
            }
            
            // Set email
            if (userData.email) {
                setEmail(userData.email);
            }
            
            // Set profile photo URL
            if (userData.photoURL) {
                console.log("Photo URL found:", userData.photoURL); // Debug log
                setPhotoURL(userData.photoURL);
            }
        }
    }, [onboardingData]);

    const handleSave = async () => {
        try {
            // Check if name has changed
            if (!name) {
                Alert.alert('Error', 'Name cannot be empty');
                return;
            }
            
            // Make sure user is logged in
            if (!userId) {
                Alert.alert('Error', 'You must be logged in to update your profile');
                return;
            }
            
            setIsLoading(true);
            
            // Create updated data object
            const updatedData = {
                name: name,
                proficiencyLevel: onboardingData.proficiencyLevel || 'a1'
            };
            
            console.log("Saving updated profile:", updatedData);
            
            // Save to Firebase
            await FirestoreService.saveUserOnboarding(userId, updatedData);
            
            // Update context
            setOnboardingData({
                ...onboardingData,
                name: name
            });
            
            Alert.alert("Success", "Profile updated successfully");
        router.back();
        } catch (error) {
            console.error("Error saving profile:", error);
            Alert.alert("Error", "Failed to update profile. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView style={styles.scrollView}>
                <Text style={styles.title}>Edit Profile</Text>

                {/* Profile Picture */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        {photoURL ? (
                            <Image 
                                source={{ uri: photoURL }} 
                                style={styles.avatar}
                                resizeMode="cover"
                            />
                        ) : (
                        <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                        )}
                        <TouchableOpacity style={styles.editAvatarButton}>
                            <MaterialIcons name="camera-alt" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.changePhotoText}>Change Profile Photo</Text>
                </View>

                {/* Form Fields */}
                <View style={styles.formSection}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Your name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            value={email}
                            placeholder="Your email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={false}
                        />
                    </View>
                </View>

                {/* Delete Account */}
                <TouchableOpacity style={styles.deleteButton}>
                    <Text style={styles.deleteButtonText}>Delete Account</Text>
                </TouchableOpacity>
            </ScrollView>

            <View style={styles.bottomContainer}>
                <TouchableOpacity 
                    style={styles.saveButton} 
                    onPress={handleSave}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
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
        marginBottom: 20,
        color: '#333',
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 10,
    },
    avatar: {
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
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#3B82F6',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    changePhotoText: {
        fontSize: 16,
        color: '#3B82F6',
    },
    formSection: {
        marginBottom: 30,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
    },
    disabledInput: {
        backgroundColor: '#F3F4F6',
        color: '#374151',
    },
    deleteButton: {
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    deleteButtonText: {
        fontSize: 16,
        color: '#EF4444',
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