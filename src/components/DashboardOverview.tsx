import React, { useState } from 'react';
import { Transaction, Category, QuickPreset } from '../types/finance';
import {
  formatCurrency,
  CategorySummary,
  formatDate,
} from '../utils/formatters';
import { CategoryDonutChart } from './charts/CategoryDonutChart';
import { BudgetVarianceBarChart } from './charts/BudgetVarianceBarChart';
import { CashFlowStreamVisualizer } from './charts/CashFlowStreamVisualizer';
import { SmartFinancialHealth } from './SmartFinancialHealth';
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
  CheckCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
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
      {/* Studio Banner & Modern Guidance Card */}
      {showStudioGuide && (
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/60 via-purple-50/40 to-white p-5 sm:p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-amber-300 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Cashflow Pro
                  </h2>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs font-semibold text-indigo-700 bg-indigo-100/70 border border-indigo-200 px-2 py-0.5 rounded-full">
                    Developed by NirviAura Publishing and Learning Studio
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  Smart personal budget engine engineered with live category limit tracking, cloud Firestore sync, and algorithmic cash velocity metrics.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              {onOpenStudioModal && (
                <button
                  onClick={onOpenStudioModal}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
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

          {/* Quick Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-indigo-100/70 text-xs relative z-10">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 block">Preset Baseline Caps</span>
                <span className="text-slate-500">Living cost allocations ready out of the box.</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 block">Variance Radar</span>
                <span className="text-slate-500">Color-coded alerts when expenses cross 85%.</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 block">1-Click Presets</span>
                <span className="text-slate-500">Instant shortcuts for coffee, groceries, & bills.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4 Modern Vibrant KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income Card */}
        <div className="p-5 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-white shadow-xs hover:shadow-sm transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Total Inflow
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {formatCurrency(totalIncome, currencySymbol)}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-emerald-100">
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Active earnings
            </span>
            <span className="text-slate-400 font-medium">
              {selectedMonth === 'all' ? 'All records' : 'This cycle'}
            </span>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="p-5 rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-white shadow-xs hover:shadow-sm transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
              Total Outflow
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {formatCurrency(totalExpense, currencySymbol)}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-rose-100">
            <span className="text-rose-700 font-semibold font-mono">
              {budgetUsedPercent.toFixed(0)}% of limit
            </span>
            <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${budgetUsedPercent > 100 ? 'bg-rose-600' : 'bg-rose-500'}`}
                style={{ width: `${Math.min(budgetUsedPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Budget Limit Card */}
        <div className="p-5 rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-white shadow-xs hover:shadow-sm transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
              Monthly Cap
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {formatCurrency(totalBudget, currencySymbol)}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-blue-100">
            <span
              className={`font-semibold font-mono ${
                budgetRemaining < 0 ? 'text-rose-600' : 'text-blue-700'
              }`}
            >
              {budgetRemaining < 0
                ? `${formatCurrency(Math.abs(budgetRemaining), currencySymbol)} over`
                : `${formatCurrency(budgetRemaining, currencySymbol)} buffer`}
            </span>
            <span className="text-slate-400">Target allocation</span>
          </div>
        </div>

        {/* Net Savings Card */}
        <div className="p-5 rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-white shadow-xs hover:shadow-sm transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">
              Net Wealth Retained
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-bold tracking-tight font-mono tabular-nums ${
              netSavings >= 0 ? 'text-slate-900' : 'text-rose-600'
            }`}
          >
            {formatCurrency(netSavings, currencySymbol)}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-indigo-100">
            <span
              className={`font-bold font-mono ${
                savingsRate >= 20 ? 'text-emerald-600' : savingsRate >= 0 ? 'text-amber-600' : 'text-rose-600'
              }`}
            >
              {savingsRate.toFixed(1)}% savings rate
            </span>
            <span className="text-slate-400">Goal: 20%+</span>
          </div>
        </div>
      </div>

      {/* Smart Financial Health & Diagnostics Engine */}
      <SmartFinancialHealth
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        totalBudget={totalBudget}
        netSavings={netSavings}
        savingsRate={savingsRate}
        currencySymbol={currencySymbol}
        summaries={summaries}
        selectedMonth={selectedMonth}
      />

      {/* Smart Cashflow Stream & Allocation Waterfall (50/30/20 Visualizer) */}
      <CashFlowStreamVisualizer
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        netSavings={netSavings}
        savingsRate={savingsRate}
        currencySymbol={currencySymbol}
        summaries={summaries}
      />

      {/* Warning Notice if any category exceeded */}
      {warningCategories.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50/90 via-amber-50/50 to-white text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Category Variance Alert
              </h4>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                {warningCategories.length} {warningCategories.length === 1 ? 'category is' : 'categories are'}{' '}
                approaching or over limits:{' '}
                <strong className="text-amber-950">{warningCategories.map((c) => c.category.name).join(', ')}</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab('budget')}
            className="text-xs font-bold text-amber-950 bg-amber-200/80 hover:bg-amber-300 px-3.5 py-2 rounded-xl border border-amber-300 transition-colors whitespace-nowrap self-start sm:self-auto cursor-pointer shadow-2xs"
          >
            Adjust Limits
          </button>
        </div>
      )}

      {/* Quick 1-Click Logging Shortcuts with Colorful Tactile Chips */}
      <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              1-Click Fast Presets (Rapid Logging)
            </h3>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">Tap any shortcut to record instantly</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {presets.map((preset) => {
            const cat = categoryMap.get(preset.categoryId);
            const color = cat?.color || '#6366F1';
            return (
              <button
                key={preset.label}
                onClick={() => onApplyPreset(preset)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 hover:border-slate-300 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-2xs hover:scale-102"
              >
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${color}20`, color: color }}
                >
                  <CategoryIcon name={cat?.iconName || 'DollarSign'} className="w-3 h-3" />
                </div>
                <span>+ {preset.label}</span>
                <span className="font-mono tabular-nums text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200/60 text-[11px]">
                  {formatCurrency(preset.amount, currencySymbol)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Split: Color-Coded Donut Chart + Budget Variance Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Color-coded Donut Chart */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Expense Category Distribution
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vibrant breakdown of current spending allocations
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('analytics')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
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
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Category Budgets vs. Outflows
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time gradient progress bars against limits
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('budget')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
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

      {/* Recent Activity Table with Modern Colored Rows */}
      <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest financial activity recorded in this billing cycle
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAddModal}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              + New Entry
            </button>
            <button
              onClick={() => onNavigateToTab('transactions')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              View All ({monthTransactions.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {monthTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No transactions in this period. Use the fast presets or click Add Transaction.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium">Payment</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthTransactions.map((tx) => {
                  const cat = categoryMap.get(tx.categoryId);
                  const isExpense = tx.type === 'expense';
                  const color = cat?.color || '#64748b';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 text-slate-500 font-mono whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>
                      <td className="py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 shadow-2xs"
                            style={{
                              backgroundColor: `${color}18`,
                              color: color,
                            }}
                          >
                            <CategoryIcon name={cat?.iconName || 'DollarSign'} className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold text-slate-900">
                            {cat?.name || tx.categoryId}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-700 max-w-xs truncate font-medium">
                        {tx.title}
                      </td>
                      <td className="py-3.5 text-slate-500 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-mono tabular-nums font-bold whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-md ${
                            isExpense
                              ? 'text-rose-600 bg-rose-50'
                              : 'text-emerald-600 bg-emerald-50'
                          }`}
                        >
                          {isExpense ? '-' : '+'}
                          {formatCurrency(tx.amount, currencySymbol)}
                        </span>
                      </td>
                      <td className="py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenEditModal(tx)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
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
