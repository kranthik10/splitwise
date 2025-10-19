import { Expense, Settlement } from '@/types';
import { getCurrencySymbol } from '@/utils/currency';
import { storage } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

type ActivityItem = (Expense | Settlement) & { type: 'expense' | 'settlement' };

export default function ActivityScreen() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [currencySymbol, setCurrencySymbol] = useState('$');

  useFocusEffect(
    useCallback(() => {
      loadActivities();
    }, [])
  );

  const loadActivities = async () => {
    const [expenses, settlements, symbol] = await Promise.all([
      storage.getExpenses(),
      storage.getSettlements(),
      getCurrencySymbol(),
    ]);

    setCurrencySymbol(symbol);

    const items: ActivityItem[] = [
      ...expenses.map((e) => ({ ...e, type: 'expense' as const })),
      ...settlements.map((s) => ({ ...s, type: 'settlement' as const })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setActivities(items);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-16 pb-8">
        <Text className="text-sm text-primary-400 mb-2 tracking-wide uppercase font-medium">Recent</Text>
        <Text className="text-4xl font-light text-gray-900">Activity</Text>
      </View>
      
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {activities.length === 0 ? (
          <View className="bg-primary-50/50 rounded-3xl p-16 items-center border border-primary-100/50 mt-8">
            <View className="w-16 h-16 rounded-2xl bg-primary-100 items-center justify-center mb-6">
              <Ionicons name="time-outline" size={32} color="#7d9fff" />
            </View>
            <Text className="text-gray-400 text-center font-light text-base">
              Add expenses to see them here
            </Text>
          </View>
        ) : (
          activities.map((activity) => (
            <View
              key={activity.id}
              className="bg-white rounded-2xl p-5 mb-3 flex-row items-center border border-primary-50"
            >
              <View className="w-12 h-12 rounded-xl bg-primary-100 items-center justify-center mr-4">
                <Ionicons
                  name={activity.type === 'expense' ? 'receipt-outline' : 'checkmark-circle-outline'}
                  size={20}
                  color="#4d7cff"
                />
              </View>
              <View className="flex-1">
                {activity.type === 'expense' ? (
                  <>
                    <Text className="text-gray-900 font-normal text-base mb-1">
                      {(activity as Expense).description}
                    </Text>
                    <Text className="text-primary-400 font-light text-sm">
                      {currencySymbol}{(activity as Expense).amount.toFixed(2)}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text className="text-gray-900 font-normal text-base mb-1">Payment</Text>
                    <Text className="text-primary-400 font-light text-sm">
                      {currencySymbol}{(activity as Settlement).amount.toFixed(2)}
                    </Text>
                  </>
                )}
              </View>
              <Text className="text-primary-300 text-xs font-light">
                {formatDate(activity.date)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
