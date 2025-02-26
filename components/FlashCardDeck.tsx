import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface FlashCard {
  question: string;
  answer: string;
}

interface FlashCardDeckProps {
  visible: boolean;
  onClose: () => void;
  cards: FlashCard[];
}

const FlashCardDeck = ({ visible, onClose, cards }: FlashCardDeckProps) => {
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
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalContainer}>
                <View style={styles.cardContainer}>
                    <Text style={styles.cardText}>
                        {flipped ? cards[currentIndex].answer : cards[currentIndex].question}
                    </Text>
                    <TouchableOpacity style={styles.flipButton} onPress={() => setFlipped(!flipped)}>
                        <Text style={styles.buttonText}>Flip</Text>
                    </TouchableOpacity>
                    <View style={styles.navButtons}>
                        <TouchableOpacity onPress={handlePrev} disabled={currentIndex === 0}>
                            <Text style={[styles.navButton, currentIndex === 0 && styles.disabled]}>◀</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleNext} disabled={currentIndex === cards.length - 1}>
                            <Text style={[styles.navButton, currentIndex === cards.length - 1 && styles.disabled]}>▶</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContainer: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 15,
        alignItems: 'center',
    },
    cardText: {
        fontSize: 20,
        marginBottom: 20,
        textAlign: 'center',
    },
    flipButton: {
        backgroundColor: 'blue',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 15,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    navButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginBottom: 20,
    },
    navButton: {
        fontSize: 24,
        color: 'black',
    },
    disabled: {
        color: 'gray',
    },
    closeButton: {
        backgroundColor: 'red',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
});

export default FlashCardDeck;
