import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useRouter, Slot } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, Pressable } from "react-native";
import 'react-native-reanimated';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { useColorScheme } from '@/hooks/useColorScheme';
import { GlobalProvider, useGlobalContext } from '../context/GlobalContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Add type declaration for the window property
declare global {
  interface Window {
    _inOnboardingFlow?: boolean;
  }
}

// Navigation guard to check if onboarding is complete
function NavigationGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, isOnboardingComplete, userId, onboardingData } = useGlobalContext();
  
  useEffect(() => {
    // Add some debugging
    console.log("NavigationGuard: ", { 
      isLoggedIn, 
      isOnboardingComplete, 
      pathname,
      inOnboardingFlow: window._inOnboardingFlow,
      hasName: !!onboardingData.name,
      hasProficiencyLevel: !!onboardingData.proficiencyLevel,
      hasTargetLanguage: !!onboardingData.targetLanguage
    });
    
    // If we're in the explicit onboarding flow, don't interrupt navigation
    if (window._inOnboardingFlow) {
      console.log("In onboarding flow - allowing internal navigation");
      return;
    }
    
    // Only run this if a user is logged in
    if (isLoggedIn && userId) {
      // Check if we need to redirect to onboarding
      if (!isOnboardingComplete) {
        console.log("Onboarding incomplete");
        
        // Only redirect to onboarding if we're NOT already in the onboarding flow
        // This allows navigation between onboarding screens
        if (!pathname.includes('/(onboarding)') && 
            !pathname.includes('/welcome') && 
            !pathname.includes('/LevelPage')) {
          console.log("Redirecting to onboarding from non-onboarding area");
          router.replace('/(onboarding)/welcome');
        } else {
          console.log("Already in onboarding flow, allowing internal navigation");
        }
      } else {
        // User has completed onboarding, ensure they're at the main app
        if (pathname?.includes('/(onboarding)') || 
            pathname.includes('/welcome') || 
            pathname.includes('/LevelPage')) {
          console.log("Onboarding complete, redirecting to home");
          router.replace('/(tabs)/home');
        }
      }
    } else {
      // Handle non-logged in state if needed
      console.log("User not logged in");
    }
  }, [isLoggedIn, isOnboardingComplete, userId, pathname, onboardingData]);
  
  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <GlobalProvider>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <NavigationGuard />
      <Stack screenOptions={{
        headerShown: true,
        headerTitle: "",
        headerStyle: { backgroundColor: 'white' },
        headerShadowVisible: false,
        headerLeft: () => (
          <Pressable onPress={() => router.back()} style={{ marginLeft: 10 }}>
            <MaterialIcons name="arrow-back-ios" size={24} color="#3B82F6" />
          </Pressable>
        ),
      }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
    </GlobalProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  backButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
});
