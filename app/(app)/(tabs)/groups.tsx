import { Group } from '@/types';
import { storage } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function GroupsScreen() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadGroups();
    }, [])
  );

  const loadGroups = async () => {
    const groupsData = await storage.getGroups();
    setGroups(groupsData);
  };

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-16 pb-8">
        <Text className="text-sm text-primary-400 mb-2 tracking-wide uppercase font-medium">Organize</Text>
        <Text className="text-4xl font-light text-gray-900">Groups</Text>
      </View>
      
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {groups.length === 0 ? (
          <View className="bg-primary-50/50 rounded-3xl p-16 items-center border border-primary-100/50 mt-8">
            <View className="w-16 h-16 rounded-2xl bg-primary-100 items-center justify-center mb-6">
              <Ionicons name="people-outline" size={32} color="#7d9fff" />
            </View>
            <Text className="text-gray-400 text-center font-light text-base mb-8">
              Create a group to split expenses
            </Text>
            <TouchableOpacity
              className="bg-primary-600 px-8 py-3 rounded-xl"
              onPress={() => router.push('/add-group')}
            >
              <Text className="text-white font-normal text-sm">Create Group</Text>
            </TouchableOpacity>
          </View>
        ) : (
          groups.map((group, index) => (
            <TouchableOpacity
              key={group.id}
              className="bg-white rounded-2xl p-5 mb-3 border border-primary-50"
              onPress={() => router.push(`/group-details?groupId=${group.id}`)}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 rounded-xl bg-primary-100 items-center justify-center mr-4">
                    <Ionicons name={(group.icon || 'people') as any} size={20} color="#4d7cff" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-normal text-base mb-1">
                      {group.name}
                    </Text>
                    <Text className="text-primary-400 text-sm font-light">
                      {group.members.length} members
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#d6e0ff" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        className="absolute bottom-8 right-6 bg-primary-600 rounded-2xl w-14 h-14 items-center justify-center"
        style={{ 
          shadowColor: '#2d5fff',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 5,
        }}
        onPress={() => router.push('/add-group')}
      >
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}
