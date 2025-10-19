import { Expense, Friend, Group, Settlement, User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER: '@user',
  FRIENDS: '@friends',
  GROUPS: '@groups',
  EXPENSES: '@expenses',
  SETTLEMENTS: '@settlements',
};

export const storage = {
  async getUser(): Promise<User | null> {
    const data = await AsyncStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  async setUser(user: User): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  async getFriends(): Promise<Friend[]> {
    const data = await AsyncStorage.getItem(KEYS.FRIENDS);
    return data ? JSON.parse(data) : [];
  },

  async setFriends(friends: Friend[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.FRIENDS, JSON.stringify(friends));
  },

  async getGroups(): Promise<Group[]> {
    const data = await AsyncStorage.getItem(KEYS.GROUPS);
    return data ? JSON.parse(data) : [];
  },

  async setGroups(groups: Group[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.GROUPS, JSON.stringify(groups));
  },

  async getExpenses(): Promise<Expense[]> {
    const data = await AsyncStorage.getItem(KEYS.EXPENSES);
    return data ? JSON.parse(data) : [];
  },

  async setExpenses(expenses: Expense[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
  },

  async getSettlements(): Promise<Settlement[]> {
    const data = await AsyncStorage.getItem(KEYS.SETTLEMENTS);
    return data ? JSON.parse(data) : [];
  },

  async setSettlements(settlements: Settlement[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.SETTLEMENTS, JSON.stringify(settlements));
  },
};
