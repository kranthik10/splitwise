import { Expense, Group } from '@/types';
import { getCurrencySymbol } from '@/utils/currency';
import { storage } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function GroupDetailsScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currencySymbol, setCurrencySymbol] = useState('$');

  useFocusEffect(
    useCallback(() => {
      loadGroupData();
    }, [groupId])
  );

  const loadGroupData = async () => {
    const [groups, allExpenses, symbol] = await Promise.all([
      storage.getGroups(),
      storage.getExpenses(),
      getCurrencySymbol(),
    ]);
    
    setCurrencySymbol(symbol);
    const foundGroup = groups.find(g => g.id === groupId);
    if (foundGroup) {
      setGroup(foundGroup);
    }

    const groupExpenses = allExpenses.filter(e => e.groupId === groupId);
    setExpenses(groupExpenses);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!group) return null;

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const avgPerPerson = group.members.length > 0 ? totalSpent / group.members.length : 0;

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-16 pb-6 flex-row items-center">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-xl bg-primary-100 items-center justify-center mr-3"
        >
          <Ionicons name="arrow-back" size={20} color="#4d7cff" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xs text-primary-400 tracking-wider uppercase font-medium">Group</Text>
          <Text className="text-2xl font-light text-gray-900">{group.name}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-8 mt-4">
          <View className="w-24 h-24 rounded-2xl bg-primary-600 items-center justify-center mb-4 shadow-sm">
            <Ionicons name={(group.icon || 'people') as any} size={40} color="#ffffff" />
          </View>
          <View className="px-4 py-2 rounded-full bg-primary-50 border border-primary-100">
            <Text className="text-primary-600 text-sm font-light">
              {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-primary-50 rounded-2xl p-5 border border-primary-100">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-lg bg-primary-600 items-center justify-center mr-2">
                <Ionicons name="cash-outline" size={16} color="#ffffff" />
              </View>
              <Text className="text-xs text-primary-400 tracking-wider uppercase font-medium">Total</Text>
            </View>
            <Text className="text-3xl font-light text-primary-700">
              {currencySymbol}{totalSpent.toFixed(2)}
            </Text>
            <Text className="text-primary-400 text-xs font-light mt-1">
              {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
            </Text>
          </View>

          <View className="flex-1 bg-white rounded-2xl p-5 border border-primary-100">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-lg bg-primary-100 items-center justify-center mr-2">
                <Ionicons name="person-outline" size={16} color="#4d7cff" />
              </View>
              <Text className="text-xs text-primary-400 tracking-wider uppercase font-medium">Average</Text>
            </View>
            <Text className="text-3xl font-light text-gray-900">
              {currencySymbol}{avgPerPerson.toFixed(2)}
            </Text>
            <Text className="text-primary-300 text-xs font-light mt-1">
              per person
            </Text>
          </View>
        </View>

        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs text-primary-400 tracking-wider uppercase font-medium">Members</Text>
            <View className="px-3 py-1 rounded-full bg-primary-100">
              <Text className="text-primary-600 text-xs font-medium">{group.members.length}</Text>
            </View>
          </View>
          <View className="bg-white rounded-2xl border border-primary-50 overflow-hidden">
            {group.members.map((member, index) => (
              <View
                key={member.id}
                className={`flex-row items-center py-4 px-4 ${index !== group.members.length - 1 ? 'border-b border-primary-50' : ''}`}
              >
                <View className="w-12 h-12 rounded-xl bg-primary-100 items-center justify-center mr-4">
                  <Text className="text-primary-600 font-medium text-base">
                    {member.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-light text-base">{member.name}</Text>
                  {member.id === 'current-user' && (
                    <Text className="text-primary-400 text-xs font-light mt-0.5">You</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {expenses.length > 0 ? (
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-xs text-primary-400 tracking-wider uppercase font-medium">Recent Expenses</Text>
              <View className="px-3 py-1 rounded-full bg-primary-100">
                <Text className="text-primary-600 text-xs font-medium">{expenses.length}</Text>
              </View>
            </View>
            {expenses.slice(0, 10).map((expense, index) => (
              <View
                key={expense.id}
                className="bg-white rounded-2xl p-5 mb-3 border border-primary-50"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-1">
                    <Text className="text-gray-900 font-normal text-base mb-1">
                      {expense.description}
                    </Text>
                    <Text className="text-primary-300 text-xs font-light">
                      {formatDate(expense.date)}
                    </Text>
                  </View>
                  <View className="w-11 h-11 rounded-xl bg-primary-100 items-center justify-center ml-3">
                    <Ionicons name="receipt-outline" size={20} color="#4d7cff" />
                  </View>
                </View>
                <View className="flex-row items-center justify-between pt-3 border-t border-primary-50">
                  <Text className="text-primary-400 text-xs font-light">
                    Split between {expense.participants.length} {expense.participants.length === 1 ? 'person' : 'people'}
                  </Text>
                  <Text className="text-primary-700 text-lg font-light">
                    {currencySymbol}{expense.amount.toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="mb-6">
            <Text className="text-xs text-primary-400 mb-3 tracking-wider uppercase font-medium">Expenses</Text>
            <View className="bg-primary-50/50 rounded-2xl p-12 items-center border border-primary-100/50">
              <View className="w-16 h-16 rounded-2xl bg-primary-100 items-center justify-center mb-4">
                <Ionicons name="receipt-outline" size={28} color="#7d9fff" />
              </View>
              <Text className="text-gray-400 text-center font-light text-base mb-2">
                No expenses yet
              </Text>
              <Text className="text-primary-300 text-center font-light text-sm">
                Add your first expense to this group
              </Text>
            </View>
          </View>
        )}

        <View className="h-24" />
      </ScrollView>

      <View className="px-6 py-4 border-t border-primary-50 bg-white">
        <TouchableOpacity
          className="bg-primary-600 rounded-xl py-4 items-center"
          onPress={() => router.push(`/add-expense?groupId=${group.id}`)}
        >
          <Text className="text-white font-normal text-base">Add Expense</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
