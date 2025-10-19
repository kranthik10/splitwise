import { Friend } from '@/types';
import { getCurrencySymbol } from '@/utils/currency';
import { storage } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function BalanceDetailsScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams(); // 'owed' or 'owe'
  const [people, setPeople] = useState<Friend[]>([]);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadData();
  }, [type]);

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
      
      // Get all unique people
      const allPeople = new Map<string, Friend>();
      
      friendsData.forEach(friend => {
        allPeople.set(friend.id, { ...friend, balance: 0 });
      });
      
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
      
      // Calculate balances
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

      settlements.forEach(settlement => {
        if (settlement.from === userId) {
          balances[settlement.to] = (balances[settlement.to] || 0) - settlement.amount;
        } else if (settlement.to === userId) {
          balances[settlement.from] = (balances[settlement.from] || 0) + settlement.amount;
        }
      });

      const peopleWithBalances = Array.from(allPeople.values())
        .map(person => ({
          ...person,
          balance: balances[person.id] || 0,
        }))
        .filter(person => {
          if (type === 'owed') return person.balance > 0;
          if (type === 'owe') return person.balance < 0;
          return person.balance !== 0;
        })
        .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
      
      setPeople(peopleWithBalances);
      const sum = peopleWithBalances.reduce((s, p) => s + Math.abs(p.balance), 0);
      setTotal(sum);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const isOwed = type === 'owed';

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-16 pb-6">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-xl bg-primary-100 items-center justify-center mb-4"
        >
          <Ionicons name="arrow-back" size={20} color="#4d7cff" />
        </TouchableOpacity>
        <Text className="text-xs text-primary-400 tracking-wider uppercase font-medium mb-2">
          {isOwed ? 'You are owed' : 'You owe'}
        </Text>
        <Text className="text-4xl font-light text-gray-900 mb-8">
          {currencySymbol}{total.toFixed(2)}
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {people.length === 0 ? (
          <View className="bg-primary-50/50 rounded-3xl p-16 items-center border border-primary-100/50">
            <View className="w-16 h-16 rounded-2xl bg-primary-100 items-center justify-center mb-6">
              <Ionicons 
                name={isOwed ? "arrow-down" : "arrow-up"} 
                size={32} 
                color="#7d9fff" 
              />
            </View>
            <Text className="text-gray-400 text-center font-light text-base">
              {isOwed ? 'No one owes you money' : "You don't owe anyone"}
            </Text>
          </View>
        ) : (
          people.map((person) => (
            <TouchableOpacity
              key={person.id}
              className="bg-white rounded-2xl p-5 mb-3 flex-row items-center justify-between border border-primary-50"
              onPress={() => router.push(`/settle-up?friendId=${person.id}`)}
            >
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 rounded-xl bg-primary-100 items-center justify-center mr-4">
                  <Text className="text-primary-600 font-medium text-lg">
                    {person.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-normal text-base mb-1">{person.name}</Text>
                  <View className="flex-row items-center">
                    <View className={`w-2 h-2 rounded-full mr-2 ${
                      isOwed ? 'bg-green-500' : 'bg-orange-400'
                    }`} />
                    <Text className={`text-sm font-light ${
                      isOwed ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {isOwed ? 'Owes you ' : 'You owe '}
                      {currencySymbol}{Math.abs(person.balance).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
              <View className="flex-row items-center">
                <View className={`px-3 py-1 rounded-full mr-3 ${
                  isOwed ? 'bg-green-50' : 'bg-orange-50'
                }`}>
                  <Text className={`text-xs font-medium ${
                    isOwed ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {isOwed ? '+' : '-'}{currencySymbol}{Math.abs(person.balance).toFixed(2)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#d6e0ff" />
              </View>
            </TouchableOpacity>
          ))
        )}
        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
