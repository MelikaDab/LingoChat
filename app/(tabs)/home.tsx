import React, { useState, useEffect, useCallback } from "react";
import { Text, View, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import FlashCardDeckList from "@/components/FlashCardDeckList";
import FlashCardDeck from "@/components/FlashCardDeck";
import { useGlobalContext } from "../../context/GlobalContext";
import FirestoreService, { Flashcard } from "../services/FirestoreService";

interface FlashCardDeckData {
  id: string;
  title: string;
  words: number;
  image?: any;
  cards: { question: string; answer: string }[];
}


const recommendedFlashcards: FlashCardDeckData[] = [
  {
    id: "1",
    title: "les couleurs",
    words: 2,
    // image: require("../../assets/images/colors.png"),
    cards: [
      { question: "Red", answer: "Rouge" },
      { question: "Blue", answer: "Bleu" },
    ],
  },
  {
    id: "2",
    title: "la famille",
    words: 2,
    image: require("../../assets/images/family.png"),
    cards: [
      { question: "Father", answer: "Père" },
      { question: "Mother", answer: "Mère" },
    ],
  },
  {
    id: "3",
    title: "Animals",
    words: 2,
    // image: require("../assets/animals.png"),
    cards: [
      { question: "Dog", answer: "Chien" },
      { question: "Cat", answer: "Chat" },
    ],
  },
  {
    id: "4",
    title: "Food",
    words: 2,
    // image: require("../assets/food.png"),
    cards: [
      { question: "Apple", answer: "Pomme" },
      { question: "Bread", answer: "Pain" },
    ],
  },
];

const Home = () => {
  const [selectedDeck, setSelectedDeck] = useState<FlashCardDeckData | null>(null);
  const [myFlashcards, setMyFlashcards] = useState<Flashcard[]>([]);
  const [isLoadingFlashcards, setIsLoadingFlashcards] = useState(false);
  const [localFlashcards, setLocalFlashcards] = useState<any[]>([]);
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { userId, isLoggedIn } = useGlobalContext();

  // Function to load flashcards
  const loadFlashcards = useCallback(async () => {
    console.log("Loading flashcards on tab focus");
    setIsLoadingFlashcards(true);
    
    try {
      // Check for locally stored flashcards
      try {
        const storedCards = localStorage.getItem('lingochat_flashcards');
        if (storedCards) {
          const parsedCards = JSON.parse(storedCards);
          setLocalFlashcards(parsedCards);
          console.log("Loaded local flashcards:", parsedCards.length);
        }
      } catch (e) {
        console.log("Error loading from localStorage:", e);
      }
      
      // If user is logged in, try to fetch from Firebase
      if (isLoggedIn && userId) {
        const firebaseCards = await FirestoreService.getFlashcards(userId);
        setMyFlashcards(firebaseCards);
        console.log("Loaded Firebase flashcards:", firebaseCards.length);
      }
    } catch (error) {
      console.error("Error loading flashcards:", error);
      
      // Show error only if Firebase load fails but we're logged in
      if (isLoggedIn && userId) {
        Alert.alert(
          "Error", 
          "Failed to load your flashcards. Check your connection and try again."
        );
      }
    } finally {
      setIsLoadingFlashcards(false);
    }
  }, [userId, isLoggedIn]);
  
  // Refresh flashcards when the tab comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFlashcards();
    }, [loadFlashcards])
  );
  
  // Initial load
  useEffect(() => {
    loadFlashcards();
  }, [loadFlashcards]);
  
  // Function to prepare flashcards for the deck component
  const prepareFlashcardDeck = () => {
    // Prefer Firebase flashcards, fall back to local if empty
    const cards = myFlashcards.length > 0 
      ? myFlashcards.map(card => ({ question: card.english, answer: card.french }))
      : localFlashcards.map(card => ({ question: card.english, answer: card.french }));
    
    // Create a deck for review
    const reviewDeck: FlashCardDeckData = {
      id: "my-flashcards",
      title: "My Flashcards",
      words: cards.length,
      cards: cards
    };
    
    return reviewDeck;
  };
  
  // Count of available cards for review
  const totalFlashcards = myFlashcards.length > 0 ? myFlashcards.length : localFlashcards.length;
  const hasFlashcards = totalFlashcards > 0;
  
  // Handle review button press
  const handleReviewPress = () => {
    if (!hasFlashcards) {
      Alert.alert(
        "No Flashcards", 
        "You haven't created any flashcards yet. Go to the chat and tap on words to create flashcards."
      );
      return;
    }
    
    // Set the selected deck for review
    setSelectedDeck(prepareFlashcardDeck());
  };

  return (
    <LinearGradient
      colors={["#a2c6ff", "#FFFFFF"]}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      {/* Header */}
      <View style={[
        styles.header,
        { paddingTop: insets.top + 16 } // Add safe area top inset to padding
      ]}>
        <Text style={styles.headerTitle}>LingoChat</Text>
      </View>

      <FlatList
        data={[{ id: 'dummy' }]}
        keyExtractor={(item) => item.id}
        style={styles.flatList}
        ListHeaderComponent={
          <>
            {/* Stats Bar */}
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
                <Text style={styles.statValue}>📚 A1</Text>
                <Text style={styles.statLabel}>Level</Text>
              </View>
            </View>

            {/* Current Deck Section - Now "Review my Flashcards" */}
            <View style={styles.currentDeckContainer}>
              <View style={styles.currentDeckHeader}>
                <Text style={styles.currentDeckTitle}>Review my Flashcards</Text>
                <TouchableOpacity>
                  <MaterialIcons name="more-horiz" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.deckCardContainer}>
                <View style={styles.deckInfoContainer}>
                  <Text style={styles.deckTitle}>My Flashcards</Text>
                  {isLoadingFlashcards ? (
                    <ActivityIndicator size="small" color="#3B82F6" style={{marginVertical: 10}} />
                  ) : (
                    <>
                      <Text style={styles.deckProgress}>
                        {hasFlashcards 
                          ? `${totalFlashcards} cards available for review` 
                          : "No flashcards created yet"}
                      </Text>
                      {hasFlashcards && (
                        <View style={styles.progressBar}>
                          <View style={[styles.progressFill, { width: "100%" }]} />
                        </View>
                      )}
                    </>
                  )}
                </View>
                
                <TouchableOpacity 
                  onPress={handleReviewPress} 
                  style={[
                    styles.studyButton,
                    !hasFlashcards && styles.disabledButton
                  ]}
                  disabled={isLoadingFlashcards || !hasFlashcards}
                >
                  {isLoadingFlashcards ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.studyButtonText}>
                        {hasFlashcards ? 'Review Now' : 'No Cards'}
                      </Text>
                      {hasFlashcards && <MaterialIcons name="arrow-forward" size={18} color="#fff" />}
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Recommended Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recommended</Text>
              <TouchableOpacity>
                <Text style={styles.sectionAction}>See All</Text>
              </TouchableOpacity>
            </View>
            
            {/* Recommended Decks */}
            <View style={styles.recommendedDecksGrid}>
              {recommendedFlashcards.map((deck) => (
                <TouchableOpacity 
                  key={deck.id} 
                  style={styles.deckCard}
                  onPress={() => setSelectedDeck(deck)}
                >
                  <View style={styles.deckIconContainer}>
                    <Text style={styles.deckIcon}>
                      {deck.title.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.deckCardTitle}>{deck.title}</Text>
                  <Text style={styles.deckCardCount}>{deck.words} words</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Practice Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Daily Practice</Text>
            </View>
            
            <TouchableOpacity style={styles.practiceCard}>
              <View style={styles.practiceIconContainer}>
                <MaterialIcons name="mic" size={24} color="#3B82F6" />
              </View>
              <View style={styles.practiceContent}>
                <Text style={styles.practiceTitle}>Speaking Practice</Text>
                <Text style={styles.practiceSubtitle}>Improve your pronunciation</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.practiceCard}>
              <View style={styles.practiceIconContainer}>
                <MaterialIcons name="headset" size={24} color="#3B82F6" />
              </View>
              <View style={styles.practiceContent}>
                <Text style={styles.practiceTitle}>Listening Exercise</Text>
                <Text style={styles.practiceSubtitle}>Train your comprehension</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
          </>
        }
        renderItem={() => null}
        contentContainerStyle={[
          styles.flatListContent,
          { paddingBottom: tabBarHeight + 20 } // Add space at bottom for tab bar
        ]}
      />

      {/* FlashCardDeck Modal */}
      {selectedDeck && (
        <FlashCardDeck visible={true} onClose={() => setSelectedDeck(null)} cards={selectedDeck.cards} />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
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
  flatList: {
    flex: 1,
  },
  flatListContent: {
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  currentDeckContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  currentDeckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentDeckTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  deckCardContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  deckInfoContainer: {
    marginBottom: 16,
  },
  deckTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  deckProgress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e1e1e1',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  studyButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginRight: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionAction: {
    color: '#3B82F6',
    fontSize: 14,
  },
  recommendedDecksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  deckCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  deckIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  deckIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  deckCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  deckCardCount: {
    fontSize: 12,
    color: '#666',
  },
  practiceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  },
  practiceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  practiceContent: {
    flex: 1,
  },
  practiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  practiceSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  disabledButton: {
    backgroundColor: '#A7C7FF',
    opacity: 0.7,
  },
});

export default Home;

