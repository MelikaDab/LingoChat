import { useRouter } from "expo-router";
import { View, Text, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignUpScreen() {
  const router = useRouter();

  const startOnboarding = async () => {
    await AsyncStorage.setItem("hasSignedUp", "true");
    router.replace("/(onboarding)/welcome"); // Navigate to onboarding
  };

  return (
    <View>
      <Text>Sign Up</Text>
      <Button title="Start Onboarding" onPress={startOnboarding} />
    </View>
  );
}
