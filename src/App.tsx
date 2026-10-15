import React, { useState, useEffect } from 'react';
import {
  Transaction,
  Category,
  CategoryBudget,
  ViewTab,
  QuickPreset,
} from './types/finance';
import {
  ALL_DEFAULT_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_PRESETS,
  CURRENCIES,
  INITIAL_SAMPLE_TRANSACTIONS,
} from './data/defaultData';
import {
  calculateExpenseSummaries,
  calculateMonthlyTotals,
  getMonthName,
} from './utils/formatters';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { BudgetManager } from './components/BudgetManager';
import { TransactionLedger } from './components/TransactionLedger';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { TransactionModal } from './components/TransactionModal';
import { BudgetModal } from './components/BudgetModal';
import { StudioAttributionModal } from './components/StudioAttributionModal';
import { Calendar, DollarSign, RotateCcw, Check, Sparkles } from 'lucide-react';

const STORAGE_KEYS = {
  TRANSACTIONS: 'iem_transactions_v1',
  BUDGETS: 'iem_category_budgets_v1',
  CURRENCY: 'iem_currency_v1',
};

export default function App() {
  // 1. Transactions state with localStorage persistence
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading stored transactions:', e);
    }
    return INITIAL_SAMPLE_TRANSACTIONS;
  });

  // 2. Category budgets state (custom overrides for default budgets)
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading stored budgets:', e);
    }
    // initialize from defaults
    const initialMap: Record<string, number> = {};
    DEFAULT_EXPENSE_CATEGORIES.forEach((cat) => {
      initialMap[cat.id] = cat.defaultMonthlyBudget;
    });
    return initialMap;
  });

  // 3. Currency state
  const [currencyCode, setCurrencyCode] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENCY) || 'USD';
    } catch {
      return 'USD';
    }
  });

  // 4. View navigation
  const [currentTab, setCurrentTab] = useState<ViewTab>('overview');

  // 5. Selected Month Period ('2026-10' | '2026-09' | 'all')
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');

  // 6. Modal controls
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [budgetModalCategory, setBudgetModalCategory] = useState<Category | null>(null);
  const [isStudioModalOpen, setIsStudioModalOpen] = useState(false);

  // 7. Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(categoryBudgets));
    } catch (e) {
      console.error('Failed to save budgets', e);
    }
  }, [categoryBudgets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, currencyCode);
    } catch (e) {
      console.error('Failed to save currency', e);
    }
  }, [currencyCode]);

  const activeCurrency = CURRENCIES.find((c) => c.code === currencyCode) || CURRENCIES[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Calculations
  const expenseCategories = DEFAULT_EXPENSE_CATEGORIES;
  const allCategories = ALL_DEFAULT_CATEGORIES;

  const summaries = calculateExpenseSummaries(
    transactions,
    expenseCategories,
    categoryBudgets,
    selectedMonth
  );

  const monthlyTotals = calculateMonthlyTotals(
    transactions,
    expenseCategories,
    categoryBudgets,
    selectedMonth
  );

  // Available months from transactions
  const availableMonths = React.useMemo(() => {
    const set = new Set<string>();
    // Always include current month
    set.add('2026-10');
    transactions.forEach((t) => {
      if (t.date && t.date.length >= 7) {
        set.add(t.date.slice(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [transactions]);

  // Transaction CRUD handlers
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === existingId
            ? {
                ...t,
                ...txData,
              }
            : t
        )
      );
      showToast('Transaction successfully updated');
    } else {
      const newTx: Transaction = {
        ...txData,
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: Date.now(),
      };
      setTransactions((prev) => [newTx, ...prev]);
      showToast('Transaction recorded successfully');
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Transaction deleted');
  };

  const handleApplyPreset = (preset: QuickPreset) => {
    const today = new Date().toISOString().slice(0, 10);
    const newTx: Transaction = {
      id: `tx-preset-${Date.now()}`,
      type: preset.type,
      title: preset.title,
      amount: preset.amount,
      categoryId: preset.categoryId,
      date: today,
      paymentMethod: preset.paymentMethod,
      createdAt: Date.now(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Quick recorded: ${preset.title} (+${activeCurrency.symbol}${preset.amount})`);
  };

  // Budget Limit handlers
  const handleSaveBudgetLimit = (categoryId: string, newLimit: number) => {
    setCategoryBudgets((prev) => ({
      ...prev,
      [categoryId]: newLimit,
    }));
    showToast('Category budget limit adjusted');
  };

  const handleResetAllBudgets = () => {
    const defaultsMap: Record<string, number> = {};
    DEFAULT_EXPENSE_CATEGORIES.forEach((cat) => {
      defaultsMap[cat.id] = cat.defaultMonthlyBudget;
    });
    setCategoryBudgets(defaultsMap);
    showToast('All category budgets reset to defaults');
  };

  const handleResetSampleData = () => {
    setTransactions(INITIAL_SAMPLE_TRANSACTIONS);
    const defaultsMap: Record<string, number> = {};
    DEFAULT_EXPENSE_CATEGORIES.forEach((cat) => {
      defaultsMap[cat.id] = cat.defaultMonthlyBudget;
    });
    setCategoryBudgets(defaultsMap);
    showToast('Sample financial data & default budgets restored');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. Header (Adhering to Top Bar Contract) */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
        onOpenStudioModal={() => setIsStudioModalOpen(true)}
      />

      {/* 2. Global Context Bar: Month Filter + Currency Selector + Reset Action */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Month Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5" /> Period:
            </span>
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
              {availableMonths.map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(m)}
                  className={`px-2.5 py-1 font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                    selectedMonth === m
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {getMonthName(m)}
                </button>
              ))}
              <button
                onClick={() => setSelectedMonth('all')}
                className={`px-2.5 py-1 font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  selectedMonth === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Records
              </button>
            </div>
          </div>

          {/* Right Tools: Currency & Reset */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Currency:</span>
              <select
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-800 font-semibold focus:outline-hidden focus:border-slate-800 cursor-pointer"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleResetSampleData}
              className="text-slate-500 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
              title="Restore sample demo data"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset Demo Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Content Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {currentTab === 'overview' && (
          <DashboardOverview
            transactions={transactions}
            categories={allCategories}
            summaries={summaries}
            selectedMonth={selectedMonth}
            currencySymbol={activeCurrency.symbol}
            totalIncome={monthlyTotals.totalIncome}
            totalExpense={monthlyTotals.totalExpense}
            totalBudget={monthlyTotals.totalBudget}
            netSavings={monthlyTotals.netSavings}
            savingsRate={monthlyTotals.savingsRate}
            budgetUsedPercent={monthlyTotals.budgetUsedPercent}
            budgetRemaining={monthlyTotals.budgetRemaining}
            presets={DEFAULT_PRESETS}
            onApplyPreset={handleApplyPreset}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
            onOpenEditModal={(tx) => {
              setEditingTransaction(tx);
              setIsAddModalOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
            onNavigateToTab={(tab) => setCurrentTab(tab)}
            onEditBudget={(cat) => setBudgetModalCategory(cat)}
            onOpenStudioModal={() => setIsStudioModalOpen(true)}
          />
        )}

        {currentTab === 'budget' && (
          <BudgetManager
            categories={allCategories}
            summaries={summaries}
            totalBudget={monthlyTotals.totalBudget}
            totalExpense={monthlyTotals.totalExpense}
            totalIncome={monthlyTotals.totalIncome}
            currencySymbol={activeCurrency.symbol}
            onEditBudget={(cat) => setBudgetModalCategory(cat)}
            onResetAllBudgets={handleResetAllBudgets}
          />
        )}

        {currentTab === 'transactions' && (
          <TransactionLedger
            transactions={transactions}
            categories={allCategories}
            currencySymbol={activeCurrency.symbol}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
            onOpenEditModal={(tx) => {
              setEditingTransaction(tx);
              setIsAddModalOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsCharts
            transactions={transactions}
            categories={allCategories}
            summaries={summaries}
            currencySymbol={activeCurrency.symbol}
            selectedMonth={selectedMonth}
            totalIncome={monthlyTotals.totalIncome}
            totalExpense={monthlyTotals.totalExpense}
            totalBudget={monthlyTotals.totalBudget}
            netSavings={monthlyTotals.netSavings}
            savingsRate={monthlyTotals.savingsRate}
            onEditBudget={(cat) => setBudgetModalCategory(cat)}
          />
        )}
      </main>

      {/* 4. Modals */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        categories={allCategories}
        currencySymbol={activeCurrency.symbol}
        initialTransaction={editingTransaction}
      />

      <BudgetModal
        isOpen={!!budgetModalCategory}
        onClose={() => setBudgetModalCategory(null)}
        category={budgetModalCategory}
        currentBudget={
          budgetModalCategory
            ? categoryBudgets[budgetModalCategory.id] ?? budgetModalCategory.defaultMonthlyBudget
            : 0
        }
        currentSpent={
          budgetModalCategory
            ? summaries.find((s) => s.category.id === budgetModalCategory.id)?.spent || 0
            : 0
        }
        currencySymbol={activeCurrency.symbol}
        onSaveBudget={handleSaveBudgetLimit}
      />

      {/* Studio Attribution & About Modal */}
      <StudioAttributionModal
        isOpen={isStudioModalOpen}
        onClose={() => setIsStudioModalOpen(false)}
        onNavigateToTab={(tab) => {
          setCurrentTab(tab);
          setIsStudioModalOpen(false);
        }}
      />

      {/* 5. Minimalist Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 6. Clean Footer with Studio Attribution */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-amber-300 flex items-center justify-center font-bold text-xs shadow-2xs">
                N
              </div>
              <div className="text-center sm:text-left">
                <span className="font-semibold text-slate-900 text-xs block sm:inline">
                  Developed by NirviAura Publishing and Learning Studio
                </span>
                <span className="hidden sm:inline text-slate-400 mx-2">·</span>
                <span className="text-slate-500 text-[11px] block sm:inline">
                  Cashflow Pro · Personal Finance & Budget Control
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <button
                onClick={() => setIsStudioModalOpen(true)}
                className="text-slate-700 hover:text-slate-900 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
              >
                About Studio & Architecture
              </button>
              <span className="text-slate-300">·</span>
              <span className="text-slate-400 font-mono text-[11px]">Font: Aptos</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <span>© 2026 NirviAura Publishing and Learning Studio. All rights reserved.</span>
            <span>Client-side local storage · Instant CSV export · High-clarity financial tracking</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
