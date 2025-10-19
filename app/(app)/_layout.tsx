import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="add-expense" options={{ presentation: 'modal', headerShown: true, title: 'Add Expense' }} />
      <Stack.Screen name="add-group" options={{ presentation: 'modal', headerShown: true, title: 'New Group' }} />
      <Stack.Screen name="settle-up" options={{ presentation: 'modal', headerShown: true, title: 'Settle Up' }} />
      <Stack.Screen name="friends" options={{ headerShown: true, title: 'Friends' }} />
      <Stack.Screen name="members" options={{ headerShown: true, title: 'Members' }} />
      <Stack.Screen name="select-group" options={{ headerShown: true, title: 'Select Group' }} />
      <Stack.Screen name="currency-settings" options={{ headerShown: true, title: 'Currency' }} />
      <Stack.Screen name="balance-details" options={{ headerShown: true, title: 'Balance Details' }} />
      <Stack.Screen name="group-details" options={{ headerShown: true, title: 'Group Details' }} />
    </Stack>
  );
}
