import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => {
    const signUpResponse = await authClient.signUp.email({
      email,
      password,
      name,
    });
    if (signUpResponse.error) {
      Alert.alert("Error", signUpResponse.error.message);
      return;
    }
  };

  return (
    <ScrollView 
      contentInsetAdjustmentBehavior="automatic"
      className="flex-1 bg-white"
    >
      <View className="px-6 pt-16 pb-8">
        <Text className="text-4xl font-light text-gray-900 mb-2">Create account</Text>
        <Text className="text-primary-400 text-base font-light">Sign up to get started</Text>
      </View>

      <View className="px-6">
        <View className="mb-6">
          <Text className="text-xs text-primary-400 mb-2 tracking-wider uppercase font-medium">Name</Text>
          <TextInput
            placeholder="Your name"
            value={name}
            onChangeText={setName}
            className="border border-primary-100 rounded-xl px-4 py-4 text-gray-900 font-light text-base"
            placeholderTextColor="#b3c7ff"
          />
        </View>

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
            placeholder="Choose a password"
            value={password}
            onChangeText={setPassword}
            className="border border-primary-100 rounded-xl px-4 py-4 text-gray-900 font-light text-base"
            placeholderTextColor="#b3c7ff"
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          className="bg-primary-600 rounded-xl py-4 items-center mb-6"
          onPress={handleSignUp}
        >
          <Text className="text-white font-normal text-base">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
