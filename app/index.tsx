import { authClient } from '@/lib/auth-client';
import { Redirect } from 'expo-router';

export default function Index() {
  const { data: session } = authClient.useSession();
  
  if (session) {
    return <Redirect href="/(app)/(tabs)" />;
  }
  
  return <Redirect href="/(auth)/sign-in" />;
}