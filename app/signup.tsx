import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../firebase";
import { dbService } from "../services/db";
import { makeRedirectUri } from "expo-auth-session";

// Required for iOS behavior with expo-auth-session
WebBrowser.maybeCompleteAuthSession();

export default function SignUp() {
  const [loading, setLoading] = useState(false);

  const redirectUri = makeRedirectUri({
    scheme: "myapp",
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    // Your Google OAuth client IDs
    clientId:
      "725333115110-hsisb5lpjnt3umdmrk025f9as71174kg.apps.googleusercontent.com",
    iosClientId:
      "725333115110-oc8bl4eqnifkamkfshq4mk7l4t39gaue.apps.googleusercontent.com",
    androidClientId:
      "725333115110-hsisb5lpjnt3umdmrk025f9as71174kg.apps.googleusercontent.com",
    // Add the redirectUri explicitly
    redirectUri,
    // This is the key part - make sure we request an ID token
    responseType: "id_token",
    // Ensures we get the user profile info we need
    scopes: ["profile", "email"],
  });

  // Log the redirect URI that Expo is using
  useEffect(() => {
    console.log("============================================");
    console.log("REDIRECT URI:", redirectUri);
    console.log("============================================");
  }, []);
  
  // Log when component mounts
  useEffect(() => {
    console.log("SignUp component mounted");
  }, []);

  // Log when request is available
  useEffect(() => {
    console.log("Google request available:", !!request);
    if (request) {
      console.log("Request details:", {
        url: request.url,
        redirectUri: request.redirectUri,
        codeVerifier: request.codeVerifier ? "exists" : "missing",
        clientId: request.clientId,
      });
    }
  }, [request]);

  useEffect(() => {
    console.log("Response type:", response?.type);
    if (response?.type === "success") {
      console.log("Google sign-in successful, getting token");
      console.log("Response params:", response.params);
      setLoading(true);
      
      const { id_token } = response.params;
      
      if (!id_token) {
        console.error("No ID token in response");
        Alert.alert(
          "Error",
          "No authentication token received. Please try again."
        );
        setLoading(false);
        return;
      }
      
      const credential = GoogleAuthProvider.credential(id_token);
      
      // Sign in with Firebase using the credential
      signInWithCredential(auth, credential)
        .then(async (userCredential) => {
          console.log("Firebase sign-in successful, creating user profile");
          // Create user profile in Firestore
          await dbService.createUserProfile(userCredential.user.uid, {
            email: userCredential.user.email || "",
            displayName: userCredential.user.displayName || undefined,
            photoURL: userCredential.user.photoURL || undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          
          console.log("User profile created, navigating to home");
          router.replace("/(tabs)/home");
        })
        .catch((error) => {
          console.error("Firebase Sign-In Error:", error.code, error.message);
          Alert.alert(
            "Error",
            "Failed to sign in with Google. Please try again."
          );
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (response?.type === "error") {
      console.error("Google Sign-In Error:", response.error);
      Alert.alert(
        "Error",
        `Failed to sign in with Google: ${
          response.error?.message || "Unknown error"
        }`
      );
    }
  }, [response]);

  const handleGoogleSignIn = async () => {
    console.log("Starting Google sign-in");
    try {
      setLoading(true);
      const result = await promptAsync();
      console.log("Prompt result:", result);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      Alert.alert("Error", "Failed to start Google sign in. Please try again.");
    } finally {
      // Only set loading to false if the response wasn't success
      // Otherwise let the response handler handle it
      if (response?.type !== "success") {
        setLoading(false);
      }
    }
  };

  return (
    <LinearGradient
      colors={["#a2c6ff", "#FFFFFF"]}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <View style={styles.content}>
        <Text style={styles.heading}>LingoChat</Text>
        <Text style={styles.info}>Fluent French Starts with a Chat</Text>
        <Image
          source={require("../assets/images/sloth.png")}
          style={styles.image}
        />

        <TouchableOpacity
          style={[styles.signupButton, loading && styles.buttonDisabled]}
          onPress={handleGoogleSignIn}
          disabled={!request || loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.signupButtonText}>Continue with Google</Text>
          )}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
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
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 25,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 40,
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.5,
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
});
