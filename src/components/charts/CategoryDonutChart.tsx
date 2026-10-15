import React, { useState } from 'react';
import { CategorySummary, formatCurrency } from '../../utils/formatters';
import { CategoryIcon } from '../CategoryIcon';
import { PieChart, Sparkles } from 'lucide-react';

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
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center mb-3 text-slate-400 shadow-inner">
          <PieChart className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-sm font-semibold text-slate-800">No expense records yet</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Log your expenses using the quick presets or Add Transaction button to view the smart category distribution
        </p>
      </div>
    );
  }

  // SVG Donut geometry
  const size = 260;
  const strokeWidth = 34;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let accumulatedPercent = 0;

  const currentHovered = hoveredCategory || selectedCategoryId;
  const activeSummary = activeCategories.find((s) => s.category.id === currentHovered);

  return (
    <div className="flex flex-col lg:flex-row items-center gap-8">
      {/* SVG Donut with Modern Visual Lighting */}
      <div className="relative shrink-0 flex items-center justify-center p-2">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 select-none overflow-visible filter drop-shadow-md"
        >
          {/* Subtle background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />

          {/* Glowing animated slices */}
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
                strokeWidth={isHovered ? strokeWidth + 7 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer"
                style={{
                  opacity: isDimmed ? 0.3 : 1,
                  filter: isHovered
                    ? `drop-shadow(0 0 10px ${item.category.color}80)`
                    : 'none',
                }}
                onMouseEnter={() => setHoveredCategory(item.category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                onClick={() => onSelectCategory?.(item.category.id)}
              />
            );
          })}
        </svg>

        {/* Center Donut Hole Card */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <div className="w-32 h-32 rounded-full bg-white/95 backdrop-blur-xs shadow-inner border border-slate-100 flex flex-col items-center justify-center p-2 transition-all">
            {activeSummary ? (
              <div className="transition-all animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center mb-1 text-white shadow-xs"
                  style={{ backgroundColor: activeSummary.category.color }}
                >
                  <CategoryIcon name={activeSummary.category.iconName} className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 block truncate max-w-[110px]">
                  {activeSummary.category.name}
                </span>
                <span className="text-base font-bold tracking-tight text-slate-900 font-mono tabular-nums leading-tight mt-0.5">
                  {formatCurrency(activeSummary.spent, currencySymbol)}
                </span>
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-1"
                  style={{
                    backgroundColor: `${activeSummary.category.color}15`,
                    color: activeSummary.category.color,
                  }}
                >
                  {((activeSummary.spent / totalExpense) * 100).toFixed(1)}% of total
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                  Total Outflow
                </span>
                <span className="text-xl font-bold tracking-tight text-slate-900 font-mono tabular-nums block mt-0.5">
                  {formatCurrency(totalExpense, currencySymbol)}
                </span>
                <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                  {activeCategories.length} Categories
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern Legend with Interactive Category Cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
        {activeCategories.map((item) => {
          const percent = ((item.spent / totalExpense) * 100).toFixed(1);
          const isSelected = currentHovered === item.category.id;

          return (
            <button
              key={item.category.id}
              onClick={() => onSelectCategory?.(item.category.id)}
              onMouseEnter={() => setHoveredCategory(item.category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
              className={`flex flex-col p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50/50 shadow-sm scale-[1.02]'
                  : 'border-slate-200/90 bg-white hover:bg-slate-50/90 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: `${item.category.color}20`,
                      color: item.category.color,
                    }}
                  >
                    <CategoryIcon name={item.category.iconName} className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 truncate block">
                        {item.category.name}
                      </span>
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: item.category.color }}
                      />
                    </div>
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
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded inline-block mt-0.5 ${
                      item.status === 'exceeded'
                        ? 'bg-rose-50 text-rose-600'
                        : item.status === 'warning'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    {item.percentUsed.toFixed(0)}% budget
                  </span>
                </div>
              </div>

              {/* Mini visual track */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2.5">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(item.percentUsed, 100)}%`,
                    backgroundColor: item.category.color,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
