import React from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';

const HomeScreen = () => {
  const recommendedFlashcards = [
    {
      id: '1',
      title: 'la famille',
      words: 20,
      progress: 74,
      image: require('../../assets/images/family.png'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <Text style={styles.gems}>💎 234</Text>
          <Text style={styles.streak}>🔥 12</Text>
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
          <TouchableOpacity style={styles.studyButton}>
            <Text style={styles.studyButtonText}>Continue Studying</Text>
          </TouchableOpacity>
        </View>

        {/* Recommended Section */}
        <Text style={styles.recommendedTitle}>Recommended</Text>
        <FlatList
          data={recommendedFlashcards}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.flashcardItem}>
              <Image source={item.image} style={styles.flashcardImage} />
              <View>
                <Text style={styles.flashcardTitle}>{item.title}</Text>
                <Text style={styles.flashcardWords}>{item.words} vocabulary words</Text>
              </View>
            </View>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  gems: { fontSize: 16, fontWeight: 'bold', color: '#3B82F6' },
  streak: { fontSize: 16, fontWeight: 'bold', color: '#F87171' },
  levelContainer: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  levelTitle: { fontSize: 18, fontWeight: 'bold' },
  changeLevel: { fontSize: 14, color: '#3B82F6' },
  flashcardContainer: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 10 },
  deckTitle: { fontSize: 16, color: '#555' },
  deckSubtitle: { fontSize: 18, fontWeight: 'bold' },
  deckDescription: { fontSize: 14, color: '#777' },
  studyButton: { backgroundColor: '#3B82F6', padding: 10, borderRadius: 10, marginTop: 10 },
  studyButtonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
  recommendedTitle: { fontSize: 18, fontWeight: 'bold', padding: 20 },
  flashcardItem: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: 'white', margin: 10, borderRadius: 10 },
  flashcardImage: { width: 40, height: 40, marginRight: 10 },
  flashcardTitle: { fontSize: 16, fontWeight: 'bold' },
  flashcardWords: { fontSize: 14, color: '#777' },
});

export default HomeScreen;
