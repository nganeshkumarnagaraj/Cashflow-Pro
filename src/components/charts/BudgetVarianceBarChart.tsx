import React from 'react';
import { CategorySummary, formatCurrency } from '../../utils/formatters';
import { CategoryIcon } from '../CategoryIcon';
import { AlertTriangle, CheckCircle2, AlertCircle, Sliders, ChevronRight } from 'lucide-react';

interface BudgetVarianceBarChartProps {
  summaries: CategorySummary[];
  currencySymbol: string;
  onEditBudget?: (category: CategorySummary['category']) => void;
}

export const BudgetVarianceBarChart: React.FC<BudgetVarianceBarChartProps> = ({
  summaries,
  currencySymbol,
  onEditBudget,
}) => {
  return (
    <div className="space-y-3.5">
      {summaries.map((item) => {
        const { category, budget, spent, remaining, percentUsed, status } = item;
        const cappedBarPercent = Math.min(percentUsed, 100);
        const isOverBudget = percentUsed > 100;

        // Gradient styling based on status
        let progressGradient = `linear-gradient(90deg, ${category.color} 0%, ${category.color} 100%)`;
        let statusBadge = (
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-100">
            <CheckCircle2 className="w-3 h-3" />
            <span>Optimal</span>
          </span>
        );

        if (status === 'warning') {
          progressGradient = `linear-gradient(90deg, ${category.color} 0%, #F59E0B 100%)`;
          statusBadge = (
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              <span>Pacing High</span>
            </span>
          );
        } else if (status === 'exceeded') {
          progressGradient = `linear-gradient(90deg, #F43F5E 0%, #E11D48 100%)`;
          statusBadge = (
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-rose-200">
              <AlertCircle className="w-3 h-3 text-rose-500" />
              <span>Over Limit</span>
            </span>
          );
        }

        return (
          <div
            key={category.id}
            className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs transition-all duration-200"
          >
            {/* Top row: Category icon, name, status, and edit button */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                  style={{
                    backgroundColor: `${category.color}18`,
                    color: category.color,
                  }}
                >
                  <CategoryIcon name={category.iconName} className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {category.name}
                    </span>
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                    <span>Limit: {formatCurrency(budget, currencySymbol)}</span>
                    <span>·</span>
                    <span>{percentUsed.toFixed(0)}% used</span>
                  </div>
                </div>
              </div>

              {/* Status and Action */}
              <div className="flex items-center gap-2.5 shrink-0">
                {statusBadge}
                {onEditBudget && (
                  <button
                    onClick={() => onEditBudget(category)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                    title="Adjust category limit"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Smart visual progress track with gradient fill & threshold markers */}
            <div className="relative my-2.5">
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden shadow-inner relative">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${cappedBarPercent}%`,
                    background: progressGradient,
                  }}
                />
              </div>

              {/* Threshold indicator at 80% */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-amber-400/80 z-10 pointer-events-none"
                style={{ left: '80%' }}
                title="80% Warning Threshold"
              />

              {/* Threshold indicator at 100% */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10 pointer-events-none"
                style={{ left: '100%' }}
                title="100% Maximum Cap"
              />
            </div>

            {/* Bottom metrics row with smart color tags */}
            <div className="flex items-center justify-between text-xs font-mono tabular-nums">
              <span className="text-slate-600 flex items-center gap-1.5">
                <span>Spent:</span>
                <strong className="text-slate-900 font-bold">{formatCurrency(spent, currencySymbol)}</strong>
                <span className="text-slate-400 text-[11px]">({percentUsed.toFixed(0)}%)</span>
              </span>
              <span
                className={`font-semibold flex items-center gap-1 ${
                  isOverBudget ? 'text-rose-600 font-bold' : 'text-emerald-600'
                }`}
              >
                {isOverBudget ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                    <span>-{formatCurrency(Math.abs(remaining), currencySymbol)} over limit</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{formatCurrency(remaining, currencySymbol)} available</span>
                  </>
                )}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
