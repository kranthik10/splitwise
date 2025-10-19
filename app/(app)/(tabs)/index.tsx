import { Friend } from '@/types';
import { getCurrencySymbol } from '@/utils/currency';
import { storage } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalOwed, setTotalOwed] = useState(0);
  const [totalOwe, setTotalOwe] = useState(0);
  const [expenseCount, setExpenseCount] = useState(0);
  const [currencySymbol, setCurrencySymbol] = useState('$');

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [friendsData, expenses, settlements, groups, symbol] = await Promise.all([
        storage.getFriends(),
        storage.getExpenses(),
        storage.getSettlements(),
        storage.getGroups(),
        getCurrencySymbol(),
      ]);

      const user = await storage.getUser();
      const userId = user?.id || 'current-user';

      setCurrencySymbol(symbol);
      
      // Get all unique people from friends and group members
      const allPeople = new Map<string, Friend>();
      
      // Add friends
      friendsData.forEach(friend => {
        allPeople.set(friend.id, { ...friend, balance: 0 });
      });
      
      // Add group members who aren't already friends
      groups.forEach(group => {
        group.members.forEach(member => {
          if (member.id !== userId && !allPeople.has(member.id)) {
            allPeople.set(member.id, {
              id: member.id,
              name: member.name,
              email: member.email || `${member.name.toLowerCase()}@example.com`,
              balance: 0,
            });
          }
        });
      });
      
      // Calculate balances from all expenses
      const balances: { [key: string]: number } = {};
      allPeople.forEach((person, id) => {
        balances[id] = 0;
      });

      expenses.forEach(expense => {
        const totalShares = expense.participants.reduce((sum, p) => sum + p.share, 0);
        
        expense.participants.forEach(participant => {
          const owedAmount = (participant.share / totalShares) * expense.amount;
          
          if (participant.userId === userId && expense.paidBy !== userId) {
            balances[expense.paidBy] = (balances[expense.paidBy] || 0) - owedAmount;
          } else if (participant.userId !== userId && expense.paidBy === userId) {
            balances[participant.userId] = (balances[participant.userId] || 0) + owedAmount;
          }
        });
      });

      // Apply settlements
      settlements.forEach(settlement => {
        if (settlement.from === userId) {
          balances[settlement.to] = (balances[settlement.to] || 0) - settlement.amount;
        } else if (settlement.to === userId) {
          balances[settlement.from] = (balances[settlement.from] || 0) + settlement.amount;
        }
      });

      // Update people with calculated balances
      const peopleWithBalances = Array.from(allPeople.values()).map(person => ({
        ...person,
        balance: balances[person.id] || 0,
      }));
      
      setFriends(peopleWithBalances);
      const total = peopleWithBalances.reduce((sum, p) => sum + p.balance, 0);
      setTotalBalance(total);
      setExpenseCount(expenses.length);
      
      // Calculate what you owe vs what you're owed
      const owed = peopleWithBalances.reduce((sum, p) => p.balance > 0 ? sum + p.balance : sum, 0);
      const owe = peopleWithBalances.reduce((sum, p) => p.balance < 0 ? sum + Math.abs(p.balance) : sum, 0);
      setTotalOwed(owed);
      setTotalOwe(owe);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2d5fff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-16 pb-6">
          <Text className="text-sm text-primary-400 mb-2 tracking-wide uppercase font-medium">Your</Text>
          <Text className="text-4xl font-light text-gray-900 mb-8">Balance</Text>
          
          {/* Single Balance Overview */}
          <TouchableOpacity 
            className={`rounded-3xl p-8 mb-6 ${
              totalBalance === 0 
                ? 'bg-gray-100 border border-gray-200' 
                : totalBalance > 0 
                  ? 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200' 
                  : 'bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200'
            }`}
            onPress={() => router.push('/members')}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
                  totalBalance === 0 
                    ? 'bg-gray-300' 
                    : totalBalance > 0 
                      ? 'bg-green-500' 
                      : 'bg-orange-500'
                }`}>
                  <Ionicons 
                    name={totalBalance === 0 ? 'checkmark' : totalBalance > 0 ? 'trending-up' : 'trending-down'} 
                    size={20} 
                    color="#ffffff" 
                  />
                </View>
                <Text className={`text-xs tracking-wider uppercase font-medium ${
                  totalBalance === 0 ? 'text-gray-600' : totalBalance > 0 ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {totalBalance === 0 ? 'All Settled' : totalBalance > 0 ? 'Overall you get' : 'Overall you owe'}
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={totalBalance === 0 ? '#9ca3af' : totalBalance > 0 ? '#86efac' : '#fdba74'} 
              />
            </View>
            <Text className={`text-5xl font-extralight mb-2 ${
              totalBalance === 0 ? 'text-gray-700' : totalBalance > 0 ? 'text-green-900' : 'text-orange-900'
            }`}>
              {currencySymbol}{Math.abs(totalBalance).toFixed(2)}
            </Text>
            {friends.length > 0 && (
              <Text className={`text-sm font-light ${
                totalBalance === 0 ? 'text-gray-500' : totalBalance > 0 ? 'text-green-700' : 'text-orange-700'
              }`}>
                {friends.filter(f => f.balance !== 0).length === 0 
                  ? `with ${friends.length} ${friends.length === 1 ? 'person' : 'people'}` 
                  : `across ${friends.filter(f => f.balance !== 0).length} ${friends.filter(f => f.balance !== 0).length === 1 ? 'person' : 'people'}`}
              </Text>
            )}
          </TouchableOpacity>

          {/* Quick Stats - Compact */}
          {friends.length > 0 && expenseCount > 0 && (
            <View className="bg-primary-50/40 rounded-xl px-4 py-3 border border-primary-100/50 mb-6">
              <View className="flex-row items-center justify-center">
                <Ionicons name="receipt-outline" size={16} color="#4d7cff" />
                <Text className="text-gray-700 font-light text-sm ml-2">
                  {expenseCount} {expenseCount === 1 ? 'expense' : 'expenses'} · {friends.length} {friends.length === 1 ? 'person' : 'people'}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View className="px-6 pb-24">
          {/* Primary Actions */}
          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity 
              onPress={() => router.push('/select-group')}
              className="flex-1 bg-primary-600 rounded-2xl p-5"
              activeOpacity={0.8}
            >
              <View className="w-11 h-11 rounded-xl bg-white/20 items-center justify-center mb-3">
                <Ionicons name="add" size={24} color="#ffffff" />
              </View>
              <Text className="text-white font-medium text-base mb-1">Add Expense</Text>
              <Text className="text-primary-200 text-xs font-light">Split a bill</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/friends')}
              className="flex-1 bg-white rounded-2xl p-5 border border-primary-100"
              activeOpacity={0.8}
            >
              <View className="w-11 h-11 rounded-xl bg-primary-100 items-center justify-center mb-3">
                <Ionicons name="person-add" size={24} color="#4d7cff" />
              </View>
              <Text className="text-gray-900 font-medium text-base mb-1">Friends</Text>
              <Text className="text-primary-400 text-xs font-light">Manage people</Text>
            </TouchableOpacity>
          </View>

          {/* Top People - Simplified */}
          {friends.filter(f => f.balance !== 0).length > 0 && (
            <View>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-gray-900 font-light text-lg">Who owes what</Text>
                <TouchableOpacity onPress={() => router.push('/members')}>
                  <Text className="text-primary-600 text-sm font-medium">See all</Text>
                </TouchableOpacity>
              </View>
              {friends
                .filter(f => f.balance !== 0)
                .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
                .slice(0, 4)
                .map((friend) => (
                  <TouchableOpacity
                    key={friend.id}
                    className="bg-white rounded-xl p-4 mb-3 flex-row items-center justify-between border border-primary-50"
                    onPress={() => router.push(`/settle-up?friendId=${friend.id}`)}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center flex-1">
                      <View className={`w-11 h-11 rounded-xl items-center justify-center mr-3 ${
                        friend.balance > 0 ? 'bg-green-100' : 'bg-orange-100'
                      }`}>
                        <Text className={`font-medium text-base ${
                          friend.balance > 0 ? 'text-green-700' : 'text-orange-700'
                        }`}>
                          {friend.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 font-normal text-base mb-0.5">{friend.name}</Text>
                        <Text className={`text-xs font-light ${
                          friend.balance > 0 ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {friend.balance > 0 ? 'owes you' : 'you owe'}
                        </Text>
                      </View>
                    </View>
                    <Text className={`text-lg font-light ${
                      friend.balance > 0 ? 'text-green-700' : 'text-orange-700'
                    }`}>
                      {currencySymbol}{Math.abs(friend.balance).toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          )}

          {/* Empty State */}
          {friends.length === 0 && (
            <View className="bg-primary-50/50 rounded-3xl p-16 items-center border border-primary-100/50">
              <View className="w-20 h-20 rounded-2xl bg-primary-100 items-center justify-center mb-6">
                <Ionicons name="wallet-outline" size={40} color="#7d9fff" />
              </View>
              <Text className="text-gray-700 text-center font-normal text-lg mb-2">
                No expenses yet
              </Text>
              <Text className="text-primary-400 text-center font-light text-sm px-4">
                Tap above to add your first expense
              </Text>
            </View>
          )}
          
          {/* All Settled State */}
          {friends.length > 0 && friends.filter(f => f.balance !== 0).length === 0 && (
            <View className="bg-green-50/50 rounded-3xl p-12 items-center border border-green-200/50">
              <View className="w-16 h-16 rounded-2xl bg-green-500 items-center justify-center mb-4">
                <Ionicons name="checkmark-circle" size={32} color="#ffffff" />
              </View>
              <Text className="text-green-900 text-center font-normal text-base">
                Everything's settled up!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
