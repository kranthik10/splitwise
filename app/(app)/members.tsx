import { Friend } from '@/types';
import { getCurrencySymbol } from '@/utils/currency';
import { storage } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

type FilterType = 'all' | 'owed' | 'owe' | 'settled';
type SortType = 'name' | 'amount';

export default function MembersScreen() {
  const router = useRouter();
  const [allPeople, setAllPeople] = useState<Friend[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<Friend[]>([]);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('amount');
  const [totalOwed, setTotalOwed] = useState(0);
  const [totalOwe, setTotalOwe] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [filter, sortBy, allPeople]);

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
      const allPeopleMap = new Map<string, Friend>();
      
      friendsData.forEach(friend => {
        allPeopleMap.set(friend.id, { ...friend, balance: 0 });
      });
      
      groups.forEach(group => {
        group.members.forEach(member => {
          if (member.id !== userId && !allPeopleMap.has(member.id)) {
            allPeopleMap.set(member.id, {
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
      allPeopleMap.forEach((person, id) => {
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

      const peopleWithBalances = Array.from(allPeopleMap.values()).map(person => ({
        ...person,
        balance: balances[person.id] || 0,
      }));
      
      setAllPeople(peopleWithBalances);
      
      // Calculate totals
      const owed = peopleWithBalances.reduce((sum, p) => p.balance > 0 ? sum + p.balance : sum, 0);
      const owe = peopleWithBalances.reduce((sum, p) => p.balance < 0 ? sum + Math.abs(p.balance) : sum, 0);
      setTotalOwed(owed);
      setTotalOwe(owe);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...allPeople];

    // Apply filter
    switch (filter) {
      case 'owed':
        filtered = filtered.filter(p => p.balance > 0);
        break;
      case 'owe':
        filtered = filtered.filter(p => p.balance < 0);
        break;
      case 'settled':
        filtered = filtered.filter(p => p.balance === 0);
        break;
      // 'all' shows everyone
    }

    // Apply sort
    if (sortBy === 'amount') {
      filtered.sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredPeople(filtered);
  };

  const filters: { id: FilterType; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: 'people' },
    { id: 'owed', label: 'Owe Me', icon: 'arrow-down' },
    { id: 'owe', label: 'I Owe', icon: 'arrow-up' },
    { id: 'settled', label: 'Settled', icon: 'checkmark-circle' },
  ];

  const getFilterCount = (filterType: FilterType) => {
    switch (filterType) {
      case 'all':
        return allPeople.length;
      case 'owed':
        return allPeople.filter(p => p.balance > 0).length;
      case 'owe':
        return allPeople.filter(p => p.balance < 0).length;
      case 'settled':
        return allPeople.filter(p => p.balance === 0).length;
      default:
        return 0;
    }
  };

  const netBalance = totalOwed - totalOwe;

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
            <Text className="text-xs text-primary-400 tracking-wider uppercase font-medium">All</Text>
            <Text className="text-2xl font-light text-gray-900">Members</Text>
          </View>
        </View>

        {/* Summary Cards */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-green-50 rounded-2xl p-4 border border-green-200">
            <View className="flex-row items-center mb-2">
              <View className="w-7 h-7 rounded-lg bg-green-500 items-center justify-center mr-2">
                <Ionicons name="arrow-down" size={14} color="#ffffff" />
              </View>
              <Text className="text-green-600 text-xs tracking-wider uppercase font-medium">Get Back</Text>
            </View>
            <Text className="text-green-900 text-2xl font-light">
              {currencySymbol}{totalOwed.toFixed(2)}
            </Text>
          </View>

          <View className="flex-1 bg-orange-50 rounded-2xl p-4 border border-orange-200">
            <View className="flex-row items-center mb-2">
              <View className="w-7 h-7 rounded-lg bg-orange-500 items-center justify-center mr-2">
                <Ionicons name="arrow-up" size={14} color="#ffffff" />
              </View>
              <Text className="text-orange-600 text-xs tracking-wider uppercase font-medium">To Pay</Text>
            </View>
            <Text className="text-orange-900 text-2xl font-light">
              {currencySymbol}{totalOwe.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Net Balance */}
        <View className={`rounded-xl p-4 mb-6 ${
          netBalance === 0 
            ? 'bg-gray-50 border border-gray-200' 
            : netBalance > 0 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-orange-50 border border-orange-200'
        }`}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons 
                name={netBalance === 0 ? 'checkmark-circle' : netBalance > 0 ? 'trending-up' : 'trending-down'} 
                size={20} 
                color={netBalance === 0 ? '#6b7280' : netBalance > 0 ? '#22c55e' : '#f97316'} 
              />
              <Text className={`text-sm font-medium ml-2 ${
                netBalance === 0 ? 'text-gray-700' : netBalance > 0 ? 'text-green-700' : 'text-orange-700'
              }`}>
                Net Balance
              </Text>
            </View>
            <Text className={`text-xl font-normal ${
              netBalance === 0 ? 'text-gray-900' : netBalance > 0 ? 'text-green-900' : 'text-orange-900'
            }`}>
              {netBalance === 0 ? 'Even' : `${netBalance > 0 ? '+' : ''}${currencySymbol}${Math.abs(netBalance).toFixed(2)}`}
            </Text>
          </View>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 -mx-1">
          <View className="flex-row gap-2 px-1">
            {filters.map((f) => (
              <TouchableOpacity
                key={f.id}
                onPress={() => setFilter(f.id)}
                className={`px-4 py-2.5 rounded-xl flex-row items-center ${
                  filter === f.id 
                    ? 'bg-primary-600' 
                    : 'bg-primary-50 border border-primary-100'
                }`}
              >
                <Ionicons 
                  name={f.icon as any} 
                  size={16} 
                  color={filter === f.id ? '#ffffff' : '#4d7cff'} 
                />
                <Text className={`ml-2 text-sm font-medium ${
                  filter === f.id ? 'text-white' : 'text-primary-700'
                }`}>
                  {f.label}
                </Text>
                <View className={`ml-2 px-1.5 py-0.5 rounded-full ${
                  filter === f.id ? 'bg-primary-500' : 'bg-primary-100'
                }`}>
                  <Text className={`text-xs font-medium ${
                    filter === f.id ? 'text-white' : 'text-primary-600'
                  }`}>
                    {getFilterCount(f.id)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Sort Options */}
        <View className="flex-row items-center gap-2">
          <View className="flex-row items-center bg-primary-50 rounded-lg px-3 py-2 border border-primary-100">
            <Ionicons name="funnel-outline" size={14} color="#4d7cff" />
            <Text className="text-primary-600 text-xs font-medium ml-1.5">Sort by:</Text>
          </View>
          <TouchableOpacity
            onPress={() => setSortBy('amount')}
            className={`px-3 py-2 rounded-lg ${
              sortBy === 'amount' ? 'bg-primary-600' : 'bg-white border border-primary-100'
            }`}
          >
            <Text className={`text-xs font-medium ${
              sortBy === 'amount' ? 'text-white' : 'text-primary-700'
            }`}>
              Amount
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSortBy('name')}
            className={`px-3 py-2 rounded-lg ${
              sortBy === 'name' ? 'bg-primary-600' : 'bg-white border border-primary-100'
            }`}
          >
            <Text className={`text-xs font-medium ${
              sortBy === 'name' ? 'text-white' : 'text-primary-700'
            }`}>
              Name
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {filteredPeople.length === 0 ? (
          <View className="bg-primary-50/50 rounded-3xl p-16 items-center border border-primary-100/50">
            <View className="w-16 h-16 rounded-2xl bg-primary-100 items-center justify-center mb-6">
              <Ionicons name="search-outline" size={32} color="#7d9fff" />
            </View>
            <Text className="text-gray-400 text-center font-light text-base">
              No members found
            </Text>
            <Text className="text-primary-300 text-center font-light text-sm mt-2">
              Try a different filter
            </Text>
          </View>
        ) : (
          filteredPeople.map((person) => (
            <TouchableOpacity
              key={person.id}
              className="bg-white rounded-xl p-4 mb-3 flex-row items-center justify-between border border-primary-50"
              onPress={() => router.push(`/settle-up?friendId=${person.id}`)}
            >
              <View className="flex-row items-center flex-1">
                <View className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${
                  person.balance > 0 
                    ? 'bg-green-100' 
                    : person.balance < 0 
                      ? 'bg-orange-100' 
                      : 'bg-gray-100'
                }`}>
                  <Text className={`font-medium text-base ${
                    person.balance > 0 
                      ? 'text-green-700' 
                      : person.balance < 0 
                        ? 'text-orange-700' 
                        : 'text-gray-600'
                  }`}>
                    {person.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-normal text-base mb-1">{person.name}</Text>
                  {person.balance !== 0 ? (
                    <View className="flex-row items-center">
                      <View className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        person.balance > 0 ? 'bg-green-500' : 'bg-orange-400'
                      }`} />
                      <Text className={`text-xs font-light ${
                        person.balance > 0 ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {person.balance > 0 ? 'owes you' : 'you owe'}
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-gray-400 text-xs font-light">settled up</Text>
                  )}
                </View>
              </View>
              <View className="flex-row items-center">
                {person.balance !== 0 ? (
                  <Text className={`text-lg font-light mr-2 ${
                    person.balance > 0 ? 'text-green-700' : 'text-orange-700'
                  }`}>
                    {person.balance > 0 ? '+' : '-'}{currencySymbol}{Math.abs(person.balance).toFixed(2)}
                  </Text>
                ) : (
                  <View className="px-2.5 py-1 rounded-full bg-green-100 mr-2">
                    <Text className="text-green-700 text-xs font-medium">Even</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={16} color="#d6e0ff" />
              </View>
            </TouchableOpacity>
          ))
        )}
        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
