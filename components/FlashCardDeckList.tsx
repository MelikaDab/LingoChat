import React from "react";
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet } from "react-native";

interface FlashCardDeckData {
  id: string;
  title: string;
  words: number;
  image?: any;
  cards: { question: string; answer: string }[];
}

interface FlashcardListProps {
  flashcardDecks: FlashCardDeckData[];
  setSelectedDeck: (deck: FlashCardDeckData) => void;
}
const FlashCardDeckList = ({ flashcardDecks, setSelectedDeck }: FlashcardListProps) => {

  return (
    <View style={styles.container}>
      <FlatList
        data={flashcardDecks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedDeck(item)} style={styles.flashcardItem}>
            <Image source={item.image} style={styles.flashcardImage} />
            <View>
              <Text style={styles.flashcardTitle}>{item.title}</Text>
              <Text style={styles.flashcardWords}>{item.words} words</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  flashcardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
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
    color: "#555",
  },
});

export default FlashCardDeckList;
