import React from 'react';
import { CategorySummary, formatCurrency } from '../../utils/formatters';
import { TrendingUp, Shield, Sparkles, PiggyBank, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

interface CashFlowStreamVisualizerProps {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  currencySymbol: string;
  summaries: CategorySummary[];
}

export const CashFlowStreamVisualizer: React.FC<CashFlowStreamVisualizerProps> = ({
  totalIncome,
  totalExpense,
  netSavings,
  savingsRate,
  currencySymbol,
  summaries,
}) => {
  // Categorize into Needs vs Wants
  const needsIds = ['housing', 'groceries', 'utilities', 'transport', 'healthcare'];
  const wantsIds = ['dining', 'entertainment', 'shopping', 'education', 'misc'];

  const needsSpent = summaries
    .filter((s) => needsIds.includes(s.category.id))
    .reduce((sum, s) => sum + s.spent, 0);

  const wantsSpent = summaries
    .filter((s) => wantsIds.includes(s.category.id))
    .reduce((sum, s) => sum + s.spent, 0);

  const retainedSavings = Math.max(0, netSavings);

  const denominator = totalIncome > 0 ? totalIncome : totalExpense + retainedSavings || 1;
  const needsPct = Math.round((needsSpent / denominator) * 100);
  const wantsPct = Math.round((wantsSpent / denominator) * 100);
  const savingsPct = Math.round((retainedSavings / denominator) * 100);

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs relative overflow-hidden">
      {/* Background ambient color accents */}
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-gradient-to-r from-blue-100/30 via-purple-100/30 to-emerald-100/30 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Smart Cashflow Stream & Allocation Waterfall
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamic visual mapping of total incoming capital across Essential Needs, Lifestyle Wants, and Retained Savings
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Target Standard:</span>
          <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-mono text-[11px]">
            50% Needs / 30% Wants / 20% Wealth
          </span>
        </div>
      </div>

      {/* 3-Tone Smart Visual Segmented Stream Bar */}
      <div className="space-y-2 mb-6 relative z-10">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
          <span>Current Inflow Distribution Stream</span>
          <span className="font-mono tabular-nums text-slate-900">
            {formatCurrency(totalIncome, currencySymbol)} Inflow
          </span>
        </div>

        {/* Multi-gradient segmented track */}
        <div className="h-5 sm:h-6 w-full rounded-xl overflow-hidden flex bg-slate-100 shadow-inner p-0.5 border border-slate-200/80">
          {/* Needs Segment */}
          <div
            className="h-full rounded-l-lg bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700 relative group flex items-center justify-center text-[10px] font-bold text-white tracking-wide"
            style={{ width: `${Math.max(needsPct, 2)}%` }}
            title={`Needs: ${needsPct}% (${formatCurrency(needsSpent, currencySymbol)})`}
          >
            {needsPct >= 12 && <span>Needs {needsPct}%</span>}
          </div>

          {/* Wants Segment */}
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700 relative group flex items-center justify-center text-[10px] font-bold text-white tracking-wide"
            style={{ width: `${Math.max(wantsPct, 2)}%` }}
            title={`Wants: ${wantsPct}% (${formatCurrency(wantsSpent, currencySymbol)})`}
          >
            {wantsPct >= 12 && <span>Wants {wantsPct}%</span>}
          </div>

          {/* Retained Savings Segment */}
          <div
            className="h-full rounded-r-lg bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700 relative group flex items-center justify-center text-[10px] font-bold text-white tracking-wide"
            style={{ width: `${Math.max(savingsPct, 2)}%` }}
            title={`Savings: ${savingsPct}% (${formatCurrency(retainedSavings, currencySymbol)})`}
          >
            {savingsPct >= 12 && <span>Savings {savingsPct}%</span>}
          </div>
        </div>

        {/* Benchmark guide line below bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
          <div className="flex items-center gap-1.5 text-blue-600">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="font-semibold">Essentials & Needs</span>
            <span className="text-slate-400">({formatCurrency(needsSpent, currencySymbol)})</span>
          </div>

          <div className="flex items-center gap-1.5 text-amber-600">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="font-semibold">Lifestyle & Wants</span>
            <span className="text-slate-400">({formatCurrency(wantsSpent, currencySymbol)})</span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-semibold">Wealth Retained</span>
            <span className="text-slate-400">({formatCurrency(retainedSavings, currencySymbol)})</span>
          </div>
        </div>
      </div>

      {/* 3 Interactive Detailed Stream Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 relative z-10">
        {/* Needs Card */}
        <div className="p-4 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/80 via-blue-50/30 to-white">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-blue-900 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              1. Essential Needs
            </span>
            <span className={`text-[11px] font-bold font-mono px-1.5 py-0.2 rounded ${needsPct <= 50 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {needsPct}% / 50%
            </span>
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
            {formatCurrency(needsSpent, currencySymbol)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Housing, groceries, utilities, transport & medical health
          </p>
        </div>

        {/* Wants Card */}
        <div className="p-4 rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50/80 via-amber-50/30 to-white">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-amber-900 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              2. Lifestyle & Leisure
            </span>
            <span className={`text-[11px] font-bold font-mono px-1.5 py-0.2 rounded ${wantsPct <= 30 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {wantsPct}% / 30%
            </span>
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
            {formatCurrency(wantsSpent, currencySymbol)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Restaurants, shopping, entertainment & learning
          </p>
        </div>

        {/* Savings Card */}
        <div className="p-4 rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-emerald-50/30 to-white">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-emerald-900 flex items-center gap-1">
              <PiggyBank className="w-3.5 h-3.5 text-emerald-600" />
              3. Wealth Retained
            </span>
            <span className={`text-[11px] font-bold font-mono px-1.5 py-0.2 rounded ${savingsPct >= 20 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {savingsPct}% / 20%
            </span>
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
            {formatCurrency(retainedSavings, currencySymbol)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Surplus buffer available for investments, emergency fund & growth
          </p>
        </div>
      </div>
    </div>
  );
};
