import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { generateResponse, transcribeAudio, synthesizeSpeech } from '../services/OpenAIService';
import { Audio, AVPlaybackStatus } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';

// Define message type
interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    hasAudio?: boolean;
    audioUri?: string;
}

export default function ChatScreen() {
    const insets = useSafeAreaInsets();
    const tabBarHeight = useBottomTabBarHeight();
    const [message, setMessage] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const [webAudioUrl, setWebAudioUrl] = useState<string | null>(null);
    
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
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [sound]);

    const startRecording = async () => {
        try {
            if (Platform.OS === 'web') {
                await startWebRecording();
            } else {
                await startNativeRecording();
            }
            
            setIsRecording(true);
        } catch (error) {
            console.error('Failed to start recording:', error);
            Alert.alert('Error', 'Failed to start recording. Please try again.');
        }
    };

    const startWebRecording = async () => {
        try {
            // Request permissions
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Create media recorder
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            
            // Set up event handlers
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };
            
            // Start recording
            mediaRecorder.start();
            console.log('Recording started on web');
        } catch (error) {
            console.error('Error starting web recording:', error);
            throw error;
        }
    };

    const startNativeRecording = async () => {
        // Request permissions
        const permissionResponse = await Audio.requestPermissionsAsync();
        if (permissionResponse.status !== 'granted') {
            Alert.alert('Permission required', 'You need to grant microphone permissions to record audio.');
            return;
        }

        // Set audio mode for recording
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            staysActiveInBackground: false,
        });

        // Create recording object
        const { recording } = await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
        );

        setRecording(recording);
        console.log('Recording started on native');
    };

    const stopRecording = async () => {
        setIsRecording(false);
        setIsTranscribing(true);
        
        try {
            let uri: string;
            
            if (Platform.OS === 'web') {
                uri = await stopWebRecording();
            } else {
                uri = await stopNativeRecording();
            }
            
            if (!uri) {
                throw new Error('Recording URI is null');
            }

            // Transcribe the audio
            const transcribedText = await transcribeAudio(uri);
            
            // Add user message with transcribed text
            const userMessage: Message = {
                id: Date.now().toString(),
                text: transcribedText,
                sender: 'user',
                hasAudio: true,
                audioUri: uri
            };

            setMessages(prevMessages => [...prevMessages, userMessage]);
            
            // Process the transcribed text with OpenAI
            sendTranscribedMessage(transcribedText);
        } catch (error) {
            console.error('Failed to stop recording:', error);
            setIsTranscribing(false);
            Alert.alert('Error', 'Failed to process recording. Please try again.');
        }
    };

    const stopWebRecording = async (): Promise<string> => {
        return new Promise((resolve, reject) => {
            try {
                const mediaRecorder = mediaRecorderRef.current;
                if (!mediaRecorder) {
                    reject(new Error('No MediaRecorder instance found'));
                    return;
                }
                
                mediaRecorder.onstop = () => {
                    // Create a blob from the audio chunks
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    
                    // Store the URL for later use
                    setWebAudioUrl(audioUrl);
                    
                    // Reset state
                    audioChunksRef.current = [];
                    
                    // Close the media tracks
                    const tracks = mediaRecorder.stream.getTracks();
                    tracks.forEach(track => track.stop());
                    
                    resolve(audioUrl);
                };
                
                mediaRecorder.stop();
                console.log('Web recording stopped');
            } catch (error) {
                console.error('Error stopping web recording:', error);
                reject(error);
            }
        });
    };

    const stopNativeRecording = async (): Promise<string> => {
        if (!recording) {
            throw new Error('No recording in progress');
        }
        
        // Stop the recording
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        
        console.log('Native recording stopped:', uri);
        return uri || '';
    };

    const sendTranscribedMessage = async (transcribedText: string) => {
        try {
            setIsLoading(true);
            
            // Get response from OpenAI
            const botResponse = await generateResponse(transcribedText);
            
            // Generate audio for bot response
            const audioUri = await synthesizeSpeech(botResponse);
            
            // Add bot response to messages
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: botResponse,
                sender: 'bot',
                hasAudio: true,
                audioUri
            };

            setMessages(prevMessages => [...prevMessages, botMessage]);
        } catch (error) {
            console.error('Error sending transcribed message:', error);
            // Add error message
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Sorry, I encountered an error. Please try again.',
                sender: 'bot'
            };

            setMessages(prevMessages => [...prevMessages, errorMessage]);
        } finally {
            setIsLoading(false);
            setIsTranscribing(false);
        }
    };

    const sendMessage = async () => {
        if (message.trim().length > 0) {
            const userMessage: Message = {
                id: Date.now().toString(),
                text: message,
                sender: 'user'
            };

            setMessages(prevMessages => [...prevMessages, userMessage]);
            setMessage('');
            setIsLoading(true);

            try {
                // Get response from OpenAI
                const botResponse = await generateResponse(message);
                
                // Generate audio for bot response
                const audioUri = await synthesizeSpeech(botResponse);

                // Add bot response to messages
                const botMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text: botResponse,
                    sender: 'bot',
                    hasAudio: true,
                    audioUri
                };

                setMessages(prevMessages => [...prevMessages, botMessage]);
            } catch (error) {
                console.error('Error sending message:', error);
                // Add error message
                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text: 'Sorry, I encountered an error. Please try again.',
                    sender: 'bot'
                };

                setMessages(prevMessages => [...prevMessages, errorMessage]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const playAudio = async (messageId: string, audioUri: string) => {
        try {
            // If a sound is already playing, unload it
            if (sound) {
                await sound.unloadAsync();
                setSound(null);
            }

            // If the same message is being played again, just stop it
            if (currentlyPlayingId === messageId) {
                setCurrentlyPlayingId(null);
                return;
            }

            // Create a new sound object based on platform
            if (Platform.OS === 'web') {
                // For web, audioUri is a blob URL created by URL.createObjectURL
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: audioUri },
                    { shouldPlay: true }
                );
                
                setSound(newSound);
                setCurrentlyPlayingId(messageId);
                
                // When playback finishes, update state
                newSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
                    if (status.isLoaded && status.didJustFinish) {
                        setCurrentlyPlayingId(null);
                    }
                });
            } else {
                // For native platforms, audioUri is a file path
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: audioUri },
                    { shouldPlay: true }
                );
                
                setSound(newSound);
                setCurrentlyPlayingId(messageId);
                
                // When playback finishes, update state
                newSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
                    if (status.isLoaded && status.didJustFinish) {
                        setCurrentlyPlayingId(null);
                    }
                });
            }
        } catch (error) {
            console.error('Error playing audio:', error);
            Alert.alert('Error', 'Failed to play audio. Please try again.');
        }
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
            
            {item.hasAudio && item.audioUri && (
                <TouchableOpacity
                    style={styles.audioButton}
                    onPress={() => playAudio(item.id, item.audioUri!)}
                >
                    <MaterialIcons
                        name={currentlyPlayingId === item.id ? "stop" : "volume-up"}
                        size={20}
                        color={item.sender === 'user' ? "white" : "#3B82F6"}
                    />
                </TouchableOpacity>
            )}
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
                            editable={!isLoading && !isRecording && !isTranscribing}
                        />
                        <TouchableOpacity
                            style={[
                                styles.recordButton,
                                isRecording && styles.recordingButton
                            ]}
                            onPress={toggleRecording}
                            disabled={isLoading || isTranscribing}
                        >
                            {isTranscribing ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <MaterialIcons
                                    name={isRecording ? "stop" : "mic"}
                                    size={24}
                                    color="#fff"
                                />
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                ((message.length === 0 && !isRecording) || isLoading || isTranscribing) && styles.disabledSendButton
                            ]}
                            onPress={sendMessage}
                            disabled={(message.length === 0 && !isRecording) || isLoading || isTranscribing}
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
        flexDirection: 'row',
        alignItems: 'center',
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
        flex: 1,
    },
    userMessageText: {
        color: 'white',
    },
    audioButton: {
        marginLeft: 8,
        padding: 4,
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
        paddingHorizontal: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        maxHeight: 100,
    },
    recordButton: {
        backgroundColor: '#3B82F6',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 6,
    },
    recordingButton: {
        backgroundColor: '#FF3B30',
    },
    sendButton: {
        backgroundColor: '#3B82F6',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledSendButton: {
        backgroundColor: '#A7C7FF',
    },
});