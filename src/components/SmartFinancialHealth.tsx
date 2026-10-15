import React from 'react';
import { CategorySummary, formatCurrency } from '../utils/formatters';
import { ShieldCheck, TrendingUp, AlertCircle, Sparkles, Flame, CheckCircle2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SmartFinancialHealthProps {
  totalIncome: number;
  totalExpense: number;
  totalBudget: number;
  netSavings: number;
  savingsRate: number;
  currencySymbol: string;
  summaries: CategorySummary[];
  selectedMonth: string;
}

export const SmartFinancialHealth: React.FC<SmartFinancialHealthProps> = ({
  totalIncome,
  totalExpense,
  totalBudget,
  netSavings,
  savingsRate,
  currencySymbol,
  summaries,
  selectedMonth,
}) => {
  // Compute smart financial score (0-100)
  // 1. Savings Score (max 40 pts): 20%+ savings = 40 pts
  const savingsScore = Math.min(40, Math.max(0, savingsRate * 2));

  // 2. Budget Discipline Score (max 40 pts): Spent <= Budget = 40 pts, decreases as spent exceeds budget
  const budgetRatio = totalBudget > 0 ? totalExpense / totalBudget : 1;
  const budgetScore = budgetRatio <= 1 ? 40 : Math.max(0, 40 - (budgetRatio - 1) * 80);

  // 3. Category Balance Score (max 20 pts): based on how many categories are within limits
  const expenseSummaries = summaries.filter((s) => s.category.type === 'expense');
  const safeCategoriesCount = expenseSummaries.filter((s) => s.status !== 'exceeded').length;
  const categoryScore = expenseSummaries.length > 0 ? (safeCategoriesCount / expenseSummaries.length) * 20 : 20;

  const totalScore = Math.round(savingsScore + budgetScore + categoryScore);

  // Status configuration
  let statusLabel = 'Thriving';
  let statusColor = 'text-emerald-600';
  let statusBg = 'bg-emerald-50 border-emerald-200';
  let strokeColor = '#10B981';

  if (totalScore < 60) {
    statusLabel = 'Needs Attention';
    statusColor = 'text-rose-600';
    statusBg = 'bg-rose-50 border-rose-200';
    strokeColor = '#EF4444';
  } else if (totalScore < 80) {
    statusLabel = 'Balanced & Good';
    statusColor = 'text-amber-600';
    statusBg = 'bg-amber-50 border-amber-200';
    strokeColor = '#F59E0B';
  }

  // Daily burn rate calculation (assuming 30-day month)
  const daysInCycle = 30;
  const currentDayEstimate = Math.min(28, Math.max(1, new Date().getDate()));
  const dailyBurnRate = currentDayEstimate > 0 ? totalExpense / currentDayEstimate : totalExpense / 30;
  const projectedMonthExpense = dailyBurnRate * daysInCycle;
  const projectedBuffer = totalBudget - projectedMonthExpense;

  // Categories pacing highest
  const topSpenders = [...summaries]
    .filter((s) => s.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 3);

  // SVG Gauge calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (totalScore / 100) * circumference;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs relative overflow-hidden">
      {/* Decorative ambient gradient backdrop */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-gradient-to-bl from-indigo-100/50 via-emerald-100/30 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Smart Financial Diagnostics & Health Score
              </h3>
              <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full border ${statusBg} ${statusColor}`}>
                {statusLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live algorithmic assessment of cash velocity, category limits, and retained wealth
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time analysis · {selectedMonth === 'all' ? 'All records' : selectedMonth}</span>
        </div>
      </div>

      {/* 4 Interactive Visual Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
        {/* Pillar 1: Health Score Circular Ring */}
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Health Index
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
              {totalScore}<span className="text-sm font-normal text-slate-400">/100</span>
            </div>
            <span className={`text-[11px] font-semibold mt-1 block ${statusColor}`}>
              {statusLabel}
            </span>
          </div>

          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-200"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={strokeColor}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute font-bold text-xs font-mono text-slate-800">
              {totalScore}%
            </div>
          </div>
        </div>

        {/* Pillar 2: Daily Burn Rate & Velocity */}
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              <span>Daily Burn Rate</span>
              <Flame className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">
              {formatCurrency(dailyBurnRate, currencySymbol)}<span className="text-xs font-normal text-slate-400">/day</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Projected month:</span>
            <span className="font-mono font-semibold text-slate-700">
              {formatCurrency(projectedMonthExpense, currencySymbol)}
            </span>
          </div>
        </div>

        {/* Pillar 3: Savings Cushion & Velocity */}
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              <span>Savings Retained</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
              {savingsRate.toFixed(1)}%
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Net Surplus:</span>
            <span className={`font-mono font-semibold ${netSavings >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatCurrency(netSavings, currencySymbol)}
            </span>
          </div>
        </div>

        {/* Pillar 4: Buffer Safety Pace */}
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              <span>Budget Buffer</span>
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className={`text-xl font-bold font-mono mt-1 ${totalBudget - totalExpense >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
              {formatCurrency(totalBudget - totalExpense, currencySymbol)}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Discipline state:</span>
            <span className="font-semibold text-slate-700">
              {safeCategoriesCount}/{expenseSummaries.length} categories safe
            </span>
          </div>
        </div>
      </div>

      {/* Smart Quick Insights Pill Bar */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">Top Outlays:</span>
          <div className="flex flex-wrap gap-1.5">
            {topSpenders.map((item) => (
              <span
                key={item.category.id}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1 border border-slate-200"
                style={{
                  backgroundColor: `${item.category.color}10`,
                  color: item.category.color,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.category.color }} />
                <span>{item.category.name}:</span>
                <span className="font-mono font-bold">{formatCurrency(item.spent, currencySymbol)}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Calibrated against NirviAura 50/30/20 standard</span>
        </div>
      </div>
    </div>
  );
};
