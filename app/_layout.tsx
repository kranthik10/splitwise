import '@/global.css';
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="add-expense" options={{ presentation: 'modal', headerShown: true, title: 'Add Expense' }} />
      <Stack.Screen name="add-group" options={{ presentation: 'modal', headerShown: true, title: 'New Group' }} />
      <Stack.Screen name="settle-up" options={{ presentation: 'modal', headerShown: true, title: 'Settle Up' }} />
    </Stack>
  );
}
