import React, { useState } from 'react';
import { Transaction, Category } from '../../types/finance';
import { formatCurrency, formatShortDate } from '../../utils/formatters';

interface CashFlowTrendChartProps {
  transactions: Transaction[];
  categories: Category[];
  currencySymbol: string;
  selectedMonth: string; // 'YYYY-MM' or 'all'
}

export const CashFlowTrendChart: React.FC<CashFlowTrendChartProps> = ({
  transactions,
  categories,
  currencySymbol,
  selectedMonth,
}) => {
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    expense: number;
    income: number;
    items: Transaction[];
  } | null>(null);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Filter transactions for selected month or last 30 days
  const filtered = transactions.filter((t) => {
    if (selectedMonth === 'all') return true;
    return t.date.startsWith(selectedMonth);
  });

  // Aggregate by date
  const dayMap = new Map<string, { date: string; expense: number; income: number; items: Transaction[] }>();

  filtered.forEach((t) => {
    const existing = dayMap.get(t.date) || { date: t.date, expense: 0, income: 0, items: [] };
    if (t.type === 'expense') existing.expense += t.amount;
    if (t.type === 'income') existing.income += t.amount;
    existing.items.push(t);
    dayMap.set(t.date, existing);
  });

  // Sort dates chronologically
  const sortedDays = Array.from(dayMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const maxExpense = Math.max(...sortedDays.map((d) => d.expense), 100);

  // Payment method breakdown
  const paymentMethods: Record<string, number> = {};
  filtered
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      paymentMethods[t.paymentMethod] = (paymentMethods[t.paymentMethod] || 0) + t.amount;
    });

  const totalExpense = filtered
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  if (sortedDays.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500 text-sm">
        No transaction activity recorded for this period.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Daily Expense Distribution Bars */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Daily Expense Velocity
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Hover over bars to inspect daily spending
            </p>
          </div>
          {hoveredDay && (
            <div className="text-right">
              <span className="text-xs text-slate-500">{formatShortDate(hoveredDay.date)}: </span>
              <span className="text-xs font-bold text-slate-900 font-mono tabular-nums">
                {formatCurrency(hoveredDay.expense, currencySymbol)}
              </span>
            </div>
          )}
        </div>

        {/* Visual Bar Strip */}
        <div className="h-44 flex items-end gap-1.5 pt-4 pb-2 border-b border-slate-200">
          {sortedDays.map((day) => {
            const heightPercent = Math.max((day.expense / maxExpense) * 100, 4);
            const isHovered = hoveredDay?.date === day.date;

            return (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                {/* Popover on hover */}
                {isHovered && (
                  <div className="absolute bottom-full mb-2 z-20 bg-slate-900 text-white text-xs rounded-md px-2.5 py-1.5 shadow-lg whitespace-nowrap pointer-events-none transform -translate-x-1/2 left-1/2">
                    <div className="font-semibold">{formatShortDate(day.date)}</div>
                    <div className="font-mono tabular-nums text-rose-300">
                      Spent: {formatCurrency(day.expense, currencySymbol)}
                    </div>
                    {day.income > 0 && (
                      <div className="font-mono tabular-nums text-emerald-300">
                        Income: +{formatCurrency(day.income, currencySymbol)}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {day.items.length} records
                    </div>
                  </div>
                )}

                {/* Bar */}
                <div
                  className={`w-full rounded-t-sm transition-all duration-200 ${
                    isHovered
                      ? 'bg-rose-600 shadow-sm'
                      : day.expense > 150
                      ? 'bg-rose-400'
                      : 'bg-slate-700 hover:bg-slate-900'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />

                <span className="text-[10px] text-slate-400 font-mono mt-1 select-none">
                  {day.date.split('-')[2]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Channels Breakdown */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Spending by Payment Method
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {Object.entries(paymentMethods).map(([method, amount]) => {
            const pct = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
            return (
              <div
                key={method}
                className="p-2.5 rounded-lg border border-slate-200 bg-white flex flex-col justify-between"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-700">{method}</span>
                  <span className="font-mono tabular-nums font-bold text-slate-900">
                    {formatCurrency(amount, currencySymbol)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-slate-800 h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 text-right font-mono mt-1">
                  {pct.toFixed(1)}% of expenses
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
