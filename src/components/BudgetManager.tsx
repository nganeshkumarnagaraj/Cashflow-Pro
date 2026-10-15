import React from 'react';
import { Category } from '../types/finance';
import { CategorySummary, formatCurrency } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import {
  Wallet,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  Sliders,
} from 'lucide-react';

interface BudgetManagerProps {
  categories: Category[];
  summaries: CategorySummary[];
  totalBudget: number;
  totalExpense: number;
  totalIncome: number;
  currencySymbol: string;
  onEditBudget: (category: Category) => void;
  onResetAllBudgets: () => void;
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({
  categories,
  summaries,
  totalBudget,
  totalExpense,
  totalIncome,
  currencySymbol,
  onEditBudget,
  onResetAllBudgets,
}) => {
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  // Calculate 50/30/20 breakdown based on categories
  // Needs: housing, groceries, utilities, transport, healthcare
  // Wants: dining, entertainment, shopping, education, misc
  const needsIds = ['housing', 'groceries', 'utilities', 'transport', 'healthcare'];
  const wantsIds = ['dining', 'entertainment', 'shopping', 'education', 'misc'];

  const needsSpent = summaries
    .filter((s) => needsIds.includes(s.category.id))
    .reduce((sum, s) => sum + s.spent, 0);

  const wantsSpent = summaries
    .filter((s) => wantsIds.includes(s.category.id))
    .reduce((sum, s) => sum + s.spent, 0);

  const savingsActual = Math.max(0, totalIncome - totalExpense);

  const baseDenominator = totalIncome > 0 ? totalIncome : totalExpense || 1;
  const needsPercent = ((needsSpent / baseDenominator) * 100).toFixed(0);
  const wantsPercent = ((wantsSpent / baseDenominator) * 100).toFixed(0);
  const savingsPercent = ((savingsActual / baseDenominator) * 100).toFixed(0);

  return (
    <div className="space-y-8">
      {/* Top Banner: Total Monthly Budget Allocation */}
      <div className="p-6 rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-slate-800" />
              <h2 className="text-lg font-bold text-slate-900">
                Monthly Budget Architecture
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Each expense category is provisioned with a default baseline budget calibrated to typical living costs by NirviAura Publishing and Learning Studio. You can personalize any limit to match your lifestyle goals.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onResetAllBudgets}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              Reset All to Defaults
            </button>
          </div>
        </div>

        {/* Global Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Cumulative Expense Cap
            </span>
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 block mt-1">
              {formatCurrency(totalBudget, currencySymbol)}
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block">
              Sum of {expenseCategories.length} category caps
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Current Month Spent
            </span>
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 block mt-1">
              {formatCurrency(totalExpense, currencySymbol)}
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block font-mono tabular-nums">
              {totalBudget > 0 ? ((totalExpense / totalBudget) * 100).toFixed(1) : 0}% of allocation
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Unallocated Room
            </span>
            <span
              className={`text-2xl font-bold font-mono tabular-nums block mt-1 ${
                totalBudget - totalExpense < 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {totalBudget - totalExpense < 0
                ? `-${formatCurrency(Math.abs(totalBudget - totalExpense), currencySymbol)}`
                : formatCurrency(totalBudget - totalExpense, currencySymbol)}
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block">
              {totalBudget - totalExpense < 0 ? 'Exceeding budget limit' : 'Safe buffer balance'}
            </span>
          </div>
        </div>
      </div>

      {/* 50 / 30 / 20 Rule Analysis Widget */}
      <div className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              50 / 30 / 20 Budget Rule Check
            </h3>
            <span className="text-xs text-slate-400">(Gold Standard Model)</span>
          </div>
          <span className="text-xs text-slate-500">Benchmark against monthly income</span>
        </div>

        {/* 3 Strip Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/60">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-800">Essential Needs (50% target)</span>
              <span className="font-mono tabular-nums font-bold text-slate-900">{needsPercent}%</span>
            </div>
            <div className="text-[11px] text-slate-500 mb-2">
              Housing, Groceries, Utilities, Transit, Health
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(Number(needsPercent), 100)}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-1.5 text-right tabular-nums">
              {formatCurrency(needsSpent, currencySymbol)}
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/60">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-800">Discretionary Wants (30% target)</span>
              <span className="font-mono tabular-nums font-bold text-slate-900">{wantsPercent}%</span>
            </div>
            <div className="text-[11px] text-slate-500 mb-2">
              Dining, Entertainment, Shopping, Hobbies
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(Number(wantsPercent), 100)}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-1.5 text-right tabular-nums">
              {formatCurrency(wantsSpent, currencySymbol)}
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/60">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-800">Savings & Surplus (20% target)</span>
              <span className="font-mono tabular-nums font-bold text-emerald-700">{savingsPercent}%</span>
            </div>
            <div className="text-[11px] text-slate-500 mb-2">
              Retained capital and investments
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(Number(savingsPercent), 100)}%` }}
              />
            </div>
            <div className="text-[11px] text-emerald-700 font-mono mt-1.5 text-right tabular-nums font-semibold">
              {formatCurrency(savingsActual, currencySymbol)}
            </div>
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Expense Categories & Default Allocations
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click &quot;Edit Limit&quot; on any card to tailor the allowance to your exact needs
            </p>
          </div>
          <span className="text-xs text-slate-500">
            {summaries.length} Categories configured
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summaries.map((summary) => {
            const { category, budget, spent, remaining, percentUsed, status, transactionCount } = summary;
            const isOverBudget = status === 'exceeded';
            const isDefault = budget === category.defaultMonthlyBudget;

            return (
              <div
                key={category.id}
                className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Icon & Edit Button */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                        style={{
                          backgroundColor: `${category.color}15`,
                          color: category.color,
                        }}
                      >
                        <CategoryIcon name={category.iconName} className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">
                            {category.name}
                          </h4>
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: category.color }}
                            title={`Category theme color: ${category.color}`}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {category.description}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onEditBudget(category)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-md transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Sliders className="w-3 h-3 text-slate-500" />
                      Edit Limit
                    </button>
                  </div>

                  {/* Amounts row */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Monthly Limit</span>
                      <span className="font-mono tabular-nums font-bold text-slate-900 text-sm">
                        {formatCurrency(budget, currencySymbol)}
                      </span>
                      {!isDefault && (
                        <span className="text-[10px] text-blue-600 block mt-0.5">
                          Customized
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Spent so far</span>
                      <span className="font-mono tabular-nums font-bold text-slate-900 text-sm">
                        {formatCurrency(spent, currencySymbol)}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {transactionCount} {transactionCount === 1 ? 'record' : 'records'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Balance</span>
                      <span
                        className={`font-mono tabular-nums font-bold text-sm block ${
                          isOverBudget ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {isOverBudget
                          ? `-${formatCurrency(Math.abs(remaining), currencySymbol)}`
                          : formatCurrency(remaining, currencySymbol)}
                      </span>
                      <span
                        className={`text-[10px] font-semibold block mt-0.5 ${
                          isOverBudget ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {isOverBudget ? 'Over Budget' : 'Within Budget'}
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-3 relative">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(percentUsed, 100)}%`,
                        backgroundColor: isOverBudget ? '#E11D48' : category.color,
                      }}
                    />
                  </div>
                </div>

                {/* Footer notes */}
                <div className="flex justify-between items-center text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-50 font-mono tabular-nums">
                  <span>{percentUsed.toFixed(1)}% of allowance consumed</span>
                  <span>Default: {formatCurrency(category.defaultMonthlyBudget, currencySymbol)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
