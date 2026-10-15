import React, { useState } from 'react';
import { Transaction, Category, QuickPreset } from '../types/finance';
import {
  formatCurrency,
  CategorySummary,
  formatDate,
} from '../utils/formatters';
import { CategoryDonutChart } from './charts/CategoryDonutChart';
import { BudgetVarianceBarChart } from './charts/BudgetVarianceBarChart';
import { CategoryIcon } from './CategoryIcon';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  AlertTriangle,
  ArrowRight,
  Zap,
  Edit3,
  Trash2,
  BookOpen,
  Info,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react';

interface DashboardOverviewProps {
  transactions: Transaction[];
  categories: Category[];
  summaries: CategorySummary[];
  selectedMonth: string;
  currencySymbol: string;
  totalIncome: number;
  totalExpense: number;
  totalBudget: number;
  netSavings: number;
  savingsRate: number;
  budgetUsedPercent: number;
  budgetRemaining: number;
  presets: QuickPreset[];
  onApplyPreset: (preset: QuickPreset) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onNavigateToTab: (tab: 'budget' | 'transactions' | 'analytics') => void;
  onEditBudget: (category: Category) => void;
  onOpenStudioModal?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  transactions,
  categories,
  summaries,
  selectedMonth,
  currencySymbol,
  totalIncome,
  totalExpense,
  totalBudget,
  netSavings,
  savingsRate,
  budgetUsedPercent,
  budgetRemaining,
  presets,
  onApplyPreset,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteTransaction,
  onNavigateToTab,
  onEditBudget,
  onOpenStudioModal,
}) => {
  const [showStudioGuide, setShowStudioGuide] = useState(true);
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Find categories over budget or warning
  const warningCategories = summaries.filter(
    (s) => s.status === 'exceeded' || s.status === 'warning'
  );

  // Recent 5 transactions in selected period
  const monthTransactions = transactions
    .filter((t) => (selectedMonth === 'all' ? true : t.date.startsWith(selectedMonth)))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt)
    .slice(0, 5);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Studio Banner & User-Friendly Onboarding Card */}
      {showStudioGuide && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Cashflow Pro
                  </h2>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    Developed by NirviAura Publishing and Learning Studio
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  Personal budgeting designed for clarity, intentional habits, and peace of mind. Monitor expenses with preset category limits, track real-time variance, and keep full control of your cash flow.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              {onOpenStudioModal && (
                <button
                  onClick={onOpenStudioModal}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  About Studio
                </button>
              )}
              <button
                onClick={() => setShowStudioGuide(false)}
                className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                title="Dismiss guide"
              >
                Dismiss
              </button>
            </div>
          </div>

          {/* 3 Quick User-Friendly Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 block">Default Limits</span>
                <span className="text-slate-500">Preset monthly caps customizable in one click.</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 block">Variance Warnings</span>
                <span className="text-slate-500">Color-coded alerts when expenses cross 85%.</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 block">1-Click Presets</span>
                <span className="text-slate-500">Instant shortcuts for coffee, groceries, & bills.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income Card */}
        <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Income
            </span>
            <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {formatCurrency(totalIncome, currencySymbol)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="text-emerald-600 font-semibold">Active cash flow</span>
            <span>·</span>
            <span>{selectedMonth === 'all' ? 'All records' : 'This month'}</span>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Expenses
            </span>
            <div className="w-7 h-7 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {formatCurrency(totalExpense, currencySymbol)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="font-mono tabular-nums">
              {budgetUsedPercent.toFixed(0)}% of monthly budget
            </span>
          </div>
        </div>

        {/* Budget Limit Card */}
        <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Budget Limit
            </span>
            <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {formatCurrency(totalBudget, currencySymbol)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span
              className={`font-semibold font-mono tabular-nums ${
                budgetRemaining < 0 ? 'text-rose-600' : 'text-slate-600'
              }`}
            >
              {budgetRemaining < 0
                ? `${formatCurrency(Math.abs(budgetRemaining), currencySymbol)} over limit`
                : `${formatCurrency(budgetRemaining, currencySymbol)} remaining buffer`}
            </span>
          </div>
        </div>

        {/* Net Savings Card */}
        <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Net Savings
            </span>
            <div
              className={`w-7 h-7 rounded-md flex items-center justify-center ${
                netSavings >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}
            >
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl font-bold tracking-tight font-mono tabular-nums ${
              netSavings >= 0 ? 'text-slate-900' : 'text-rose-600'
            }`}
          >
            {formatCurrency(netSavings, currencySymbol)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span
              className={`font-semibold font-mono tabular-nums ${
                savingsRate >= 20 ? 'text-emerald-600' : savingsRate >= 0 ? 'text-amber-600' : 'text-rose-600'
              }`}
            >
              {savingsRate.toFixed(1)}% savings rate
            </span>
          </div>
        </div>
      </div>

      {/* Warning Notice if any category exceeded */}
      {warningCategories.length > 0 && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Budget Limit Warning
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                {warningCategories.length} {warningCategories.length === 1 ? 'category is' : 'categories are'}{' '}
                approaching or exceeding monthly targets:{' '}
                {warningCategories.map((c) => c.category.name).join(', ')}.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab('budget')}
            className="text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg border border-amber-300 transition-colors whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            Review Budgets
          </button>
        </div>
      )}

      {/* Quick 1-Click Logging Shortcuts */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Instant Quick Presets (1-Click Record)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Click to log common item instantly</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => onApplyPreset(preset)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>+ {preset.label}</span>
              <span className="font-mono tabular-nums text-slate-500 text-[11px]">
                ({formatCurrency(preset.amount, currencySymbol)})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Split: Color-Coded Donut Chart + Budget Variance Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Color-coded Donut Chart */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-xl border border-slate-200 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Expense Category Distribution
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Color-coded visual breakdown of where your money goes
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('analytics')}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                Full Analytics <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <CategoryDonutChart
              summaries={summaries}
              currencySymbol={currencySymbol}
              totalExpense={totalExpense}
            />
          </div>
        </div>

        {/* Right Column: Top Category Budget Trackers */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-xl border border-slate-200 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Category Budgets vs. Actual
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visual progress bars against default and customized limits
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('budget')}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                Manage All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Display top 5 categories by spent or budget */}
            <BudgetVarianceBarChart
              summaries={summaries.slice(0, 5)}
              currencySymbol={currencySymbol}
              onEditBudget={onEditBudget}
            />
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest financial activity recorded in this billing cycle
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAddModal}
              className="text-xs font-semibold text-slate-900 hover:text-slate-700 cursor-pointer"
            >
              + New Entry
            </button>
            <button
              onClick={() => onNavigateToTab('transactions')}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              View All ({monthTransactions.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {monthTransactions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            No transactions in this period. Use the quick presets or click Add Transaction.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-2.5 font-medium">Date</th>
                  <th className="pb-2.5 font-medium">Category</th>
                  <th className="pb-2.5 font-medium">Description</th>
                  <th className="pb-2.5 font-medium">Payment</th>
                  <th className="pb-2.5 font-medium text-right">Amount</th>
                  <th className="pb-2.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthTransactions.map((tx) => {
                  const cat = categoryMap.get(tx.categoryId);
                  const isExpense = tx.type === 'expense';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 text-slate-500 font-mono whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: cat ? `${cat.color}20` : '#f1f5f9',
                              color: cat ? cat.color : '#64748b',
                            }}
                          >
                            <CategoryIcon name={cat?.iconName || 'DollarSign'} className="w-3 h-3" />
                          </div>
                          <span className="font-medium text-slate-900">
                            {cat?.name || tx.categoryId}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-slate-700 max-w-xs truncate font-medium">
                        {tx.title}
                      </td>
                      <td className="py-3 text-slate-500 whitespace-nowrap">
                        {tx.paymentMethod}
                      </td>
                      <td className="py-3 text-right font-mono tabular-nums font-bold whitespace-nowrap">
                        <span className={isExpense ? 'text-rose-600' : 'text-emerald-600'}>
                          {isExpense ? '-' : '+'}
                          {formatCurrency(tx.amount, currencySymbol)}
                        </span>
                      </td>
                      <td className="py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenEditModal(tx)}
                            className="p-1 text-slate-400 hover:text-slate-800 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
