import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function EditProfileScreen() {
    const [name, setName] = useState('John Doe');
    const [email, setEmail] = useState('john@lingochat.com');
    const [nativeLanguage, setNativeLanguage] = useState('English');

    const router = useRouter();

    const handleSave = () => {
        // Here you would save the profile information
        router.back();
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView style={styles.scrollView}>
                <Text style={styles.title}>Edit Profile</Text>

                {/* Profile Picture */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>JD</Text>
                        </View>
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
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Your email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Native Language</Text>
                        <TextInput
                            style={styles.input}
                            value={nativeLanguage}
                            onChangeText={setNativeLanguage}
                            placeholder="Your native language"
                        />
                    </View>
                </View>

                {/* Connected Accounts */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Connected Accounts</Text>

                    <View style={styles.connectedAccount}>
                        <View style={styles.accountInfo}>
                            <MaterialIcons name="account-circle" size={24} color="#DB4437" style={styles.accountIcon} />
                            <Text style={styles.accountText}>Google</Text>
                        </View>
                        <Text style={styles.connectedText}>Connected</Text>
                    </View>
                </View>

                {/* Delete Account */}
                <TouchableOpacity style={styles.deleteButton}>
                    <Text style={styles.deleteButtonText}>Delete Account</Text>
                </TouchableOpacity>
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
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    connectedAccount: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    accountInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    accountIcon: {
        width: 24,
        height: 24,
        marginRight: 12,
    },
    accountText: {
        fontSize: 16,
        color: '#333',
    },
    connectedText: {
        fontSize: 14,
        color: '#10B981',
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