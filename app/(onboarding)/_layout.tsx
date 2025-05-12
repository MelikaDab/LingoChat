import { Stack } from 'expo-router';
import React from 'react';

// Add this to declare the custom property on the window object
declare global {
  interface Window {
    _inOnboardingFlow?: boolean;
  }
}

export default function OnboardingLayout() {
  // This flag will prevent the NavigationGuard from interfering with internal onboarding navigation
  React.useEffect(() => {
    // Set a flag to indicate we're in the onboarding flow
    window._inOnboardingFlow = true;
    
    return () => {
      // Clean up when unmounting
      window._inOnboardingFlow = false;
    };
  }, []);
  
  return (
    <Stack
      screenOptions={{
        headerShown: false, // This completely removes the header
        animation: 'slide_from_right', // Add explicit animation
      }}
    >
      {/* Your onboarding screens */}
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="LevelPage" />
      {/* Any other onboarding screens */}
    </Stack>
  );
}
