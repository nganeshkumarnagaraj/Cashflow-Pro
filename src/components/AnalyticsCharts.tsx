import React, { useState } from 'react';
import { Transaction, Category } from '../types/finance';
import { CategorySummary, formatCurrency } from '../utils/formatters';
import { CategoryDonutChart } from './charts/CategoryDonutChart';
import { BudgetVarianceBarChart } from './charts/BudgetVarianceBarChart';
import { CashFlowTrendChart } from './charts/CashFlowTrendChart';
import { CashFlowStreamVisualizer } from './charts/CashFlowStreamVisualizer';
import { CategoryIcon } from './CategoryIcon';
import {
  PieChart,
  BarChart3,
  TrendingUp,
  CreditCard,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface AnalyticsChartsProps {
  transactions: Transaction[];
  categories: Category[];
  summaries: CategorySummary[];
  currencySymbol: string;
  selectedMonth: string;
  totalIncome: number;
  totalExpense: number;
  totalBudget: number;
  netSavings: number;
  savingsRate: number;
  onEditBudget: (category: Category) => void;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  transactions,
  categories,
  summaries,
  currencySymbol,
  selectedMonth,
  totalIncome,
  totalExpense,
  totalBudget,
  netSavings,
  savingsRate,
  onEditBudget,
}) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  // Filter transactions for this month
  const monthTransactions = transactions.filter((t) =>
    selectedMonth === 'all' ? true : t.date.startsWith(selectedMonth)
  );

  // Top spending category
  const sortedSummaries = [...summaries].sort((a, b) => b.spent - a.spent);
  const highestCategory = sortedSummaries.length > 0 ? sortedSummaries[0] : null;

  // Categories over budget
  const overBudgetCategories = summaries.filter((s) => s.status === 'exceeded');
  const healthyCategories = summaries.filter((s) => s.status === 'safe' && s.spent > 0);

  return (
    <div className="space-y-8">
      {/* Top Banner / Metrics Overview */}
      <div className="p-6 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-white shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center shadow-xs">
                <PieChart className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Visual Financial Tracking & Analytics
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Color-coded category charts, variance diagnostics against default budgets, and daily velocity tracking calibrated by NirviAura Publishing and Learning Studio.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-slate-200/90 text-xs shadow-2xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                Net Cash Flow
              </span>
              <span
                className={`font-mono tabular-nums font-bold text-sm ${
                  netSavings >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {netSavings >= 0 ? '+' : ''}
                {formatCurrency(netSavings, currencySymbol)}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                Savings Rate
              </span>
              <span className="font-mono tabular-nums font-bold text-sm text-slate-900">
                {savingsRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cashflow Stream Waterfall */}
      <CashFlowStreamVisualizer
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        netSavings={netSavings}
        savingsRate={savingsRate}
        currencySymbol={currencySymbol}
        summaries={summaries}
      />

      {/* Chart Block 1: Color-Coded Donut Chart & Category Breakdown Table */}
      <div className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              1. Category Expense Allocation
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive color-coded donut ring showing exact percentage of total expenses
            </p>
          </div>
          <span className="text-xs text-slate-400">Hover slices to inspect</span>
        </div>

        <CategoryDonutChart
          summaries={summaries}
          currencySymbol={currencySymbol}
          totalExpense={totalExpense}
          selectedCategoryId={selectedCategoryFilter}
          onSelectCategory={(id) =>
            setSelectedCategoryFilter((prev) => (prev === id ? null : id))
          }
        />

        {/* Detailed Breakdown Table */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
            Category Spending Summary
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-2.5 font-medium">Category</th>
                  <th className="pb-2.5 font-medium text-right">Spent</th>
                  <th className="pb-2.5 font-medium text-right">% of Expense</th>
                  <th className="pb-2.5 font-medium text-right">Budget Limit</th>
                  <th className="pb-2.5 font-medium text-right">Remaining</th>
                  <th className="pb-2.5 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedSummaries.map((s) => {
                  const shareOfExpense =
                    totalExpense > 0 ? ((s.spent / totalExpense) * 100).toFixed(1) : '0.0';

                  return (
                    <tr
                      key={s.category.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        selectedCategoryFilter === s.category.id ? 'bg-slate-50' : ''
                      }`}
                    >
                      <td className="py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-xs shrink-0"
                            style={{ backgroundColor: s.category.color }}
                          />
                          <span className="font-semibold text-slate-900">{s.category.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums font-bold text-slate-900">
                        {formatCurrency(s.spent, currencySymbol)}
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-slate-600">
                        {shareOfExpense}%
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-slate-500">
                        {formatCurrency(s.budget, currencySymbol)}
                      </td>
                      <td
                        className={`py-2.5 text-right font-mono tabular-nums font-semibold ${
                          s.status === 'exceeded' ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {s.remaining < 0
                          ? `-${formatCurrency(Math.abs(s.remaining), currencySymbol)}`
                          : formatCurrency(s.remaining, currencySymbol)}
                      </td>
                      <td className="py-2.5 text-right whitespace-nowrap">
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                            s.status === 'exceeded'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : s.status === 'warning'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {s.status === 'exceeded'
                            ? 'Over limit'
                            : s.status === 'warning'
                            ? 'Warning (≥80%)'
                            : 'Within budget'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Chart Block 2: Budget vs. Actual Variance Diagnostics */}
      <div className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              2. Budget vs. Actual Utilization
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Visual bar benchmarks tracking real spending against each default budget allowance
            </p>
          </div>
          <span className="text-xs text-slate-400">
            Total Cap: {formatCurrency(totalBudget, currencySymbol)}
          </span>
        </div>

        <BudgetVarianceBarChart
          summaries={summaries}
          currencySymbol={currencySymbol}
          onEditBudget={onEditBudget}
        />
      </div>

      {/* Chart Block 3: Daily Spending Velocity & Payment Channels */}
      <div className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              3. Daily Velocity & Payment Channels
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Day-by-day cash outflows and payment distribution
            </p>
          </div>
          <span className="text-xs text-slate-400">
            {monthTransactions.length} records tracked
          </span>
        </div>

        <CashFlowTrendChart
          transactions={transactions}
          categories={categories}
          currencySymbol={currencySymbol}
          selectedMonth={selectedMonth}
        />
      </div>

      {/* Smart Financial Insights & Actionable Feedback */}
      <div className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Automated Financial Insights
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Insight 1: Dominant Category */}
          <div className="p-4 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/70 to-white shadow-2xs">
            <span className="font-bold text-amber-950 block mb-1 uppercase tracking-wider text-[11px]">
              Top Expense Driver
            </span>
            <p className="text-slate-700 leading-relaxed">
              {highestCategory ? (
                <>
                  <strong className="text-slate-900">{highestCategory.category.name}</strong> accounts for{' '}
                  <strong className="font-mono text-amber-800">{((highestCategory.spent / totalExpense) * 100).toFixed(1)}%</strong>{' '}
                  of all monthly expenses ({formatCurrency(highestCategory.spent, currencySymbol)}).
                </>
              ) : (
                'No expenses logged yet.'
              )}
            </p>
          </div>

          {/* Insight 2: Over Budget Alerts */}
          <div
            className={`p-4 rounded-xl border shadow-2xs ${
              overBudgetCategories.length > 0
                ? 'border-rose-200 bg-gradient-to-br from-rose-50/70 to-white'
                : 'border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-white'
            }`}
          >
            <span
              className={`font-bold block mb-1 uppercase tracking-wider text-[11px] ${
                overBudgetCategories.length > 0 ? 'text-rose-950' : 'text-emerald-950'
              }`}
            >
              Budget Compliance
            </span>
            <p className="text-slate-700 leading-relaxed">
              {overBudgetCategories.length > 0 ? (
                <span className="text-rose-700">
                  <AlertTriangle className="w-3.5 h-3.5 inline mr-1 text-rose-500" />
                  {overBudgetCategories.length} {overBudgetCategories.length === 1 ? 'category exceeds' : 'categories exceed'} its target limit. Consider rebalancing discretionary allocations.
                </span>
              ) : (
                <span className="text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-emerald-500" />
                  All active expense categories are currently within their monthly budget limits. Excellent financial discipline!
                </span>
              )}
            </p>
          </div>

          {/* Insight 3: Net Savings Velocity */}
          <div className="p-4 rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 to-white shadow-2xs">
            <span className="font-bold text-indigo-950 block mb-1 uppercase tracking-wider text-[11px]">
              Capital Retention Rate
            </span>
            <p className="text-slate-700 leading-relaxed">
              You are retaining <strong className="font-mono text-indigo-700 font-bold">{savingsRate.toFixed(1)}%</strong> of gross monthly income as net savings. Recommended standard is at least 20% for emergency reserves and compound wealth growth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
