import Swiper from "react-native-deck-swiper";
import React, { useRef, useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated, Alert } from "react-native";
import { useGlobalContext } from "../context/GlobalContext";
import FirestoreService from "../app/services/FirestoreService";
import GemReward from "./GemReward";

interface FlashCard { question: string; answer: string; }
interface FlashCardDeckProps { visible: boolean; onClose: () => void; cards: FlashCard[]; }

const FlashCardDeck: React.FC<FlashCardDeckProps> = ({ visible, onClose, cards }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const swiperRef = useRef<Swiper<FlashCard>>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  // Add state to track which language is on front for each card
  const [cardLanguageOrder, setCardLanguageOrder] = useState<boolean[]>([]);
  const { awardGems, currentStreak, userId, isLoggedIn } = useGlobalContext();
  
  // Gem reward state
  const [showGemReward, setShowGemReward] = useState(false);
  const [gemsEarned, setGemsEarned] = useState(0);

  // Debug logging
  useEffect(() => {
    console.log("FlashCardDeck component rendered with:", {
      visible,
      cardsLength: cards?.length,
      cards: cards?.slice(0, 2), // Log first 2 cards for debugging
      currentCardIndex
    });
  }, [visible, cards, currentCardIndex]);

  // Early return if no cards
  if (!cards || cards.length === 0) {
    console.log("FlashCardDeck: No cards available, showing empty state");
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={[styles.card, { justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={styles.cardText}>No flashcards available</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Initialize random language order for each card when component mounts or cards change
  useEffect(() => {
    if (cards && cards.length > 0) {
      const randomOrder = cards.map(() => Math.random() > 0.5);
      setCardLanguageOrder(randomOrder);
      // Reset card index when cards change
      setCurrentCardIndex(0);
      // Reset flip state
      setIsFlipped(false);
      flipAnim.setValue(0);
    }
  }, [cards]);

  // Flip animation handler
  const flipCard = () => {
    Animated.timing(flipAnim, {
      toValue: isFlipped ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsFlipped(!isFlipped));
  };

  // Reset flip state when swiping
  const onSwiped = (index: number) => {
    setCurrentCardIndex(index + 1);
    flipAnim.setValue(0);
    setIsFlipped(false);
    
    // Check if we've reached the end of the deck
    if (index + 1 >= cards.length) {
      console.log("Reached end of deck, triggering completion");
      // Small delay to ensure the swipe animation completes
      setTimeout(() => {
        onSwipedAll();
      }, 100);
    }
  };

  // Handle completion of all cards
  const onSwipedAll = async () => {
    console.log("All flashcards completed!");
    
    // Calculate gems earned
    const gemsToAward = FirestoreService.calculateFlashcardGems(cards.length, currentStreak);
    
    try {
      if (isLoggedIn && userId) {
        // Award gems
        const result = await awardGems(gemsToAward, `Completed ${cards.length} flashcards`);
        
        // Show exciting gem reward animation
        setGemsEarned(gemsToAward);
        setShowGemReward(true);
      } else {
        // Show completion message for non-logged in users
        Alert.alert(
          "🎉 Great Job! 🎉",
          `You've completed ${cards.length} flashcards! 📚\n\nSign in to earn gems and track your progress!`,
          [
            {
              text: "Continue",
              style: "default",
              onPress: onClose
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error awarding gems:', error);
      Alert.alert(
        "🎉 Flashcards Complete! 🎉",
        `Great work completing ${cards.length} flashcards!`,
        [
          {
            text: "Continue",
            style: "default",
            onPress: onClose
          }
        ]
      );
    }
  };

  // Handle gem reward close
  const handleGemRewardClose = () => {
    setShowGemReward(false);
    onClose(); // Close the flashcard deck as well
  };

  // Front interpolation (0deg -> 180deg)
  const rotateYFront = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  // Back interpolation (180deg -> 360deg)
  const rotateYBack = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  // Opacity interpolation (front fades out, back fades in)
  const opacityFront = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const opacityBack = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" >
        <TouchableOpacity style={styles.overlay} activeOpacity={1}>
          <View style={styles.swiperContainer} pointerEvents="box-none">
            <Swiper
              key={currentCardIndex}
              ref={swiperRef}
              cards={cards}
              cardIndex={currentCardIndex}
              renderCard={(card, index) => {
                // Add safety check for card and index - but don't render anything if invalid
                if (!card || typeof index !== 'number' || index < 0 || index >= cards.length) {
                  console.warn('Invalid card or index, skipping render:', { card, index, cardsLength: cards.length });
                  return null; // Return null instead of rendering "Invalid card"
                }

                // Safety check for card properties
                if (!card.question || !card.answer) {
                  console.warn('Card missing question or answer, skipping:', card);
                  return null; // Return null instead of rendering error message
                }

                // Determine which language goes on front/back based on cardLanguageOrder
                const isFrenchOnFront = cardLanguageOrder[index] || false;
                const frontText = isFrenchOnFront ? card.answer : card.question;
                const backText = isFrenchOnFront ? card.question : card.answer;

                return (
                  <TouchableOpacity onPress={flipCard} activeOpacity={1}>
                    <View style={styles.card}>
                      {/* Front face */}
                      <Animated.View style={[
                        styles.face,
                        {
                          opacity: opacityFront,
                          transform: [{ rotateY: rotateYFront }],
                        }
                      ]}>
                        <Text style={styles.cardText}>{frontText}</Text>
                        <Text style={styles.languageIndicator}>
                          {isFrenchOnFront ? '🇫🇷' : '🇬🇧'}
                        </Text>
                      </Animated.View>

                      {/* Back face */}
                      <Animated.View style={[
                        styles.face,
                        {
                          opacity: opacityBack,
                          transform: [{ rotateY: rotateYBack }],
                        }
                      ]}>
                        <Text style={styles.cardText}>{backText}</Text>
                        <Text style={styles.languageIndicator}>
                          {isFrenchOnFront ? '🇬🇧' : '🇫🇷'}
                        </Text>
                      </Animated.View>
                    </View>
                  </TouchableOpacity>
                );
              }}
              onSwiped={onSwiped}
              onSwipedAll={() => {}} // Empty function since we handle completion in onSwiped
              backgroundColor="transparent"
              infinite={false}
              showSecondCard={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Gem Reward Modal */}
      <GemReward
        visible={showGemReward}
        gemsEarned={gemsEarned}
        onClose={handleGemRewardClose}
        reason={`Completed ${cards.length} flashcards!`}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: 300,
    height: 300,
    backgroundColor: "#f5f5f5",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignSelf: "center"
  },
  swiperContainer: {
    width: "100%",
    height: "60%",
    justifyContent: "center",
    alignItems: "center",
  },
  face: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backfaceVisibility: "hidden",
    padding: 20,
  },
  cardText: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    color: "#333",
  },
  languageIndicator: {
    position: "absolute",
    bottom: 20,
    fontSize: 20,
  },
  closeButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default FlashCardDeck;