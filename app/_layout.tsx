import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {useRouter, Slot} from 'expo-router';
import { View, ActivityIndicator } from "react-native";
import 'react-native-reanimated';
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }

    const checkOnboarding = async () => {
      const hasOnboarded = await AsyncStorage.getItem("hasOnboarded");
      if (!hasOnboarded) {
        router.replace("/signup");
      }
      setLoading(false);
    };

    checkOnboarding();
  }, [loaded]);

  if (!loaded) { // prevents rendering until fonts are loaded
    return null;
  }


  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
