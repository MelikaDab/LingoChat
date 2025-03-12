import Swiper from "react-native-deck-swiper";
import React, { useRef, useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";

interface FlashCard { question: string; answer: string; }
interface FlashCardDeckProps { visible: boolean; onClose: () => void; cards: FlashCard[]; }

const FlashCardDeck: React.FC<FlashCardDeckProps> = ({ visible, onClose, cards }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const swiperRef = useRef<Swiper<FlashCard>>(null);
  const [isFlipped, setIsFlipped] = useState(false); // Track flip state

  // Flip animation handler
  const flipCard = () => {
    Animated.timing(flipAnim, {
      toValue: isFlipped ? 0 : 1, // Use state instead of _value
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsFlipped(!isFlipped)); // Update state after animation
  };

  // Reset flip state when swiping
  const onSwiped = (index: number) => {
    setCurrentCardIndex(index + 1);
    flipAnim.setValue(0);
    setIsFlipped(false); // Reset flip state
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
    <Modal visible={visible} transparent animationType="slide" >
      <TouchableOpacity style={styles.overlay} activeOpacity={1}>
        <View style={styles.swiperContainer} pointerEvents="box-none">  
        <Swiper
          key={currentCardIndex} // Force re-render on card change
          ref={swiperRef}
          cards={cards}
          cardIndex={currentCardIndex}
          renderCard={(card) => (
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
                  <Text style={styles.cardText}>{card.question}</Text>
                </Animated.View>

                {/* Back face */}
                <Animated.View style={[
                  styles.face,
                  { 
                    opacity: opacityBack,
                    transform: [{ rotateY: rotateYBack }],
                  }
                ]}>
                  <Text style={styles.cardText}>{card.answer}</Text>
                </Animated.View>
              </View>
            </TouchableOpacity>
            
          )}
          onSwiped={onSwiped}
          onSwipedAll={onClose}
          backgroundColor="transparent"
        />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Darker overlay
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: 300, // Responsive width
    height: 300, // Fixed height for better proportions
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
    height: "60%", // Adjust this value as needed
    justifyContent: "center",
    alignItems: "center",
  },
  face: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backfaceVisibility: "hidden",
    padding: 20, // Add padding for text
  },
  cardText: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    color: "#333",
  },
});

export default FlashCardDeck;