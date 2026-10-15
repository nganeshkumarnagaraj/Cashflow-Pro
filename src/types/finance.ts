export type TransactionType = 'income' | 'expense';

export type PaymentMethod =
  | 'Credit Card'
  | 'Debit Card'
  | 'Bank Transfer'
  | 'Cash'
  | 'Digital Wallet';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  iconName: string;
  defaultMonthlyBudget: number; // default budget limit (for expense categories)
  description?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  categoryId: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  recurring?: boolean;
  createdAt: number;
}

export interface CategoryBudget {
  categoryId: string;
  monthlyLimit: number;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  label: string;
}

export type ViewTab = 'overview' | 'budget' | 'transactions' | 'analytics';

export interface QuickPreset {
  label: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  paymentMethod: PaymentMethod;
}
