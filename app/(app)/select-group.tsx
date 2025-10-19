import { Group } from '@/types';
import { storage } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function SelectGroupScreen() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    const groupsData = await storage.getGroups();
    setGroups(groupsData);
  };

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-16 pb-6">
        <Text className="text-xs text-primary-400 mb-2 tracking-wider uppercase font-medium">Select</Text>
        <Text className="text-3xl font-light text-gray-900">Group</Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          className="bg-primary-600 rounded-2xl p-5 mb-3 flex-row items-center"
          onPress={() => router.push('/add-expense')}
        >
          <View className="w-12 h-12 rounded-xl bg-white/20 items-center justify-center mr-4">
            <Ionicons name="person" size={20} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-normal text-base mb-1">Personal Expense</Text>
            <Text className="text-white/70 text-sm font-light">Not in a group</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#ffffff" />
        </TouchableOpacity>

        {groups.length > 0 && (
          <>
            <View className="my-4">
              <Text className="text-xs text-primary-400 tracking-wider uppercase font-medium">Your Groups</Text>
            </View>
            {groups.map((group) => (
              <TouchableOpacity
                key={group.id}
                className="bg-white rounded-2xl p-5 mb-3 flex-row items-center border border-primary-50"
                onPress={() => router.push(`/add-expense?groupId=${group.id}`)}
              >
                <View className="w-12 h-12 rounded-xl bg-primary-100 items-center justify-center mr-4">
                  <Ionicons name={(group.icon || 'people') as any} size={20} color="#4d7cff" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-normal text-base mb-1">{group.name}</Text>
                  <Text className="text-primary-400 text-sm font-light">
                    {group.members.length} members
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color="#d6e0ff" />
              </TouchableOpacity>
            ))}
          </>
        )}

        {groups.length === 0 && (
          <View className="bg-primary-50/50 rounded-2xl p-12 items-center border border-primary-100/50 mt-4">
            <View className="w-14 h-14 rounded-xl bg-primary-100 items-center justify-center mb-4">
              <Ionicons name="people-outline" size={24} color="#7d9fff" />
            </View>
            <Text className="text-gray-400 text-center font-light text-base mb-2">
              No groups yet
            </Text>
            <Text className="text-primary-300 text-center font-light text-sm mb-6">
              Create a group to organize expenses
            </Text>
            <TouchableOpacity
              className="bg-primary-600 px-6 py-3 rounded-xl"
              onPress={() => router.push('/add-group')}
            >
              <Text className="text-white font-normal text-sm">Create Group</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
