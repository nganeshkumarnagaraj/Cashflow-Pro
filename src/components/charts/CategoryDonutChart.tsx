import React, { useState } from 'react';
import { CategorySummary, formatCurrency } from '../../utils/formatters';
import { CategoryIcon } from '../CategoryIcon';

interface CategoryDonutChartProps {
  summaries: CategorySummary[];
  currencySymbol: string;
  totalExpense: number;
  onSelectCategory?: (categoryId: string) => void;
  selectedCategoryId?: string | null;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  summaries,
  currencySymbol,
  totalExpense,
  onSelectCategory,
  selectedCategoryId,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Filter categories with spending > 0, sort by spent descending
  const activeCategories = summaries
    .filter((s) => s.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  if (totalExpense === 0 || activeCategories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
        <div className="w-12 h-12 rounded-full border border-dashed border-slate-300 flex items-center justify-center mb-3 text-slate-400">
          $
        </div>
        <p className="text-sm font-medium text-slate-700">No expense data recorded</p>
        <p className="text-xs text-slate-400 mt-1">
          Log an expense to see color-coded category allocation
        </p>
      </div>
    );
  }

  // SVG Donut geometry
  const size = 260;
  const strokeWidth = 36;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let accumulatedPercent = 0;

  const currentHovered = hoveredCategory || selectedCategoryId;
  const activeSummary = activeCategories.find((s) => s.category.id === currentHovered);

  return (
    <div className="flex flex-col lg:flex-row items-center gap-8">
      {/* SVG Donut */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 select-none overflow-visible"
        >
          {/* Background circle track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {activeCategories.map((item) => {
            const fraction = item.spent / totalExpense;
            const strokeDasharray = `${fraction * circumference} ${circumference}`;
            const strokeDashoffset = -(accumulatedPercent * circumference);
            accumulatedPercent += fraction;

            const isHovered = currentHovered === item.category.id;
            const isDimmed = currentHovered && !isHovered;

            return (
              <circle
                key={item.category.id}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={item.category.color}
                strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-200 cursor-pointer"
                style={{
                  opacity: isDimmed ? 0.35 : 1,
                  filter: isHovered ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' : 'none',
                }}
                onMouseEnter={() => setHoveredCategory(item.category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                onClick={() => onSelectCategory?.(item.category.id)}
              />
            );
          })}
        </svg>

        {/* Center Donut Hole Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          {activeSummary ? (
            <div className="transition-all animate-in fade-in duration-150">
              <span className="text-xs font-medium text-slate-500 block truncate max-w-[140px]">
                {activeSummary.category.name}
              </span>
              <span className="text-xl font-bold tracking-tight text-slate-900 font-mono tabular-nums block mt-0.5">
                {formatCurrency(activeSummary.spent, currencySymbol)}
              </span>
              <span className="text-xs font-semibold text-slate-600 block mt-0.5">
                {((activeSummary.spent / totalExpense) * 100).toFixed(1)}% of total
              </span>
            </div>
          ) : (
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block">
                Total Expenses
              </span>
              <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums block mt-0.5">
                {formatCurrency(totalExpense, currencySymbol)}
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                {activeCategories.length} Categories
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Legend & Breakdown Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        {activeCategories.map((item) => {
          const percent = ((item.spent / totalExpense) * 100).toFixed(1);
          const isSelected = currentHovered === item.category.id;

          return (
            <button
              key={item.category.id}
              onClick={() => onSelectCategory?.(item.category.id)}
              onMouseEnter={() => setHoveredCategory(item.category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
              className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-slate-800 bg-slate-50 shadow-xs'
                  : 'border-slate-200/80 bg-white hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div
                  className="w-3.5 h-3.5 rounded-sm shrink-0"
                  style={{ backgroundColor: item.category.color }}
                  aria-hidden="true"
                />
                <div className="truncate">
                  <span className="text-xs font-semibold text-slate-900 block truncate">
                    {item.category.name}
                  </span>
                  <span className="text-[11px] text-slate-500 block font-mono tabular-nums">
                    {percent}% of expenses
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-slate-900 font-mono tabular-nums block">
                  {formatCurrency(item.spent, currencySymbol)}
                </span>
                <span
                  className={`text-[10px] font-medium block ${
                    item.status === 'exceeded'
                      ? 'text-rose-600'
                      : item.status === 'warning'
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {item.percentUsed.toFixed(0)}% budget
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
