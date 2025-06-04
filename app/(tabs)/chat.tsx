import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, ActivityIndicator, Alert, Animated, Modal, PanResponder } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { generateResponse, transcribeAudio, synthesizeSpeech, translateWord } from '../services/OpenAIService';
import { Audio, AVPlaybackStatus } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import { useGlobalContext } from '../../context/GlobalContext';
import FirestoreService, { Flashcard } from '../services/FirestoreService';

// Define message type
interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    hasAudio?: boolean;
    audioUri?: string;
}

// Define flashcard type for local storage
interface LocalFlashcard {
    english: string;
    french: string;
    createdAt: Date;
}

export default function ChatScreen() {
    const { userId, onboardingData } = useGlobalContext();
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
    
    const [messages, setMessages] = useState<Message[]>([]);
    const flatListRef = useRef<FlatList<Message>>(null);
    
    // Animation for recording button pulse effect
    const pulseAnim = useRef(new Animated.Value(1)).current;
    
    // Enhanced states for multi-word selection with simple web approach
    const [selectedWords, setSelectedWords] = useState<string[]>([]);
    const [showWordPopup, setShowWordPopup] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionStartIndex, setSelectionStartIndex] = useState<number | null>(null);
    const [selectionEndIndex, setSelectionEndIndex] = useState<number | null>(null);
    const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartWord, setDragStartWord] = useState<number | null>(null);
    const [dragCurrentWord, setDragCurrentWord] = useState<number | null>(null);
    
    // State for flashcard creation
    const [isCreatingFlashcard, setIsCreatingFlashcard] = useState(false);
    
    // State for storing flashcards locally if Firebase fails
    const [localFlashcards, setLocalFlashcards] = useState<LocalFlashcard[]>([]);
    
    // Setup pulse animation when recording
    useEffect(() => {
        let pulseAnimation: Animated.CompositeAnimation;
        
        if (isRecording) {
            pulseAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            );
            pulseAnimation.start();
        } else {
            pulseAnim.setValue(1);
        }
        
        return () => {
            if (pulseAnimation) {
                pulseAnimation.stop();
            }
        };
    }, [isRecording, pulseAnim]);

    // Set up keyboard listeners and web-specific styles
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

        // Apply web-specific CSS to disable text selection
        if (Platform.OS === 'web') {
            const style = document.createElement('style');
            style.textContent = `
                .chat-text-container, .chat-text-container * {
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                    user-select: none !important;
                    -webkit-touch-callout: none !important;
                    -webkit-tap-highlight-color: transparent !important;
                    cursor: pointer !important;
                }
                
                /* Prevent text selection on the entire app body when dragging */
                body {
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                    user-select: none !important;
                }
                
                /* Allow text selection for input fields */
                input, textarea {
                    -webkit-user-select: text !important;
                    -moz-user-select: text !important;
                    -ms-user-select: text !important;
                    user-select: text !important;
                }
            `;
            document.head.appendChild(style);
            
            return () => {
                document.head.removeChild(style);
                keyboardDidShowListener.remove();
                keyboardDidHideListener.remove();
                if (sound) {
                    sound.unloadAsync();
                }
            };
        }

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

    const getUserProficiencyLevel = (): string => {
        // Get the proficiency level from onboarding data
        const level = onboardingData.proficiencyLevel;
        
        // Return the level or default to 'a1' if not set
        return level ? level.toLowerCase() : 'a1';
    };

    const sendTranscribedMessage = async (transcribedText: string) => {
        try {
            setIsLoading(true);
            
            // Get user's proficiency level
            const proficiencyLevel = getUserProficiencyLevel();
            console.log(`Using proficiency level: ${proficiencyLevel} for conversation`);
            
            // Get response from OpenAI with proficiency level
            const botResponse = await generateResponse(transcribedText, proficiencyLevel);
            
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
                // Get user's proficiency level
                const proficiencyLevel = getUserProficiencyLevel();
                console.log(`Using proficiency level: ${proficiencyLevel} for conversation`);
                
                // Get response from OpenAI with proficiency level
                const botResponse = await generateResponse(message, proficiencyLevel);
                
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

    // Helper function to clean word of punctuation
    const cleanWord = (word: string): string => {
        return word.replace(/[.,!?;:'"()]/g, '').trim();
    };
    
    // Simple web-specific selection handlers
    const handleWordMouseDown = (wordIndex: number, messageId: string, words: string[]) => {
        console.log('Mouse down on word:', wordIndex, words[wordIndex]);
        setIsDragging(true);
        setCurrentMessageId(messageId);
        setDragStartWord(wordIndex);
        setDragCurrentWord(wordIndex);
        updateSelection(wordIndex, wordIndex, words);
    };
    
    const handleWordMouseEnter = (wordIndex: number, messageId: string, words: string[]) => {
        if (isDragging && currentMessageId === messageId && dragStartWord !== null) {
            console.log('Mouse entered word during drag:', wordIndex, words[wordIndex]);
            setDragCurrentWord(wordIndex);
            updateSelection(dragStartWord, wordIndex, words);
        }
    };
    
    const handleWordMouseUp = (messageId: string, words: string[]) => {
        console.log('Mouse up, finishing selection');
        if (isDragging && selectedWords.length > 0) {
            setShowWordPopup(true);
        }
        setIsDragging(false);
    };
    
    const updateSelection = (startIndex: number, endIndex: number, words: string[]) => {
        const start = Math.min(startIndex, endIndex);
        const end = Math.max(startIndex, endIndex);
        
        setSelectionStartIndex(start);
        setSelectionEndIndex(end);
        
        const selectedWordsRange = words.slice(start, end + 1)
            .map(word => cleanWord(word))
            .filter(word => word.length > 0);
        
        setSelectedWords(selectedWordsRange);
        console.log('Updated selection:', selectedWordsRange);
    };
    
    // Dummy function for layout (not needed for simple approach)
    const onWordLayout = () => {};

    const handleWordPress = (word: string, wordIndex: number, messageId: string, words: string[]) => {
        // Handle single word selection (tap without drag)
        if (!isDragging) {
            const cleanedWord = cleanWord(word);
            
            if (cleanedWord.length > 0) {
                setSelectedWords([cleanedWord]);
                setCurrentMessageId(messageId);
                setShowWordPopup(true);
            }
        }
    };
    
    const handleAddFlashcard = async () => {
        if (selectedWords.length === 0) {
            setShowWordPopup(false);
            return;
        }
        
        // User must be logged in to save flashcards
        if (!userId) {
            Alert.alert('Error', 'You must be logged in to save flashcards.');
            setShowWordPopup(false);
            setSelectedWords([]);
            return;
        }
        
        try {
            setIsCreatingFlashcard(true);
            
            // Join selected words into a phrase
            const phrase = selectedWords.join(' ');
            
            // Translate the phrase using OpenAI
            const translation = await translateWord(phrase);
            
            console.log('Phrase translation:', translation);
            
            // Create flashcard object
            const flashcard: Flashcard = {
                english: translation.english,
                french: translation.french
            };
            
            try {
                // Try to save to Firebase
                await FirestoreService.saveFlashcard(userId, flashcard);
                
                // Show success message
                Alert.alert(
                    'Flashcard Added!', 
                    `Added "${translation.english} ↔ ${translation.french}" to your flashcards.`
                );
            } catch (firebaseError) {
                console.error('Error saving flashcard to Firebase:', firebaseError);
                
                // Firebase permission error - save locally instead
                const localFlashcard: LocalFlashcard = {
                    english: translation.english,
                    french: translation.french,
                    createdAt: new Date()
                };
                
                // Add to local state
                setLocalFlashcards(prev => [localFlashcard, ...prev]);
                
                // Store in localStorage if available
                try {
                    const existingCards = localStorage.getItem('lingochat_flashcards');
                    const cards = existingCards ? JSON.parse(existingCards) : [];
                    cards.unshift(localFlashcard);
                    localStorage.setItem('lingochat_flashcards', JSON.stringify(cards));
                } catch (e) {
                    console.log("Error saving to localStorage:", e);
                }
                
                // Show a modified success message
                Alert.alert(
                    'Flashcard Added Locally!', 
                    `Added "${translation.english} ↔ ${translation.french}" to your local flashcards. Please update your Firebase permissions to save cards online.`
                );
            }
        } catch (error) {
            console.error('Error creating flashcard:', error);
            Alert.alert(
                'Error', 
                'Failed to create flashcard. Please try again.'
            );
        } finally {
            setIsCreatingFlashcard(false);
            setShowWordPopup(false);
            setSelectedWords([]);
            setCurrentMessageId(null);
            setSelectionStartIndex(null);
            setSelectionEndIndex(null);
            setIsDragging(false);
            setDragStartWord(null);
            setDragCurrentWord(null);
        }
    };
    
    const handleCancelFlashcard = () => {
        setShowWordPopup(false);
        setSelectedWords([]);
        setCurrentMessageId(null);
        setSelectionStartIndex(null);
        setSelectionEndIndex(null);
        setIsDragging(false);
        setDragStartWord(null);
        setDragCurrentWord(null);
    };
    
    // Function to check if a word is currently selected
    const isWordSelected = (wordIndex: number, messageId: string): boolean => {
        if (currentMessageId !== messageId || selectionStartIndex === null) {
            return false;
        }
        
        if (selectionEndIndex === null) {
            return wordIndex === selectionStartIndex;
        }
        
        const start = Math.min(selectionStartIndex, selectionEndIndex);
        const end = Math.max(selectionStartIndex, selectionEndIndex);
        return wordIndex >= start && wordIndex <= end;
    };
    
    // Function to render individual words as touchable components with selection support
    const renderWords = (text: string, isUserMessage: boolean, messageId: string) => {
        // Split text into words with spaces and punctuation preserved
        const wordPattern = /(\S+)(\s*)/g;
        const matches = [...text.matchAll(wordPattern)];
        const words = matches.map(match => match[1]);
        
        if (Platform.OS === 'web') {
            // For web, use simple mouse events for reliable selection
            return (
                <View 
                    style={[styles.textContainer, styles.webWordContainer]}
                    {...(Platform.OS === 'web' ? { 
                        onMouseUp: () => handleWordMouseUp(messageId, words) 
                    } as any : {})}
                >
                    {matches.map((match, index) => {
                        const word = match[1];
                        const space = match[2] || '';
                        const isSelected = isWordSelected(index, messageId);
                        
                        return (
                            <View key={index} style={styles.webWordRow}>
                                <TouchableOpacity
                                    style={[
                                        styles.webWordTouchable,
                                        isSelected && styles.selectedWordTouchable,
                                        isSelected && isUserMessage && styles.selectedUserWordTouchable
                                    ]}
                                    {...(Platform.OS === 'web' ? {
                                        onMouseDown: () => handleWordMouseDown(index, messageId, words),
                                        onMouseEnter: () => handleWordMouseEnter(index, messageId, words)
                                    } as any : {})}
                                    onPress={() => handleWordPress(word, index, messageId, words)}
                                    activeOpacity={1}
                                >
                                    <Text 
                                        style={[
                                            styles.wordText,
                                            isUserMessage && styles.userWordText
                                        ]}
                                        selectable={false}
                                    >
                                        {word}
                                    </Text>
                                </TouchableOpacity>
                                {space && (
                                    <Text 
                                        style={[
                                            styles.wordText,
                                            isUserMessage && styles.userWordText
                                        ]}
                                        selectable={false}
                                    >
                                        {space}
                                    </Text>
                                )}
                            </View>
                        );
                    })}
                </View>
            );
        } else {
            // For native platforms, use the original approach
            return (
                <View style={styles.textContainer}>
                    <Text style={[
                        styles.messageText,
                        isUserMessage && styles.userMessageText
                    ]}>
                        {matches.map((match, index) => {
                            const word = match[1]; // The word
                            const space = match[2] || ''; // The space after the word
                            const isSelected = isWordSelected(index, messageId);
                            
                            return (
                                <React.Fragment key={index}>
                                    <Text 
                                        onPress={() => handleWordPress(word, index, messageId, words)}
                                        style={[
                                            styles.wordText,
                                            isUserMessage && styles.userWordText,
                                            isSelected && styles.selectedWord,
                                            isSelected && isUserMessage && styles.selectedUserWord
                                        ]}
                                        suppressHighlighting={true}
                                    >
                                        {word}
                                    </Text>
                                    <Text suppressHighlighting={true}>
                                        {space}
                                    </Text>
                                </React.Fragment>
                            );
                        })}
                    </Text>
                </View>
            );
        }
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <View style={[
            styles.messageBubble,
            item.sender === 'user' ? styles.userMessage : styles.botMessage
        ]}>
            {item.sender === 'bot' && (
                <View style={styles.botAvatar}>
                    <MaterialIcons name="smart-toy" size={16} color="#3B82F6" />
                </View>
            )}
            <View style={[
                styles.messageContent,
                item.sender === 'user' ? styles.userMessageContent : styles.botMessageContent
            ]}>
                {renderWords(item.text, item.sender === 'user', item.id)}
                
                {item.hasAudio && item.audioUri && (
                    <View style={styles.audioButtonContainer}>
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
                    </View>
                )}
            </View>
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

            {/* Main Content Area - Extends exactly to input box */}
            <View style={[
                styles.contentContainer, 
                { 
                    // Add extensive bottom padding to guarantee it extends well past the input box
                    paddingBottom: 120
                }
            ]}>
                {/* Messages - FlexGrow to fill available space */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    style={styles.messageList}
                    contentContainerStyle={styles.messageListContent}
                    inverted={false}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <MaterialIcons name="chat" size={64} color="#B3C5E8" />
                            <Text style={styles.emptyTitle}>Start your French conversation!</Text>
                            <Text style={styles.emptySubtitle}>
                                Send a message or use voice recording to practice French with LingoBot.
                            </Text>
                            <Text style={styles.emptyTip}>
                                💡 Tip: Tap any word or drag across multiple words in messages to add them as flashcards!
                            </Text>
                        </View>
                    )}
                    // Auto-scroll to bottom on new messages
                    onContentSizeChange={() => {
                        if (messages.length > 0) {
                            setTimeout(() => {
                                try {
                                    flatListRef.current?.scrollToEnd({ animated: true });
                                } catch (error) {
                                    console.log("Error scrolling to bottom:", error);
                                }
                            }, 100);
                        }
                    }}
                />
            </View>

            {/* Input Area - Fixed at bottom */}
            <View style={[
                styles.inputContainer, 
                { bottom: tabBarHeight }
            ]}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? tabBarHeight : 0}
                >
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            value={message}
                            onChangeText={setMessage}
                            placeholder="Type a message..."
                            placeholderTextColor="#999"
                            multiline
                            editable={!isLoading && !isRecording && !isTranscribing}
                        />
                        
                        <Animated.View style={{
                            transform: [{ scale: pulseAnim }]
                        }}>
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
                        </Animated.View>
                        
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
            </View>

            {/* Enhanced Word Selection Popup */}
            <Modal
                visible={showWordPopup}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCancelFlashcard}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={handleCancelFlashcard}
                    disabled={isCreatingFlashcard}
                >
                    <View style={styles.popupContainer}>
                        <Text style={styles.popupTitle}>
                            Add to Flashcards?
                        </Text>
                        <Text style={styles.popupText}>
                            Do you want to add "{selectedWords.join(' ')}" as a flashcard?
                        </Text>
                        <Text style={styles.popupHint}>
                            {selectedWords.length === 1 
                                ? 'Tip: You can drag across multiple words to select phrases!' 
                                : `${selectedWords.length} words selected - Perfect for learning phrases!`}
                        </Text>
                        <View style={styles.popupButtons}>
                            <TouchableOpacity 
                                style={[styles.popupButton, styles.popupButtonCancel]}
                                onPress={handleCancelFlashcard}
                                disabled={isCreatingFlashcard}
                            >
                                <Text style={styles.popupButtonText}>No</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.popupButton, styles.popupButtonConfirm]}
                                onPress={handleAddFlashcard}
                                disabled={isCreatingFlashcard}
                            >
                                {isCreatingFlashcard ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text style={[styles.popupButtonText, styles.popupButtonTextConfirm]}>Yes</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    contentContainer: {
        flex: 1,
        marginTop: 8,
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
    messageList: {
        flex: 1,
        paddingHorizontal: 15,
    },
    messageListContent: {
        paddingTop: 10,
        paddingBottom: 150, // Extra padding at the bottom for good measure
    },
    messageBubble: {
        maxWidth: '85%',
        marginVertical: 5,
        flexDirection: 'row',
        alignItems: 'flex-start',
        width: 'auto',
    },
    messageContent: {
        padding: 12,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
        flexShrink: 1,
    },
    userMessage: {
        alignSelf: 'flex-end',
    },
    botMessage: {
        alignSelf: 'flex-start',
    },
    userMessageContent: {
        backgroundColor: '#3B82F6',
        borderBottomRightRadius: 5,
    },
    botMessageContent: {
        backgroundColor: 'white',
        borderBottomLeftRadius: 5,
    },
    botAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#E8F0FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
        marginTop: 6,
    },
    textContainer: {
        flex: 1,
    },
    messageText: {
        fontSize: 16,
        color: '#333',
        flexShrink: 1,
    },
    userMessageText: {
        color: 'white',
    },
    audioButtonContainer: {
        marginLeft: 8,
        alignSelf: 'center',
    },
    audioButton: {
        padding: 4,
        borderRadius: 12,
    },
    inputContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        borderTopWidth: 1,
        borderTopColor: 'rgba(225, 225, 225, 0.8)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        zIndex: 1, // Ensure input sits above the FlatList
        height: 70, // Keep this the same
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 24,
        paddingVertical: 8,
        paddingHorizontal: 12,
        margin: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    input: {
        flex: 1,
        fontSize: 16,
        maxHeight: 100,
        paddingVertical: 4,
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
    wordText: {
        fontSize: 16,
        color: '#333',
    },
    userWordText: {
        color: 'white',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popupContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        width: '80%',
        maxWidth: 400,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    popupTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    popupText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    popupHint: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    popupButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    popupButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    popupButtonConfirm: {
        backgroundColor: '#3B82F6',
    },
    popupButtonCancel: {
        backgroundColor: '#f1f5f9',
    },
    popupButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    popupButtonTextConfirm: {
        color: 'white',
    },
    selectedWord: {
        backgroundColor: '#E8F0FF',
        borderRadius: 3,
        paddingHorizontal: 2,
    },
    selectedUserWord: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        color: '#3B82F6',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
        lineHeight: 24,
    },
    emptyTip: {
        fontSize: 14,
        color: '#3B82F6',
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: 20,
    },
    webWordContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
    },
    webWordRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    webWordTouchable: {
        paddingVertical: 2,
        paddingHorizontal: 1,
        borderRadius: 3,
    },
    selectedWordTouchable: {
        backgroundColor: '#E8F0FF',
        borderRadius: 3,
        paddingHorizontal: 2,
    },
    selectedUserWordTouchable: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
});