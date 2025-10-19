import '@/global.css';
import { authClient } from "@/lib/auth-client";
import { Stack } from "expo-router";

export default function RootLayout() {
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
