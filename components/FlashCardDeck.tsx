// import { Ionicons } from '@expo/vector-icons';
// import React, { useState } from 'react';
// import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import AntDesign from '@expo/vector-icons/AntDesign';

// interface FlashCard {
//   question: string;
//   answer: string;
// }

// interface FlashCardDeckProps {
//   visible: boolean;
//   onClose: () => void;
//   cards: FlashCard[];
// }

// const FlashCardDeck = ({ visible, onClose, cards }: FlashCardDeckProps) => {
//     const [currentIndex, setCurrentIndex] = useState(0);
//     const [flipped, setFlipped] = useState(false);

//     const handleNext = () => {
//         if (currentIndex < cards.length - 1) {
//             setCurrentIndex(currentIndex + 1);
//             setFlipped(false);
//         }
//     };

//     const handlePrev = () => {
//         if (currentIndex > 0) {
//             setCurrentIndex(currentIndex - 1);
//             setFlipped(false);
//         }
//     };

//     return (
//         <Modal visible={visible} animationType="slide" transparent>
//             <View style={styles.modalContainer}>
//                 <View style={styles.cardContainer}>
//                     <TouchableOpacity style={styles.closeButton} onPress={onClose}>
//                         <Ionicons name="close" size={24} color="#888" />
//                     </TouchableOpacity>
//                     <View style={styles.cardWrapper}>
//                         <TouchableOpacity style={[styles.navButton, styles.leftButton]} onPress={handlePrev} disabled={currentIndex === 0}>
//                             {/* <Text style={[styles.navButton, currentIndex === 0 && styles.disabled]}>◀</Text> */}
//                             <AntDesign name="left" size={24} color="gray" />

//                         </TouchableOpacity>
//                         <Text style={styles.cardText}>
//                         {flipped ? cards[currentIndex].answer : cards[currentIndex].question}
//                         </Text>
//                         <TouchableOpacity style={[styles.navButton, styles.rightButton]} onPress={handleNext} disabled={currentIndex === cards.length - 1}>
//                             {/* <Text style={[styles.navButton, currentIndex === cards.length - 1 && styles.disabled]}>▶</Text> */}
//                             <AntDesign name="right" size={24} color="gray" />

//                         </TouchableOpacity>
//                     </View>
                    
//                     <TouchableOpacity style={styles.flipButton} onPress={() => setFlipped(!flipped)}>
//                         <Text style={styles.buttonText}>tap to flip!</Text>
//                     </TouchableOpacity>
//                 </View>
//             </View>
//         </Modal>
//     );
// };

// const styles = StyleSheet.create({
//     modalContainer: {
//         flex: 1,
//         backgroundColor: 'rgba(0, 0, 0, 0.5)',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     cardContainer: {
//         width: 300,
//         padding: 20,
//         backgroundColor: 'white',
//         borderRadius: 15,
//         alignItems: 'center',
//     },
//     cardWrapper: {
//         flexDirection: "row", 
//         justifyContent: "center",
//         position: "relative",
//         alignItems: "center",
//         width: "100%",
//         marginVertical: 20,
//     },
//     leftButton: {
//         right: 10
//     },
//     rightButton: {
//         left: 10,
//         right: 0
//     },
//     navButton: {
//         position: "absolute",
//         top: "50%",
//         transform: [{ translateY: -15 }], // Centers vertically
//         padding: 10,
//     },    

//     cardText: {
//         fontSize: 20,
//         marginBottom: 20,
//         textAlign: 'center',
//     },
//     flipButton: {
//         backgroundColor: '#3B82F0',
//         paddingVertical: 10,
//         paddingHorizontal: 20,
//         borderRadius: 10,
//         marginBottom: 15,
//     },
//     buttonText: {
//         color: 'white',
//         fontSize: 16,
//     },
//     navButtons: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         width: '80%',
//         marginBottom: 20,
//     },
//     navButton: {
//         fontSize: 24,
//         color: 'black',
//     },
//     disabled: {
//         color: 'gray',
//     },
//     closeButton: {
//         top: 10,
//         right: 10,
//         padding: 10,
//         position: 'absolute'
//     },
// });

// export default FlashCardDeck;
import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setFlipped(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color="#888" />
          </TouchableOpacity>

          <Text style={styles.deckTitle}>Flashcards</Text>

          {/* Card Row - Keeps buttons fixed on edges */}
          <View style={styles.cardRow}>
            {/* Left Button */}
            <TouchableOpacity onPress={handlePrev} disabled={currentIndex === 0} style={styles.navButton}>
              <Ionicons name="chevron-back" size={30} color={currentIndex === 0 ? "#ccc" : "#007bff"} />
            </TouchableOpacity>

            {/* Flashcard */}
            <View style={styles.card}>
              <Text style={styles.cardText}>
                {flipped ? cards[currentIndex].answer : cards[currentIndex].question}
              </Text>
            </View>

            {/* Right Button */}
            <TouchableOpacity onPress={handleNext} disabled={currentIndex === cards.length - 1} style={styles.navButton}>
              <Ionicons name="chevron-forward" size={30} color={currentIndex === cards.length - 1 ? "#ccc" : "#007bff"} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.flipButton} onPress={() => setFlipped(!flipped)}>
            <Text style={styles.buttonText}>reveal!</Text>
          </TouchableOpacity>
        </View>
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

