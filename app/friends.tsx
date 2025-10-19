import { Friend } from '@/types';
import { storage } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function FriendsScreen() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    const friendsData = await storage.getFriends();
    setFriends(friendsData);
  };

  const addFriend = async () => {
    const trimmedName = newFriendName.trim();
    const trimmedEmail = newFriendEmail.trim();

    if (!trimmedName) {
      Alert.alert('Missing Name', 'Please enter a friend\'s name');
      return;
    }

    // Check if friend already exists
    const exists = friends.some(f => 
      f.name.toLowerCase() === trimmedName.toLowerCase() ||
      (trimmedEmail && f.email.toLowerCase() === trimmedEmail.toLowerCase())
    );

    if (exists) {
      Alert.alert('Already Exists', 'This friend is already in your list');
      return;
    }

    const newFriend: Friend = {
      id: Date.now().toString(),
      name: trimmedName,
      email: trimmedEmail || `${trimmedName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      balance: 0,
    };

    const updatedFriends = [...friends, newFriend];
    await storage.setFriends(updatedFriends);
    setFriends(updatedFriends);
    setNewFriendName('');
    setNewFriendEmail('');
    setIsAdding(false);
  };

  const removeFriend = async (friendId: string) => {
    Alert.alert(
      'Remove Friend',
      'Are you sure? They will be removed from all groups.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updatedFriends = friends.filter(f => f.id !== friendId);
            await storage.setFriends(updatedFriends);
            
            // Remove from groups
            const groups = await storage.getGroups();
            const updatedGroups = groups.map(group => ({
              ...group,
              members: group.members.filter(m => m.id !== friendId),
            }));
            await storage.setGroups(updatedGroups);
            
            setFriends(updatedFriends);
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-16 pb-6">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-xl bg-primary-100 items-center justify-center mr-3"
          >
            <Ionicons name="arrow-back" size={20} color="#4d7cff" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xs text-primary-400 tracking-wider uppercase font-medium">Your</Text>
            <Text className="text-2xl font-light text-gray-900">Friends</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setIsAdding(!isAdding)}
            className={`w-10 h-10 rounded-xl items-center justify-center ${
              isAdding ? 'bg-gray-100' : 'bg-primary-600'
            }`}
          >
            <Ionicons 
              name={isAdding ? 'close' : 'person-add'} 
              size={20} 
              color={isAdding ? '#6b7280' : '#ffffff'} 
            />
          </TouchableOpacity>
        </View>

        {/* Add Friend Form */}
        {isAdding && (
          <View className="bg-primary-50 rounded-2xl p-5 mb-6 border border-primary-100">
            <Text className="text-primary-700 font-medium text-sm mb-4">Add New Friend</Text>
            <TextInput
              className="bg-white border border-primary-100 rounded-xl px-4 py-3 text-gray-900 font-light text-base mb-3"
              placeholder="Name *"
              placeholderTextColor="#b3c7ff"
              value={newFriendName}
              onChangeText={setNewFriendName}
              autoCapitalize="words"
              autoFocus
            />
            <TextInput
              className="bg-white border border-primary-100 rounded-xl px-4 py-3 text-gray-900 font-light text-base mb-4"
              placeholder="Email (optional)"
              placeholderTextColor="#b3c7ff"
              value={newFriendEmail}
              onChangeText={setNewFriendEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              className="bg-primary-600 rounded-xl py-3 items-center"
              onPress={addFriend}
            >
              <Text className="text-white font-medium text-base">Add Friend</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Card */}
        <View className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#3b82f6" />
            <Text className="text-blue-700 text-sm font-light ml-2 flex-1">
              Add friends here to quickly select them when creating groups or splitting expenses
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {friends.length === 0 ? (
          <View className="bg-primary-50/50 rounded-3xl p-16 items-center border border-primary-100/50">
            <View className="w-20 h-20 rounded-2xl bg-primary-100 items-center justify-center mb-6">
              <Ionicons name="people-outline" size={40} color="#7d9fff" />
            </View>
            <Text className="text-gray-700 text-center font-normal text-lg mb-2">
              No friends yet
            </Text>
            <Text className="text-primary-400 text-center font-light text-sm px-4">
              Add friends to use them in groups and expenses
            </Text>
          </View>
        ) : (
          <View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 font-light text-base">
                {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
              </Text>
            </View>
            {friends
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((friend, index) => (
                <View
                  key={friend.id}
                  className="bg-white rounded-xl p-4 mb-3 border border-primary-50"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View className="w-12 h-12 rounded-xl bg-primary-100 items-center justify-center mr-3">
                        <Text className="text-primary-600 font-medium text-lg">
                          {friend.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 font-normal text-base mb-1">
                          {friend.name}
                        </Text>
                        <Text className="text-primary-400 text-xs font-light">
                          {friend.email}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeFriend(friend.id)}
                      className="w-9 h-9 rounded-lg bg-red-50 items-center justify-center ml-2"
                    >
                      <Ionicons name="trash-outline" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
          </View>
        )}
        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
