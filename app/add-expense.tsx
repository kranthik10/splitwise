import { Expense, Friend } from '@/types';
import { getCurrencySymbol } from '@/utils/currency';
import { storage } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const QUICK_AMOUNTS = [10, 20, 50, 100];
const CATEGORIES = [
  { id: 'food', icon: 'restaurant', label: 'Food' },
  { id: 'transport', icon: 'car', label: 'Transport' },
  { id: 'entertainment', icon: 'film', label: 'Entertainment' },
  { id: 'shopping', icon: 'cart', label: 'Shopping' },
  { id: 'utilities', icon: 'bulb', label: 'Utilities' },
  { id: 'other', icon: 'ellipsis-horizontal', label: 'Other' },
];

const SPLIT_TYPES = [
  { id: 'equally', icon: 'people', label: 'Equally' },
  { id: 'percentage', icon: 'pie-chart', label: 'Percentage' },
  { id: 'unequally', icon: 'cash', label: 'Unequally' },
  { id: 'shares', icon: 'analytics', label: 'Shares' },
];

type SplitType = 'equally' | 'percentage' | 'unequally' | 'shares';

export default function AddExpenseScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [groupMembers, setGroupMembers] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [paidBy, setPaidBy] = useState('current-user');
  const [newFriendName, setNewFriendName] = useState('');
  const [category, setCategory] = useState('other');
  const [splitType, setSplitType] = useState<SplitType>('equally');
  const [customShares, setCustomShares] = useState<{ [key: string]: string }>({});
  const [currencySymbol, setCurrencySymbol] = useState('$');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [friendsData, symbol] = await Promise.all([
      storage.getFriends(),
      getCurrencySymbol(),
    ]);
    setFriends(friendsData);
    setCurrencySymbol(symbol);

    if (groupId) {
      const groups = await storage.getGroups();
      const group = groups.find(g => g.id === groupId);
      if (group) {
        const members = group.members
          .filter(m => m.id !== 'current-user')
          .map(m => {
            const existingFriend = friendsData.find(f => f.id === m.id);
            return existingFriend || { ...m, balance: 0 };
          }) as Friend[];
        setGroupMembers(members);
        setSelectedFriends(new Set(members.map(m => m.id)));
        
        // Initialize custom shares for non-equally splits
        const initialShares: { [key: string]: string } = { 'current-user': '1' };
        members.forEach(m => {
          initialShares[m.id] = '1';
        });
        setCustomShares(initialShares);
      }
    }
  };

  const toggleFriend = (friendId: string) => {
    if (splitType !== 'equally') return;
    
    const newSelected = new Set(selectedFriends);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
    } else {
      newSelected.add(friendId);
    }
    setSelectedFriends(newSelected);
  };

  const selectAllFriends = () => {
    const availableFriends = groupId ? groupMembers : friends;
    if (selectedFriends.size === availableFriends.length) {
      setSelectedFriends(new Set());
    } else {
      setSelectedFriends(new Set(availableFriends.map(f => f.id)));
    }
  };

  const addNewFriend = async () => {
    const trimmedName = newFriendName.trim();
    if (!trimmedName) return;

    const newFriend: Friend = {
      id: Date.now().toString(),
      name: trimmedName,
      email: `${trimmedName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      balance: 0,
    };

    const updatedFriends = [...friends, newFriend];
    await storage.setFriends(updatedFriends);
    setFriends(updatedFriends);
    setNewFriendName('');
    setSelectedFriends(new Set([...selectedFriends, newFriend.id]));
  };

  const calculateShares = () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || isNaN(parsedAmount)) return [];

    const displayFriends = groupId ? groupMembers : friends;
    const participantIds = splitType === 'equally' 
      ? ['current-user', ...Array.from(selectedFriends)]
      : ['current-user', ...displayFriends.map(f => f.id)];

    if (splitType === 'equally') {
      const sharePerPerson = parsedAmount / participantIds.length;
      return participantIds.map(id => ({ userId: id, share: sharePerPerson }));
    }

    if (splitType === 'percentage') {
      return participantIds.map(id => {
        const percentage = parseFloat(customShares[id] || '0');
        return { userId: id, share: (parsedAmount * percentage) / 100 };
      });
    }

    if (splitType === 'unequally') {
      return participantIds.map(id => {
        const customAmount = parseFloat(customShares[id] || '0');
        return { userId: id, share: customAmount };
      });
    }

    if (splitType === 'shares') {
      const totalShares = participantIds.reduce((sum, id) => {
        return sum + parseFloat(customShares[id] || '1');
      }, 0);
      return participantIds.map(id => {
        const shares = parseFloat(customShares[id] || '1');
        return { userId: id, share: (parsedAmount * shares) / totalShares };
      });
    }

    return [];
  };

  const saveExpense = async () => {
    const trimmedDescription = description.trim();
    const parsedAmount = parseFloat(amount);

    if (!trimmedDescription) {
      Alert.alert('Missing Information', 'Please enter a description');
      return;
    }

    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (splitType === 'equally' && selectedFriends.size === 0) {
      Alert.alert('No Friends Selected', 'Please select at least one friend to split with');
      return;
    }

    if (splitType !== 'equally' && displayFriends.length === 0) {
      Alert.alert('No Friends', 'Add friends to split expenses');
      return;
    }

    if (splitType === 'percentage') {
      const displayFriends = groupId ? groupMembers : friends;
      const participantIds = ['current-user', ...displayFriends.map(f => f.id)];
      const totalPercentage = participantIds.reduce((sum, id) => {
        return sum + parseFloat(customShares[id] || '0');
      }, 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        Alert.alert('Invalid Split', 'Percentages must add up to 100%');
        return;
      }
    }

    if (splitType === 'unequally') {
      const displayFriends = groupId ? groupMembers : friends;
      const participantIds = ['current-user', ...displayFriends.map(f => f.id)];
      const totalAmount = participantIds.reduce((sum, id) => {
        return sum + parseFloat(customShares[id] || '0');
      }, 0);
      if (Math.abs(totalAmount - parsedAmount) > 0.01) {
        Alert.alert('Invalid Split', `Amounts must add up to ${currencySymbol}${parsedAmount.toFixed(2)}`);
        return;
      }
    }

    const participants = calculateShares();

    const newExpense: Expense = {
      id: Date.now().toString(),
      description: trimmedDescription,
      amount: parsedAmount,
      paidBy,
      participants,
      date: new Date().toISOString(),
      groupId: groupId as string | undefined,
      category,
    };

    const expenses = await storage.getExpenses();
    await storage.setExpenses([...expenses, newExpense]);

    router.back();
  };

  const displayFriends = groupId ? groupMembers : friends;
  const displayPaidByFriends = groupId ? groupMembers : friends;
  
  const totalParticipants = splitType === 'equally' 
    ? selectedFriends.size + 1 
    : displayFriends.length + 1;
  const shares = calculateShares();
  const currentUserShare = shares.find(s => s.userId === 'current-user')?.share || 0;

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-16 pb-6">
        <Text className="text-xs text-primary-400 mb-2 tracking-wider uppercase font-medium">New</Text>
        <Text className="text-3xl font-light text-gray-900">Expense</Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="mb-6">
          <Text className="text-xs text-primary-400 mb-3 tracking-wider uppercase font-medium">Category</Text>
          <View className="flex-row flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setCategory(cat.id)}
                className={`px-4 py-3 rounded-xl flex-row items-center ${
                  category === cat.id ? 'bg-primary-600' : 'bg-primary-100'
                }`}
              >
                <Ionicons 
                  name={cat.icon as any} 
                  size={16} 
                  color={category === cat.id ? '#ffffff' : '#4d7cff'} 
                />
                <Text className={`ml-2 text-sm font-light ${
                  category === cat.id ? 'text-white' : 'text-primary-700'
                }`}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-xs text-primary-400 mb-2 tracking-wider uppercase font-medium">Description</Text>
          <TextInput
            className="border border-primary-100 rounded-xl px-4 py-4 text-gray-900 font-light text-base"
            placeholder="What was this for?"
            placeholderTextColor="#b3c7ff"
            value={description}
            onChangeText={setDescription}
            autoCapitalize="sentences"
          />
        </View>

        <View className="mb-6">
          <Text className="text-xs text-primary-400 mb-2 tracking-wider uppercase font-medium">Amount</Text>
          <View className="flex-row items-center border border-primary-100 rounded-xl px-4 py-4 mb-3">
            <Text className="text-primary-600 text-2xl font-light mr-2">{currencySymbol}</Text>
            <TextInput
              className="flex-1 text-gray-900 text-2xl font-light"
              placeholder="0.00"
              placeholderTextColor="#b3c7ff"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>
          <View className="flex-row gap-2">
            {QUICK_AMOUNTS.map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                onPress={() => setAmount(quickAmount.toString())}
                className="flex-1 bg-primary-50 border border-primary-100 rounded-lg py-2 items-center"
              >
                <Text className="text-primary-600 text-sm font-light">{currencySymbol}{quickAmount}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-xs text-primary-400 mb-3 tracking-wider uppercase font-medium">Paid by</Text>
          <TouchableOpacity
            className={`border rounded-xl px-4 py-4 mb-2 flex-row items-center ${
              paidBy === 'current-user' ? 'bg-primary-50 border-primary-600' : 'border-primary-100'
            }`}
            onPress={() => setPaidBy('current-user')}
          >
            <View className="w-10 h-10 rounded-lg bg-primary-100 items-center justify-center mr-3">
              <Text className="text-primary-600 font-medium text-sm">Y</Text>
            </View>
            <Text className={`font-light ${paidBy === 'current-user' ? 'text-primary-700' : 'text-gray-600'}`}>
              You
            </Text>
          </TouchableOpacity>
          {displayPaidByFriends.map(friend => (
            <TouchableOpacity
              key={friend.id}
              className={`border rounded-xl px-4 py-4 mb-2 flex-row items-center ${
                paidBy === friend.id ? 'bg-primary-50 border-primary-600' : 'border-primary-100'
              }`}
              onPress={() => setPaidBy(friend.id)}
            >
              <View className="w-10 h-10 rounded-lg bg-primary-100 items-center justify-center mr-3">
                <Text className="text-primary-600 font-medium text-sm">
                  {friend.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text className={`font-light ${paidBy === friend.id ? 'text-primary-700' : 'text-gray-600'}`}>
                {friend.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs text-primary-400 tracking-wider uppercase font-medium">Split Type</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row gap-2">
              {SPLIT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => setSplitType(type.id as SplitType)}
                  className={`px-5 py-3 rounded-xl flex-row items-center ${
                    splitType === type.id ? 'bg-primary-600' : 'bg-primary-100'
                  }`}
                >
                  <Ionicons 
                    name={type.icon as any} 
                    size={16} 
                    color={splitType === type.id ? '#ffffff' : '#4d7cff'} 
                  />
                  <Text className={`ml-2 text-sm font-light ${
                    splitType === type.id ? 'text-white' : 'text-primary-700'
                  }`}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs text-primary-400 tracking-wider uppercase font-medium">Split with</Text>
            {displayFriends.length > 0 && splitType === 'equally' && (
              <TouchableOpacity
                onPress={selectAllFriends}
                className="px-3 py-1 rounded-full bg-primary-100"
              >
                <Text className="text-primary-600 text-xs font-medium">
                  {selectedFriends.size === displayFriends.length ? 'Deselect all' : 'Select all'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          {displayFriends.length === 0 ? (
            <View className="bg-primary-50/50 rounded-xl p-8 items-center border border-primary-100/50 mb-4">
              <Ionicons name="people-outline" size={32} color="#b3c7ff" />
              <Text className="text-primary-300 text-center font-light text-sm mt-3">
                Add a friend below to split expenses
              </Text>
            </View>
          ) : (
            <View className="bg-white rounded-2xl border border-primary-50 overflow-hidden mb-4">
              {splitType === 'equally' ? (
                displayFriends.map((friend, index) => (
                  <TouchableOpacity
                    key={friend.id}
                    className={`flex-row items-center justify-between py-4 px-4 ${
                      index !== displayFriends.length - 1 ? 'border-b border-primary-50' : ''
                    }`}
                    onPress={() => toggleFriend(friend.id)}
                  >
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 rounded-lg bg-primary-100 items-center justify-center mr-3">
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
                ))
              ) : (
                <>
                  <View className={`flex-row items-center py-4 px-4 border-b border-primary-50`}>
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 rounded-lg bg-primary-100 items-center justify-center mr-3">
                        <Text className="text-primary-600 font-medium text-sm">Y</Text>
                      </View>
                      <Text className="text-gray-900 font-light">You</Text>
                    </View>
                    <View className="flex-row items-center">
                      {splitType === 'unequally' && (
                        <Text className="text-primary-400 mr-1 font-light">{currencySymbol}</Text>
                      )}
                      <TextInput
                        className="border border-primary-100 rounded-lg px-3 py-2 text-gray-900 font-light w-20 text-right"
                        placeholder={splitType === 'percentage' ? '0' : splitType === 'shares' ? '1' : '0.00'}
                        placeholderTextColor="#b3c7ff"
                        value={customShares['current-user'] || ''}
                        onChangeText={(val) => setCustomShares({ ...customShares, 'current-user': val })}
                        keyboardType="decimal-pad"
                      />
                      {splitType === 'percentage' && (
                        <Text className="text-primary-400 ml-1 font-light">%</Text>
                      )}
                      {splitType === 'shares' && (
                        <View className="ml-1 w-8">
                          <Text className="text-primary-300 text-xs font-light">shr</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  {displayFriends.map((friend, index) => (
                    <View
                      key={friend.id}
                      className={`flex-row items-center py-4 px-4 ${
                        index !== displayFriends.length - 1 ? 'border-b border-primary-50' : ''
                      }`}
                    >
                      <View className="flex-row items-center flex-1">
                        <View className="w-10 h-10 rounded-lg bg-primary-100 items-center justify-center mr-3">
                          <Text className="text-primary-600 font-medium text-sm">
                            {friend.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <Text className="text-gray-900 font-light">{friend.name}</Text>
                      </View>
                      <View className="flex-row items-center">
                        {splitType === 'unequally' && (
                          <Text className="text-primary-400 mr-1 font-light">{currencySymbol}</Text>
                        )}
                        <TextInput
                          className="border border-primary-100 rounded-lg px-3 py-2 text-gray-900 font-light w-20 text-right"
                          placeholder={splitType === 'percentage' ? '0' : splitType === 'shares' ? '1' : '0.00'}
                          placeholderTextColor="#b3c7ff"
                          value={customShares[friend.id] || ''}
                          onChangeText={(val) => setCustomShares({ ...customShares, [friend.id]: val })}
                          keyboardType="decimal-pad"
                        />
                        {splitType === 'percentage' && (
                          <Text className="text-primary-400 ml-1 font-light">%</Text>
                        )}
                        {splitType === 'shares' && (
                          <View className="ml-1 w-8">
                            <Text className="text-primary-300 text-xs font-light">shr</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </>
              )}
            </View>
          )}

          {!groupId && (
            <View className="flex-row gap-2 mb-4">
              <TextInput
                className="flex-1 border border-primary-100 rounded-xl px-4 py-3 text-gray-900 font-light"
                placeholder="Add new friend"
                placeholderTextColor="#b3c7ff"
                value={newFriendName}
                onChangeText={setNewFriendName}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={addNewFriend}
              />
              <TouchableOpacity
                className="bg-primary-600 rounded-xl w-12 h-12 items-center justify-center"
                onPress={addNewFriend}
              >
                <Ionicons name="add" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          )}

          {((splitType === 'equally' && selectedFriends.size > 0) || (splitType !== 'equally' && displayFriends.length > 0)) && amount && parseFloat(amount) > 0 && (
            <View className="bg-primary-50 rounded-xl p-4 border border-primary-100">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-primary-600 text-xs font-light tracking-wider uppercase">
                  {splitType === 'equally' ? 'Split Preview' : 'Your Share'}
                </Text>
                <View className="px-2 py-1 rounded-full bg-primary-200">
                  <Text className="text-primary-700 text-xs font-medium">{totalParticipants} people</Text>
                </View>
              </View>
              <View className="flex-row items-baseline">
                <Text className="text-primary-700 text-2xl font-light">{currencySymbol}{currentUserShare.toFixed(2)}</Text>
                <Text className="text-primary-400 text-sm font-light ml-2">
                  {splitType === 'equally' ? 'per person' : 'you pay'}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View className="h-24" />
      </ScrollView>

      <View className="bg-white px-6 py-4 border-t border-primary-50">
        <TouchableOpacity
          className="bg-primary-600 rounded-xl py-4 items-center"
          onPress={saveExpense}
        >
          <Text className="text-white font-normal text-base">Save Expense</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
