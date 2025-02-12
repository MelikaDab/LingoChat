import { useRouter } from "expo-router";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";

export default function SignUpScreen() {
  const router = useRouter();

  const startOnboarding = async () => {
    await AsyncStorage.setItem("hasSignedUp", "true");
    router.replace("/(onboarding)/welcome"); // Navigate to onboarding
  };

  return (
      <LinearGradient
      colors={['#a2c6ff', '#FFFFFF']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
    <View style={styles.container}>
      <Text style={styles.heading}>LingoChat</Text>
      <Text style={styles.info}>Fluent French Starts with a Chat</Text>
        <Image source={require("../assets/images/sloth.png")} style={styles.image}/>
      <TouchableOpacity style={styles.signupButton} onPress={startOnboarding}>
        <Text style={styles.signupButtonText}>Continue with Google</Text>
      </TouchableOpacity>
    </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
container: {
  flex: 1,
  gap:10,
  justifyContent: "center",
  alignItems: "center",
}
,
heading: {
  fontSize: 45,
  fontWeight: "bold",
  color: "#333"
},
info: {
  fontSize: 16,
  color: "#333",
},
signupButton: {
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 40,
    opacity: 0.8,
},
signupButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
}
,
image: {
    width: 200, // Adjust size as needed
    height: 200,
    resizeMode: "contain", // or "cover"
    margin: 100
}
})
