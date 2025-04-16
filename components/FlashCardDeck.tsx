import Swiper from "react-native-deck-swiper";
import React, { useRef, useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";

interface FlashCard { question: string; answer: string; }
interface FlashCardDeckProps { visible: boolean; onClose: () => void; cards: FlashCard[]; }

const FlashCardDeck: React.FC<FlashCardDeckProps> = ({ visible, onClose, cards }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const swiperRef = useRef<Swiper<FlashCard>>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  // Add state to track which language is on front for each card
  const [cardLanguageOrder, setCardLanguageOrder] = useState<boolean[]>([]);

  // Initialize random language order for each card when component mounts or cards change
  useEffect(() => {
    const randomOrder = cards.map(() => Math.random() > 0.5);
    setCardLanguageOrder(randomOrder);
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
            key={currentCardIndex}
            ref={swiperRef}
            cards={cards}
            cardIndex={currentCardIndex}
            renderCard={(card, index) => {
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
});

export default FlashCardDeck;