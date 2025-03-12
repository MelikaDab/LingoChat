import { Stack } from 'expo-router';
import React from 'react';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // This completely removes the header
      }}
    >
      {/* Your onboarding screens */}
      <Stack.Screen name="welcome" />
      <Stack.Screen name="LevelPage" />
      {/* Any other onboarding screens */}
    </Stack>
  );
}
