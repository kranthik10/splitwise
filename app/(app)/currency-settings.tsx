import { clearCurrencyCache } from '@/utils/currency';
import { storage } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
];

export default function CurrencySettingsScreen() {
  const router = useRouter();
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  useEffect(() => {
    loadCurrency();
  }, []);

  const loadCurrency = async () => {
    const user = await storage.getUser();
    if (user?.currency) {
      setSelectedCurrency(user.currency);
    }
  };

  const selectCurrency = async (currencyCode: string) => {
    const user = await storage.getUser();
    if (user) {
      user.currency = currencyCode;
      await storage.setUser(user);
      setSelectedCurrency(currencyCode);
      clearCurrencyCache();
      
      // Show success feedback
      setTimeout(() => {
        router.back();
      }, 300);
    }
  };

  const getCurrencySymbol = (code: string) => {
    return CURRENCIES.find(c => c.code === code)?.symbol || '$';
  };

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
          <Text className="text-xs text-primary-400 tracking-wider uppercase font-medium">Settings</Text>
          <Text className="text-2xl font-light text-gray-900">Currency</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="mb-4">
          <Text className="text-xs text-primary-400 mb-3 tracking-wider uppercase font-medium">
            Select Your Currency
          </Text>
          <Text className="text-primary-300 text-sm font-light mb-6">
            This will be used to display all amounts in the app
          </Text>
        </View>

        <View className="bg-white rounded-2xl border border-primary-50 overflow-hidden">
          {CURRENCIES.map((currency, index) => (
            <TouchableOpacity
              key={currency.code}
              onPress={() => selectCurrency(currency.code)}
              className={`flex-row items-center justify-between py-4 px-4 ${
                index !== CURRENCIES.length - 1 ? 'border-b border-primary-50' : ''
              }`}
            >
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 rounded-xl bg-primary-100 items-center justify-center mr-4">
                  <Text className="text-primary-600 font-medium text-lg">
                    {currency.symbol}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-normal text-base mb-1">
                    {currency.name}
                  </Text>
                  <Text className="text-primary-400 text-sm font-light">
                    {currency.code}
                  </Text>
                </View>
              </View>
              {selectedCurrency === currency.code && (
                <View className="w-6 h-6 rounded-full bg-primary-600 items-center justify-center">
                  <Ionicons name="checkmark" size={16} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
