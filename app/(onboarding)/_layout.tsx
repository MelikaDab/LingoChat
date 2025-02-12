import { Slot } from "expo-router";
import { View } from "react-native";

export default function OnboardingLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Slot /> {/* Renders the current onboarding step */}
    </View>
  );
}
