import { Stack } from 'expo-router';
import React from 'react';

export default function ProfileLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="level" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="appearance" />
            <Stack.Screen name="edit" />
        </Stack>
    );
} 