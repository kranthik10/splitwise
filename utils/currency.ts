import { storage } from './storage';

const CURRENCY_SYMBOLS: { [key: string]: string } = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  CNY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  SEK: 'kr',
  NZD: 'NZ$',
  SGD: 'S$',
};

let cachedCurrency: string | null = null;
let cachedSymbol: string | null = null;

export const getCurrencySymbol = async (): Promise<string> => {
  if (cachedSymbol) return cachedSymbol;
  
  const user = await storage.getUser();
  const currency = user?.currency || 'USD';
  cachedCurrency = currency;
  cachedSymbol = CURRENCY_SYMBOLS[currency] || '$';
  
  return cachedSymbol;
};

export const getCurrencyCode = async (): Promise<string> => {
  if (cachedCurrency) return cachedCurrency;
  
  const user = await storage.getUser();
  cachedCurrency = user?.currency || 'USD';
  
  return cachedCurrency;
};

export const clearCurrencyCache = () => {
  cachedCurrency = null;
  cachedSymbol = null;
};

export const formatCurrency = async (amount: number): Promise<string> => {
  const symbol = await getCurrencySymbol();
  return `${symbol}${amount.toFixed(2)}`;
};
