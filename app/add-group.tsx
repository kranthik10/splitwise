import { Friend, Group, User } from '@/types';
import { storage } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const GROUP_ICONS = [
  { id: 'home', icon: 'home', label: 'Home' },
  { id: 'airplane', icon: 'airplane', label: 'Trip' },
  { id: 'car', icon: 'car', label: 'Travel' },
  { id: 'restaurant', icon: 'restaurant', label: 'Food' },
  { id: 'beer', icon: 'beer', label: 'Party' },
  { id: 'heart', icon: 'heart', label: 'Family' },
  { id: 'briefcase', icon: 'briefcase', label: 'Work' },
  { id: 'gift', icon: 'gift', label: 'Event' },
];

export default function AddGroupScreen() {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('home');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [customMembers, setCustomMembers] = useState<User[]>([]);
  const [newMemberName, setNewMemberName] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadFriends();
    }, [])
  );

  const loadFriends = async () => {
    const friendsData = await storage.getFriends();
    setFriends(friendsData);
  };

  const toggleFriend = (friendId: string) => {
    const newSelected = new Set(selectedFriends);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
    } else {
      newSelected.add(friendId);
    }
    setSelectedFriends(newSelected);
  };

  const addCustomMember = () => {
    const trimmedName = newMemberName.trim();
    if (!trimmedName) return;

    const newMember: User = {
      id: `custom-${Date.now()}`,
      name: trimmedName,
      email: '',
    };

    setCustomMembers([...customMembers, newMember]);
    setNewMemberName('');
  };

  const removeCustomMember = (memberId: string) => {
    setCustomMembers(customMembers.filter(m => m.id !== memberId));
  };

  const createGroup = async () => {
    const trimmedName = groupName.trim();
    
    if (!trimmedName) {
      Alert.alert('Missing Information', 'Please enter a group name');
      return;
    }
    
    if (selectedFriends.size === 0 && customMembers.length === 0) {
      Alert.alert('Missing Information', 'Please add at least one member');
      return;
    }

    const selectedMembers = friends.filter(f => selectedFriends.has(f.id));

    const newGroup: Group = {
      id: Date.now().toString(),
      name: trimmedName,
      icon: selectedIcon,
      members: [
        { id: 'current-user', name: 'You', email: 'you@splitwise.app' },
        ...selectedMembers,
        ...customMembers,
      ],
      createdAt: new Date().toISOString(),
    };

    const groups = await storage.getGroups();
    await storage.setGroups([...groups, newGroup]);

    router.back();
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
        <View className="mb-6">
          <Text className="text-xs text-primary-400 mb-2 tracking-wider uppercase font-medium">Group Name</Text>
          <TextInput
            className="border border-primary-100 rounded-xl px-4 py-4 text-gray-900 font-light text-base"
            placeholder="e.g. Trip to Paris"
            placeholderTextColor="#b3c7ff"
            value={groupName}
            onChangeText={setGroupName}
            autoCapitalize="words"
          />
        </View>

        <View className="mb-6">
          <Text className="text-xs text-primary-400 mb-3 tracking-wider uppercase font-medium">Icon</Text>
          <View className="flex-row flex-wrap gap-2">
            {GROUP_ICONS.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => setSelectedIcon(item.id)}
                className={`w-16 h-16 rounded-xl items-center justify-center ${
                  selectedIcon === item.id ? 'bg-primary-600' : 'bg-primary-100'
                }`}
              >
                <Ionicons 
                  name={item.icon as any} 
                  size={24} 
                  color={selectedIcon === item.id ? '#ffffff' : '#4d7cff'} 
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-xs text-primary-400 mb-3 tracking-wider uppercase font-medium">Add Members</Text>
          
          <View className="mb-4">
            <View className="flex-row items-center gap-2">
              <TextInput
                className="flex-1 border border-primary-100 rounded-xl px-4 py-3 text-gray-900 font-light text-base"
                placeholder="Enter name"
                placeholderTextColor="#b3c7ff"
                value={newMemberName}
                onChangeText={setNewMemberName}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={addCustomMember}
              />
              <TouchableOpacity
                onPress={addCustomMember}
                className="bg-primary-600 rounded-xl w-12 h-12 items-center justify-center"
              >
                <Ionicons name="add" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>

          {customMembers.length > 0 && (
            <View className="mb-4">
              {customMembers.map((member) => (
                <View
                  key={member.id}
                  className="flex-row items-center justify-between py-3 px-4 bg-primary-50 rounded-xl mb-2"
                >
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 rounded-lg bg-primary-200 items-center justify-center mr-3">
                      <Text className="text-primary-700 font-medium text-sm">
                        {member.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text className="text-gray-900 font-light">{member.name}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeCustomMember(member.id)}>
                    <Ionicons name="close-circle" size={20} color="#b3c7ff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {friends.length > 0 && (
            <>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-xs text-primary-400 tracking-wider uppercase font-medium">
                  From Your Friends
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/friends')}
                  className="px-3 py-1.5 rounded-lg bg-primary-100"
                >
                  <Text className="text-primary-600 text-xs font-medium">Manage →</Text>
                </TouchableOpacity>
              </View>
              <View className="bg-white rounded-xl border border-primary-50 overflow-hidden">
                {friends.map((friend, index) => (
                  <TouchableOpacity
                    key={friend.id}
                    className={`flex-row items-center justify-between py-4 px-4 ${
                      index !== friends.length - 1 ? 'border-b border-primary-50' : ''
                    }`}
                    onPress={() => toggleFriend(friend.id)}
                  >
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 rounded-xl bg-primary-100 items-center justify-center mr-3">
                        <Text className="text-primary-600 font-medium text-sm">
                          {friend.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <Text className="text-gray-900 font-light">{friend.name}</Text>
                    </View>
                    <View className={`w-5 h-5 rounded-lg items-center justify-center ${
                      selectedFriends.has(friend.id) ? 'bg-primary-600' : 'border border-primary-200'
                    }`}>
                      {selectedFriends.has(friend.id) && (
                        <Ionicons name="checkmark" size={14} color="#ffffff" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {friends.length === 0 && customMembers.length === 0 && (
            <View className="bg-primary-50/50 rounded-2xl p-8 items-center border border-primary-100/50">
              <Ionicons name="person-add-outline" size={32} color="#b3c7ff" />
              <Text className="text-primary-400 text-center font-light text-sm mt-3 mb-4">
                Add friends to quickly select them for groups
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/friends')}
                className="px-4 py-2 rounded-lg bg-primary-600"
              >
                <Text className="text-white text-sm font-medium">Add Friends</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="bg-white px-6 py-4 border-t border-primary-50">
        <TouchableOpacity
          className="bg-primary-600 rounded-xl py-4 items-center"
          onPress={createGroup}
        >
          <Text className="text-white font-normal text-base">Create Group</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
