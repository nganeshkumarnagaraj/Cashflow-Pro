import React from 'react';
import { CategorySummary, formatCurrency } from '../../utils/formatters';
import { CategoryIcon } from '../CategoryIcon';
import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

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
    <div className="space-y-4">
      {summaries.map((item) => {
        const { category, budget, spent, remaining, percentUsed, status } = item;
        const cappedBarPercent = Math.min(percentUsed, 100);
        const isOverBudget = percentUsed > 100;

        return (
          <div
            key={category.id}
            className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors"
          >
            {/* Header row */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${category.color}15`,
                    color: category.color,
                  }}
                >
                  <CategoryIcon name={category.iconName} className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 truncate">
                      {category.name}
                    </span>
                    <span
                      className="inline-block w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 font-mono tabular-nums">
                    Limit: {formatCurrency(budget, currencySymbol)}
                  </span>
                </div>
              </div>

              {/* Status and Action */}
              <div className="flex items-center gap-3 shrink-0 text-right">
                <div>
                  <div className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                    {formatCurrency(spent, currencySymbol)}
                  </div>
                  <div className="text-xs font-mono tabular-nums">
                    {isOverBudget ? (
                      <span className="text-rose-600 font-medium flex items-center justify-end gap-1">
                        <AlertCircle className="w-3 h-3 inline shrink-0" />
                        +{formatCurrency(Math.abs(remaining), currencySymbol)} over
                      </span>
                    ) : status === 'warning' ? (
                      <span className="text-amber-600 font-medium flex items-center justify-end gap-1">
                        <AlertTriangle className="w-3 h-3 inline shrink-0" />
                        {formatCurrency(remaining, currencySymbol)} left
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-medium flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3 h-3 inline shrink-0" />
                        {formatCurrency(remaining, currencySymbol)} left
                      </span>
                    )}
                  </div>
                </div>

                {onEditBudget && (
                  <button
                    onClick={() => onEditBudget(category)}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1 rounded border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors whitespace-nowrap cursor-pointer"
                    title={`Adjust budget limit for ${category.name}`}
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>

            {/* Visual Bar with Thresholds */}
            <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${cappedBarPercent}%`,
                  backgroundColor: isOverBudget ? '#E11D48' : category.color,
                }}
              />
              {/* If over budget, show a striped / bright cap indicator */}
              {isOverBudget && (
                <div
                  className="absolute right-0 top-0 bottom-0 w-2 bg-rose-600 animate-pulse"
                  title="Over budget limit"
                />
              )}
            </div>

            {/* Metric footer */}
            <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5 font-mono tabular-nums">
              <span>{percentUsed.toFixed(1)}% utilized</span>
              <span>
                {item.transactionCount} {item.transactionCount === 1 ? 'transaction' : 'transactions'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
