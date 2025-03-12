import React, { useState } from "react";
import { Text, View, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import FlashCardDeckList from "@/components/FlashCardDeckList";
import FlashCardDeck from "@/components/FlashCardDeck";

interface FlashCardDeckData {
  id: string;
  title: string;
  words: number;
  image?: any;
  cards: { question: string; answer: string }[];
}

// Example Flashcard Decks
const flashcardDecks: FlashCardDeckData[] = [

  {
    id: "2",
    title: "Family",
    words: 12,
    image: require("../../assets/images/family.png"),
    cards: [
      { question: "Father", answer: "Père" },
      { question: "Mother", answer: "Mère" },
    ],
  },
];

const recommendedFlashcards = [
  {
    id: "1",
    title: "Colors",
    words: 10,
    // image: require("../../assets/images/colors.png"),
    cards: [
      { question: "Red", answer: "Rouge" },
      { question: "Blue", answer: "Bleu" },
    ],
  },    
  {
    id: "3",
    title: "Animals",
    words: 15,
    // image: require("../assets/animals.png"),
    cards: [
      { question: "Dog", answer: "Chien" },
      { question: "Cat", answer: "Chat" },
    ],
  },
  {
    id: "4",
    title: "Food",
    words: 18,
    // image: require("../assets/food.png"),
    cards: [
      { question: "Apple", answer: "Pomme" },
      { question: "Bread", answer: "Pain" },
    ],
  },
];

const Home = () => {
  const [selectedDeck, setSelectedDeck] = useState<FlashCardDeckData | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  return (
    <LinearGradient
      colors={["#a2c6ff", "#FFFFFF"]}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <FlatList
        data={recommendedFlashcards}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {/* Top Bar */}
            <View style={styles.topBar}>
              <Text style={styles.gems}>💎 1230</Text>
              <Text style={styles.streak}>🔥 45</Text>
            </View>

            {/* Level Section */}
            <View style={styles.levelContainer}>
              <Text style={styles.levelTitle}>Beginner</Text>
              <TouchableOpacity>
                <Text style={styles.changeLevel}>Change Level</Text>
              </TouchableOpacity>
            </View>

            {/* Flashcard Deck */}
            <View style={styles.flashcardContainer}>
              <Text style={styles.deckTitle}>Flash Card Deck</Text>
              <Text style={styles.deckSubtitle}>les couleurs</Text>
              <Text style={styles.deckDescription}>Finish reviewing your cards!</Text>
              <TouchableOpacity onPress={() => setSelectedDeck(flashcardDecks[0])} style={styles.studyButton}>
                <Text style={styles.studyButtonText}>Continue Studying</Text>
              </TouchableOpacity>
            </View>

            {/* FlashCardList (Main Decks Section) */}
            <FlashCardDeckList flashcardDecks={flashcardDecks} setSelectedDeck={setSelectedDeck} />

            {/* Recommended Section Title */}
            <Text style={styles.recommendedTitle}>Recommended</Text>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedDeck(item)} style={styles.flashcardItem}>
            {/* {item.image && <Image source={item.image} style={styles.flashcardImage} />} */}
            {/* <FlashCardDeckList flashcardDecks={recommendedFlashcards} setSelectedDeck={setSelectedDeck} /> */}
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 100 }} // Add space at bottom
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
    padding: 20,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  gems: {
    fontSize: 18,
  },
  streak: {
    fontSize: 18,
  },
  levelContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  levelTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  changeLevel: {
    color: "blue",
    marginTop: 5,
  },
  flashcardContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  deckTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  deckSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  deckDescription: {
    fontSize: 14,
    color: "#999",
    marginVertical: 10,
  },
  studyButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  studyButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  recommendedTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  flashcardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  flashcardImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  flashcardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  flashcardWords: {
    fontSize: 14,
    color: "#666",
  },
  recommendedItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,    
  }
});

export default Home;

