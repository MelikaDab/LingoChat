import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase"; // Ensure this is correctly set up
// Required for iOS behavior with expo-auth-session
WebBrowser.maybeCompleteAuthSession();

const radius = 100;
const textItems = ["Enchante!", "Je t'aime", "Tu es tres jolie!", "Bonjour!", "Oui Oui"];
const colors = ["#3A5AE7", "#B63AE7", "#3AE78B", "#E73A3D", "#E73ACD"];

export default function SignUpScreen() {
  const router = useRouter();

  // 3) Setup Google Auth request 
  const [request, response, promptAsync] = Google.useAuthRequest({
    // You MUST replace these client IDs with your own from the Google Cloud console
    clientId: "725333115110-hsisb5lpjnt3umdmrk025f9as71174kg.apps.googleusercontent.com",
    iosClientId: "725333115110-oc8bl4eqnifkamkfshq4mk7l4t39gaue.apps.googleusercontent.com",
    androidClientId: "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com",
    // If you have a webClientId, add it here as well if needed
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      // Sign in with Firebase using the credential
      signInWithCredential(auth, credential)
        .then(async (userCredential) => {
          await AsyncStorage.setItem("hasSignedUp", "true");
          router.replace("/(onboarding)/welcome");
        })
        .catch((error) => console.error("Firebase Sign-In Error:", error));
    }
  }, [response]);

  // 5) The function to start sign-in flow
  const handleGoogleSignIn = async () => {
    // This will open the Google sign-in UI
    console.log("Starting Google Sign-In...");
    const result = await promptAsync();
    console.log("Google Sign-In Result:", result);


  };

  return (
    <LinearGradient
      colors={["#a2c6ff", "#FFFFFF"]}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <View style={styles.container}>
        <Text style={styles.heading}>LingoChat</Text>
        <Text style={styles.info}>Fluent French Starts with a Chat</Text>
        <Image
          source={require("../assets/images/sloth.png")}
          style={styles.image}
        />
        {/* {textItems.map((letter, index) => {
          const angle = (index / textItems.length) * 2 * Math.PI; // Convert to radians
          const x = radius * Math.cos(angle); // X position
          const y = radius * Math.sin(angle); // Y position
          const rotate = (angle * 180) / Math.PI + 90; // Convert radians to degrees and adjust rotation

          return (
            <Text
              key={index}
              style={[
                styles.frenchText,
                {
                  color: colors[index % colors.length],
                  transform: [
                    { translateX: x },
                    { translateY: y },
                    { rotate: `${rotate}deg` },
                  ],
                },
              ]}
            >
              {letter}
            </Text>
          );
        })} */}

        {/* Google Sign-In Button */}
        <TouchableOpacity
          style={styles.signupButton}
          onPress=
          {() => router.replace("/(onboarding)/welcome")}
        // {handleGoogleSignIn}
        // disabled={!request} // Disable if request is not yet loaded
        >
          <Text style={styles.signupButtonText}>Continue with Google</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 45,
    fontWeight: "bold",
    color: "#333",
  },
  info: {
    fontSize: 16,
    color: "#333",
  },
  signupButton: {
    width: "100%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 25,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 40,
    opacity: 0.8,
  },
  signupButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "600",
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    margin: 100,
  },
  frenchText: {
    fontSize: 15,
    position: "absolute",
  },
});
