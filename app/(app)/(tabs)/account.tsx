import { authClient } from '@/lib/auth-client';
import { User } from '@/types';
import { storage } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function AccountScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const { data: session } = authClient.useSession();

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  const loadUser = async () => {
    let userData = await storage.getUser();
    if (!userData && session?.user) {
      userData = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      };
      await storage.setUser(userData);
    } else if (!userData) {
      userData = {
        id: 'current-user',
        name: 'You',
        email: 'you@splitwise.app',
      };
      await storage.setUser(userData);
    }
    setUser(userData);
  };

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-16 pb-12 items-center">
          <View className="w-24 h-24 rounded-2xl bg-primary-600 items-center justify-center mb-6">
            <Text className="text-white text-4xl font-light">
              {user?.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text className="text-2xl font-light text-gray-900 mb-2">{user?.name}</Text>
          <Text className="text-primary-400 text-sm font-light">{user?.email}</Text>
        </View>

        <View className="px-6 pb-6">
          <TouchableOpacity 
            className="bg-white rounded-2xl p-5 mb-3 flex-row items-center justify-between border border-primary-50"
            onPress={() => router.push('/currency-settings' as any)}
          >
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 rounded-xl bg-primary-100 items-center justify-center mr-4">
                <Ionicons name="cash-outline" size={20} color="#4d7cff" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-normal text-base mb-1">Currency</Text>
                <Text className="text-primary-400 text-xs font-light">
                  {user?.currency || 'USD'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#d6e0ff" />
          </TouchableOpacity>

          <TouchableOpacity className="bg-white rounded-2xl p-5 mb-3 flex-row items-center justify-between border border-primary-50">
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 rounded-xl bg-primary-100 items-center justify-center mr-4">
                <Ionicons name="settings-outline" size={20} color="#4d7cff" />
              </View>
              <Text className="text-gray-900 font-normal text-base">Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#d6e0ff" />
          </TouchableOpacity>

          <TouchableOpacity className="bg-white rounded-2xl p-5 mb-3 flex-row items-center justify-between border border-primary-50">
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 rounded-xl bg-primary-100 items-center justify-center mr-4">
                <Ionicons name="help-circle-outline" size={20} color="#4d7cff" />
              </View>
              <Text className="text-gray-900 font-normal text-base">Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#d6e0ff" />
          </TouchableOpacity>

          <TouchableOpacity className="bg-white rounded-2xl p-5 mb-3 flex-row items-center justify-between border border-primary-50">
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 rounded-xl bg-primary-100 items-center justify-center mr-4">
                <Ionicons name="information-circle-outline" size={20} color="#4d7cff" />
              </View>
              <Text className="text-gray-900 font-normal text-base">About</Text>
            </View>
            <View className="bg-gray-100 p-2 rounded-full">
              <Ionicons name="arrow-forward" size={18} color="#6b7280" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-red-50 rounded-2xl p-5 mb-3 flex-row items-center justify-between border border-red-200 mt-6"
            onPress={handleSignOut}
          >
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 rounded-xl bg-red-100 items-center justify-center mr-4">
                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              </View>
              <Text className="text-red-600 font-normal text-base">Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
