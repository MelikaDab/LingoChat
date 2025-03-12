import Swiper from "react-native-deck-swiper";
// export default FlashCardDeck;
import React, { useRef, useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FlashCard {
  question: string;
  answer: string;
}

interface FlashCardDeckProps {
  visible: boolean;
  onClose: () => void;
  cards: FlashCard[];
}

const FlashCardDeck: React.FC<FlashCardDeckProps> = ({ visible, onClose, cards }) => {
  const [modalOpen, setModalOpen] = useState(visible)
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const handleModalOpen = () => {
    setModalOpen(false)
  }

  // Flip animation handler
  const flipCard = () => {
    Animated.timing(flipAnim, {
      toValue: flipped ? 0 : 1, // Toggle between 0 and 1
      duration: 300,
      useNativeDriver: true,
    }).start(() => setFlipped(!flipped));
  };

  // Reset flip state when swiping
  const resetFlip = () => {
    setFlipped(false);
    Animated.timing(flipAnim, {
      toValue: 0,
      duration: 0,
      useNativeDriver: true,
    }).start();
  };

  // Rotate animation - only the card flips, NOT the text
  const rotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"], // Smooth flip
  });


  return (
    <Modal visible={modalOpen} transparent animationType="slide">
      <View style={styles.overlay}>
        <Swiper
          cards={cards}
          renderCard={(card) => (
            
            <Animated.View style={[styles.card, { transform: [{ rotateY }] }]}>
              <TouchableOpacity onPress={flipCard} activeOpacity={1} style={styles.modalContainer}>
                {/* Front Side */}
                {!flipped && (
                  <View style={styles.card}>
                    <Text style={styles.cardText}>{card.question}</Text>
                  </View>
                )}

                {/* Back Side */}
                {flipped && (
                  <View style={[styles.card, styles.card]}>
                    <Text style={styles.cardText}>{card.answer}</Text>
                  </View>
                )}
            </TouchableOpacity>
            </Animated.View>              
          )}
          onSwiped={resetFlip}
          onTapCard={(cardIndex) => (
            <View style={styles.card}>
              <Text style={styles.cardText}>{cards[cardIndex].answer}</Text>
            </View>)}
          onSwipedAll={() => handleModalOpen()}
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
  modalContainer: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 10,
  },
  deckTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Keeps buttons on edges
    width: "100%",
    marginVertical: 20,
  },
  navButton: {
    width: 40, // Ensures fixed width, doesn't move
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
  flipButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default FlashCardDeck;

