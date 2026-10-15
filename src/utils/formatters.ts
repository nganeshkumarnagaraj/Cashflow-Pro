import { Category, Transaction } from '../types/finance';

export const formatCurrency = (amount: number, symbol = '$'): string => {
  const parts = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount < 0 ? '-' : ''}${symbol}${parts}`;
};

export const formatCompactCurrency = (amount: number, symbol = '$'): string => {
  if (Math.abs(amount) >= 1_000_000) {
    return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${symbol}${(amount / 1_000).toFixed(1)}k`;
  }
  return `${symbol}${amount.toFixed(0)}`;
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatShortDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const [, month, day] = dateStr.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[month - 1]} ${day}`;
};

export const getMonthName = (monthStr: string): string => {
  // expects 'YYYY-MM'
  if (!monthStr || monthStr === 'all') return 'All Time';
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export interface CategorySummary {
  category: Category;
  budget: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  transactionCount: number;
  status: 'safe' | 'warning' | 'exceeded';
}

export const calculateExpenseSummaries = (
  transactions: Transaction[],
  expenseCategories: Category[],
  categoryBudgets: Record<string, number>,
  selectedMonth: string // 'YYYY-MM' or 'all'
): CategorySummary[] => {
  // Filter transactions by month and type='expense'
  const filtered = transactions.filter((t) => {
    if (t.type !== 'expense') return false;
    if (selectedMonth === 'all') return true;
    return t.date.startsWith(selectedMonth);
  });

  // Aggregate spent per category
  const spentMap: Record<string, { total: number; count: number }> = {};
  filtered.forEach((t) => {
    if (!spentMap[t.categoryId]) {
      spentMap[t.categoryId] = { total: 0, count: 0 };
    }
    spentMap[t.categoryId].total += t.amount;
    spentMap[t.categoryId].count += 1;
  });

  return expenseCategories.map((cat) => {
    const budget = categoryBudgets[cat.id] ?? cat.defaultMonthlyBudget;
    const spent = spentMap[cat.id]?.total || 0;
    const remaining = budget - spent;
    const percentUsed = budget > 0 ? (spent / budget) * 100 : 0;
    let status: 'safe' | 'warning' | 'exceeded' = 'safe';
    if (percentUsed >= 100) status = 'exceeded';
    else if (percentUsed >= 80) status = 'warning';

    return {
      category: cat,
      budget,
      spent,
      remaining,
      percentUsed,
      transactionCount: spentMap[cat.id]?.count || 0,
      status,
    };
  });
};

export const calculateMonthlyTotals = (
  transactions: Transaction[],
  expenseCategories: Category[],
  categoryBudgets: Record<string, number>,
  selectedMonth: string
) => {
  const filtered = transactions.filter((t) => {
    if (selectedMonth === 'all') return true;
    return t.date.startsWith(selectedMonth);
  });

  let totalIncome = 0;
  let totalExpense = 0;

  filtered.forEach((t) => {
    if (t.type === 'income') totalIncome += t.amount;
    if (t.type === 'expense') totalExpense += t.amount;
  });

  const totalBudget = expenseCategories.reduce((sum, cat) => {
    return sum + (categoryBudgets[cat.id] ?? cat.defaultMonthlyBudget);
  }, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
  const budgetUsedPercent = totalBudget > 0 ? (totalExpense / totalBudget) * 100 : 0;
  const budgetRemaining = totalBudget - totalExpense;

  return {
    totalIncome,
    totalExpense,
    totalBudget,
    netSavings,
    savingsRate,
    budgetUsedPercent,
    budgetRemaining,
    transactionCount: filtered.length,
  };
};

export const exportTransactionsToCsv = (
  transactions: Transaction[],
  categoriesMap: Map<string, Category>
): void => {
  const headers = ['ID', 'Date', 'Type', 'Category', 'Title', 'Amount', 'Payment Method', 'Notes'];
  const rows = transactions.map((t) => [
    t.id,
    t.date,
    t.type,
    categoriesMap.get(t.categoryId)?.name || t.categoryId,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    t.amount.toFixed(2),
    t.paymentMethod,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `financial-records-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
