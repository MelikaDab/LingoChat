import Swiper from "react-native-deck-swiper";
import React, { useRef, useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FlashCard { question: string; answer: string; }
interface FlashCardDeckProps { visible: boolean; onClose: () => void; cards: FlashCard[]; }

const FlashCardDeck: React.FC<FlashCardDeckProps> = ({ visible, onClose, cards }) => {
  const [flippedStates, setFlippedStates] = useState<boolean[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const swiperRef = useRef<Swiper<FlashCard>>(null);
  const flipAnim = useRef(new Animated.Value(0)).current;

  // Initialize flipped states
  useEffect(() => {
    setFlippedStates(new Array(cards.length).fill(false));
  }, [cards]);

  // Flip animation handler
  const flipCard = () => {
    const newFlipped = !flippedStates[currentCardIndex];
    Animated.timing(flipAnim, {
      toValue: newFlipped ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      const newFlippedStates = [...flippedStates];
      newFlippedStates[currentCardIndex] = newFlipped;
      setFlippedStates(newFlippedStates);
    });
  };

  // Reset flip state when swiping
  const onSwiped = (index: number) => {
    setCurrentCardIndex(index + 1);
    Animated.timing(flipAnim, {
      toValue: 0,
      duration: 0,
      useNativeDriver: true,
    }).start();
  };

  // Rotate animations
  const rotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const textRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <Swiper
          key={flippedStates[currentCardIndex] ? "flipped" : "not-flipped"} // Force re-render
          ref={swiperRef}
          cards={cards}
          cardIndex={currentCardIndex}
          renderCard={(card) => (
            <Animated.View style={[styles.card, { transform: [{ rotateY }] }]}>
              <TouchableOpacity onPress={flipCard} activeOpacity={1}>
                <Animated.Text style={[styles.cardText, { transform: [{ rotateY: textRotateY }] }]}>
                  {flippedStates[currentCardIndex] ? card.answer : card.question}
                </Animated.Text>
              </TouchableOpacity>
            </Animated.View>
          )}
          onSwiped={onSwiped}
          onSwipedAll={onClose}
          backgroundColor="transparent"
        />
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    flex: 1, // Ensures it takes up the center space
    height: 150,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  cardText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default FlashCardDeck;

