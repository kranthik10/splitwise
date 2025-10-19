import { authClient } from "@/lib/auth-client";
import { Link } from "expo-router";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const signInResponse = await authClient.signIn.email({
      email,
      password,
    });
    if (signInResponse.error) {
      Alert.alert("Error", signInResponse.error.message);
      return;
    }
  };

  return (
    <ScrollView 
      contentInsetAdjustmentBehavior="automatic"
      className="flex-1 bg-white"
    >
      <View className="px-6 pt-16 pb-8">
        <Text className="text-4xl font-light text-gray-900 mb-2">Welcome back</Text>
        <Text className="text-primary-400 text-base font-light">Sign in to continue</Text>
      </View>

      <View className="px-6">
        <View className="mb-6">
          <Text className="text-xs text-primary-400 mb-2 tracking-wider uppercase font-medium">Email</Text>
          <TextInput
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            inputMode="email"
            autoCapitalize="none"
            className="border border-primary-100 rounded-xl px-4 py-4 text-gray-900 font-light text-base"
            placeholderTextColor="#b3c7ff"
          />
        </View>

        <View className="mb-8">
          <Text className="text-xs text-primary-400 mb-2 tracking-wider uppercase font-medium">Password</Text>
          <TextInput
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            className="border border-primary-100 rounded-xl px-4 py-4 text-gray-900 font-light text-base"
            placeholderTextColor="#b3c7ff"
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          className="bg-primary-600 rounded-xl py-4 items-center mb-6"
          onPress={handleLogin}
        >
          <Text className="text-white font-normal text-base">Sign In</Text>
        </TouchableOpacity>

        <View className="flex-row items-center justify-center">
          <Text className="text-gray-600 text-sm font-light">Don't have an account? </Text>
          <Link href="/(auth)/sign-up">
            <Text className="text-primary-600 text-sm font-medium">Sign Up</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
