export interface Expense {
  id: string;
  amount: number;
  currency: string;
  category: string;
  note: string;
  date: string; // ISO date string YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type Theme = 'light' | 'dark' | 'system';
export type Currency = 'BDT' | 'USD' | 'EUR' | 'GBP' | 'INR';
export type Page = 'overview' | 'transactions' | 'analytics' | 'settings';

export interface Settings {
  theme: Theme;
  currency: Currency;
  defaultCategory: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food', icon: 'UtensilsCrossed', color: '#f97316' },
  { id: 'transport', name: 'Transport', icon: 'Car', color: '#3b82f6' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#a855f7' },
  { id: 'bills', name: 'Bills', icon: 'Receipt', color: '#ef4444' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Gamepad2', color: '#ec4899' },
  { id: 'health', name: 'Health', icon: 'Heart', color: '#10b981' },
  { id: 'education', name: 'Education', icon: 'GraduationCap', color: '#6366f1' },
  { id: 'other', name: 'Other', icon: 'MoreHorizontal', color: '#6b7280' },
];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  BDT: '৳',
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
};

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  currency: 'BDT',
  defaultCategory: 'food',
};
