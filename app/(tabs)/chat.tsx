import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

// Define message type
interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
}

export default function ChatScreen() {
    const insets = useSafeAreaInsets();
    const tabBarHeight = useBottomTabBarHeight();
    const [message, setMessage] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: 'Bonjour! Comment ça va?', sender: 'bot' },
        { id: '2', text: 'I\'m doing well, thanks!', sender: 'user' },
        { id: '3', text: 'Très bien! Parlons en français.', sender: 'bot' },
    ]);

    // Set up keyboard listeners
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );

        // Clean up listeners
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const sendMessage = () => {
        if (message.trim().length > 0) {
            setMessages([
                ...messages,
                { id: Date.now().toString(), text: message, sender: 'user' },
            ]);
            setMessage('');
            // Here you would typically send the message to a backend
        }
    };

    const toggleRecording = () => {
        setIsRecording(!isRecording);
        // Here you would implement voice recording functionality
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <View style={[
            styles.messageBubble,
            item.sender === 'user' ? styles.userMessage : styles.botMessage
        ]}>
            <Text style={[
                styles.messageText,
                item.sender === 'user' && styles.userMessageText
            ]}>{item.text}</Text>
        </View>
    );

    return (
        <LinearGradient
            colors={['#a2c6ff', '#FFFFFF']}
            style={styles.container}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
        >
            {/* Header - Outside SafeAreaView to extend past safe area */}
            <View style={[
                styles.header,
                { paddingTop: insets.top + 16 } // Add safe area top inset to padding
            ]}>
                <Text style={styles.headerTitle}>Chat with LingoBot</Text>
            </View>

            <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
                {/* Messages */}
                <FlatList
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    style={styles.messageList}
                    contentContainerStyle={[
                        styles.messageListContent,
                        { paddingBottom: tabBarHeight + 16 } // Use tabBarHeight for consistent padding
                    ]}
                    inverted={false}
                />

                {/* Input Area - Fixed Position */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? tabBarHeight : 0}
                    style={[styles.inputContainer, { bottom: tabBarHeight }]}
                >
                    <View style={[
                        styles.inputWrapper
                    ]}>
                        <TextInput
                            style={styles.input}
                            value={message}
                            onChangeText={setMessage}
                            placeholder="Type a message..."
                            placeholderTextColor="#999"
                            multiline
                        />
                        <TouchableOpacity
                            style={[
                                styles.recordButton,
                                isRecording && styles.recordingButton
                            ]}
                            onPress={toggleRecording}
                        >
                            <MaterialIcons
                                name={isRecording ? "stop" : "mic"}
                                size={24}
                                color="#fff"
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                message.length === 0 && styles.disabledSendButton
                            ]}
                            onPress={sendMessage}
                            disabled={message.length === 0}
                        >
                            <MaterialIcons name="send" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        padding: 16,
        paddingBottom: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e1e1e1',
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    messageList: {
        flex: 1,
        padding: 10,
    },
    messageListContent: {
        paddingTop: 10,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 18,
        marginVertical: 5,
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#3B82F6',
    },
    botMessage: {
        alignSelf: 'flex-start',
        backgroundColor: 'white',
    },
    messageText: {
        fontSize: 16,
        color: '#333',
    },
    userMessageText: {
        color: 'white',
    },
    inputContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderTopWidth: 1,
        borderTopColor: '#e1e1e1',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 24,
        paddingVertical: 5,
        paddingBottom: 25,
        paddingHorizontal: 10,
    },
    input: {
        flex: 1,
        padding: 10,
        fontSize: 16,
        maxHeight: 100,
    },
    recordButton: {
        backgroundColor: '#F87171',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
    },
    recordingButton: {
        backgroundColor: '#EF4444',
    },
    sendButton: {
        backgroundColor: '#3B82F6',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledSendButton: {
        backgroundColor: '#93C5FD',
    },
});