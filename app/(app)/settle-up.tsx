import { Friend, Settlement } from '@/types';
import { getCurrencySymbol } from '@/utils/currency';
import { storage } from '@/utils/storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SettleUpScreen() {
  const router = useRouter();
  const { friendId } = useLocalSearchParams();
  const [friend, setFriend] = useState<Friend | null>(null);
  const [amount, setAmount] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('$');

  useEffect(() => {
    loadFriend();
  }, []);

  const loadFriend = async () => {
    const [friends, symbol] = await Promise.all([
      storage.getFriends(),
      getCurrencySymbol(),
    ]);
    setCurrencySymbol(symbol);
    const foundFriend = friends.find(f => f.id === friendId);
    if (foundFriend) {
      setFriend(foundFriend);
      setAmount(Math.abs(foundFriend.balance).toFixed(2));
    }
  };

  const settleUp = async () => {
    if (!friend) return;

    const parsedAmount = parseFloat(amount);

    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (parsedAmount > Math.abs(friend.balance)) {
      Alert.alert('Amount Too High', `Maximum amount is ${currencySymbol}${Math.abs(friend.balance).toFixed(2)}`);
      return;
    }

    const settlement: Settlement = {
      id: Date.now().toString(),
      from: friend.balance < 0 ? 'current-user' : friend.id,
      to: friend.balance < 0 ? friend.id : 'current-user',
      amount: parsedAmount,
      date: new Date().toISOString(),
    };

    const settlements = await storage.getSettlements();
    await storage.setSettlements([...settlements, settlement]);

    router.back();
  };

  if (!friend) return null;

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 px-6 py-8">
        <View className="items-center mb-12">
          <View className="w-20 h-20 rounded-2xl bg-primary-600 items-center justify-center mb-6">
            <Text className="text-white text-3xl font-light">
              {friend.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text className="text-2xl font-light text-gray-900 mb-3">{friend.name}</Text>
          <View className="px-5 py-2 rounded-full bg-primary-50 border border-primary-100">
            <Text className="text-primary-600 font-light text-sm">
              {friend.balance > 0 ? 'Owes you' : 'You owe'} {currencySymbol}{Math.abs(friend.balance).toFixed(2)}
            </Text>
          </View>
        </View>

        <View>
          <Text className="text-xs text-primary-400 mb-4 tracking-wider uppercase font-medium">Settlement Amount</Text>
          <View className="flex-row items-center border border-primary-100 rounded-xl px-6 py-6 mb-6">
            <Text className="text-primary-600 text-3xl font-extralight mr-3">{currencySymbol}</Text>
            <TextInput
              className="flex-1 text-gray-900 text-3xl font-extralight"
              placeholder="0.00"
              placeholderTextColor="#b3c7ff"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>
          <View className="bg-primary-50 rounded-xl p-4 border border-primary-100">
            <Text className="text-primary-600 text-sm font-light text-center">
              {friend.balance > 0
                ? `${friend.name} pays you`
                : `You pay ${friend.name}`}
            </Text>
          </View>
        </View>
      </View>

      <View className="bg-white px-6 py-4 border-t border-primary-50">
        <TouchableOpacity
          className="bg-primary-600 rounded-xl py-4 items-center"
          onPress={settleUp}
        >
          <Text className="text-white font-normal text-base">Record Payment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
