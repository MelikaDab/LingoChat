import { useRouter } from "expo-router";
import { View, Text, Button } from "react-native";
export default function welcome() {

    const router = useRouter();
    return(
        <View>
            <Text>Welcome to Lingo Chat!</Text>
            <Button title="Next" onPress={() => router.push("/(onboarding)/levelpage")}></Button>
        </View>
    )
}