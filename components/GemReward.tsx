import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Modal, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GemRewardProps {
  visible: boolean;
  gemsEarned: number;
  onClose: () => void;
  reason?: string;
}

const GemReward: React.FC<GemRewardProps> = ({ visible, gemsEarned, onClose, reason = 'Great job!' }) => {
  const scaleAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const bounceAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      startAnimations();
    } else {
      resetAnimations();
    }
  }, [visible]);

  const startAnimations = () => {
    // Reset animations
    scaleAnimation.setValue(0);
    fadeAnimation.setValue(0);
    bounceAnimation.setValue(0);

    // Sequence of animations
    Animated.sequence([
      // Fade in background
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Scale up gem with bounce
      Animated.spring(scaleAnimation, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
      // Bounce effect
      Animated.spring(bounceAnimation, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto close after 3 seconds
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  const resetAnimations = () => {
    scaleAnimation.setValue(0);
    fadeAnimation.setValue(0);
    bounceAnimation.setValue(0);
  };

  const gemScale = bounceAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.15, 1],
  });

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { opacity: fadeAnimation }]}>
          
          {/* Sparkles around the gem */}
          <View style={styles.sparkleContainer}>
            <Text style={[styles.sparkle, styles.sparkle1]}>✨</Text>
            <Text style={[styles.sparkle, styles.sparkle2]}>⭐</Text>
            <Text style={[styles.sparkle, styles.sparkle3]}>✨</Text>
            <Text style={[styles.sparkle, styles.sparkle4]}>⭐</Text>
          </View>

          {/* Main gem display */}
          <Animated.View
            style={[
              styles.gemContainer,
              {
                transform: [
                  { scale: scaleAnimation },
                  { scale: gemScale },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['#E8F0FF', '#B8D4FF', '#8AC7FF']}
              style={styles.gemBackground}
            >
              <Text style={styles.gemIcon}>💎</Text>
            </LinearGradient>
          </Animated.View>

          {/* Text content */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: fadeAnimation,
                transform: [
                  {
                    translateY: fadeAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.congratsText}>🎉 Congratulations! 🎉</Text>
            <Text style={styles.reasonText}>{reason}</Text>
            <Text style={styles.gemsText}>+{gemsEarned} Gems Earned!</Text>
          </Animated.View>

          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Awesome!</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(162, 198, 255, 0.3)', // Softer blue overlay matching app theme
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 350,
    padding: 30,
    backgroundColor: 'white',
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#a2c6ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E8F0FF',
  },
  sparkleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  sparkle: {
    position: 'absolute',
    fontSize: 20,
    opacity: 0.8,
  },
  sparkle1: {
    top: '25%',
    left: '20%',
  },
  sparkle2: {
    top: '20%',
    right: '25%',
  },
  sparkle3: {
    bottom: '35%',
    left: '15%',
  },
  sparkle4: {
    bottom: '30%',
    right: '20%',
  },
  gemContainer: {
    marginBottom: 20,
  },
  gemBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#B8D4FF',
  },
  gemIcon: {
    fontSize: 45,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  congratsText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  reasonText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  gemsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6', // Using app's blue theme
    textShadowColor: 'rgba(59, 130, 246, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    backgroundColor: '#3B82F6', // Matching app's blue theme
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GemReward; 