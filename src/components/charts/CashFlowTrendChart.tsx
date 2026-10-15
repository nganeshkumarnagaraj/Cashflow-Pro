import React, { useState } from 'react';
import { Transaction, Category } from '../../types/finance';
import { formatCurrency, formatShortDate } from '../../utils/formatters';
import { CategoryIcon } from '../CategoryIcon';
import { CreditCard, Wallet, Landmark, Smartphone, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

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

  // Filter transactions for selected month or all
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

  const maxExpense = Math.max(...sortedDays.map((d) => Math.max(d.expense, d.income)), 100);

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

  const totalIncome = filtered
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const getPaymentIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'credit card':
      case 'debit card':
        return <CreditCard className="w-3.5 h-3.5 text-blue-500" />;
      case 'cash':
        return <Wallet className="w-3.5 h-3.5 text-emerald-500" />;
      case 'bank transfer':
        return <Landmark className="w-3.5 h-3.5 text-purple-500" />;
      case 'digital wallet':
      case 'apple pay':
      case 'google pay':
        return <Smartphone className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <CreditCard className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Daily Cash Velocity Timeline */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Daily Cash Velocity & Outflow Waves
              </h3>
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                Timeline
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hover over any daily bar to inspect specific itemized transactions
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-3 h-3 rounded-sm bg-gradient-to-t from-emerald-600 to-emerald-400" />
              <span>Income</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-600">
              <span className="w-3 h-3 rounded-sm bg-gradient-to-t from-rose-600 to-rose-400" />
              <span>Expense</span>
            </div>
          </div>
        </div>

        {sortedDays.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No activity recorded for this period.
          </div>
        ) : (
          <div>
            {/* Interactive Histogram Bars with Gradient Fills */}
            <div className="h-48 flex items-end gap-1.5 sm:gap-2.5 pt-6 pb-2 px-1 overflow-x-auto">
              {sortedDays.map((day) => {
                const expenseHeight = Math.max((day.expense / maxExpense) * 100, day.expense > 0 ? 8 : 0);
                const incomeHeight = Math.max((day.income / maxExpense) * 100, day.income > 0 ? 8 : 0);
                const isHovered = hoveredDay?.date === day.date;

                return (
                  <div
                    key={day.date}
                    className="flex-1 min-w-[20px] max-w-[48px] h-full flex items-end justify-center gap-1 group cursor-pointer relative"
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    {/* Income Bar (Green Gradient) */}
                    {day.income > 0 && (
                      <div
                        className={`w-full rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-200 ${
                          isHovered ? 'brightness-110 shadow-md' : 'opacity-85'
                        }`}
                        style={{ height: `${incomeHeight}%` }}
                      />
                    )}

                    {/* Expense Bar (Rose Gradient) */}
                    {day.expense > 0 && (
                      <div
                        className={`w-full rounded-t-md bg-gradient-to-t from-rose-600 to-rose-400 transition-all duration-200 ${
                          isHovered ? 'brightness-110 shadow-md' : 'opacity-85'
                        }`}
                        style={{ height: `${expenseHeight}%` }}
                      />
                    )}

                    {/* Floating Date Label */}
                    <div className="absolute -bottom-5 text-[10px] text-slate-400 font-mono whitespace-nowrap opacity-60 group-hover:opacity-100 transition-opacity">
                      {formatShortDate(day.date)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hover Data Inspection Card */}
            {hoveredDay && (
              <div className="mt-6 p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {hoveredDay.date}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({hoveredDay.items.length} {hoveredDay.items.length === 1 ? 'entry' : 'entries'})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono font-bold">
                    {hoveredDay.income > 0 && (
                      <span className="text-emerald-600">
                        +{formatCurrency(hoveredDay.income, currencySymbol)}
                      </span>
                    )}
                    {hoveredDay.expense > 0 && (
                      <span className="text-rose-600">
                        -{formatCurrency(hoveredDay.expense, currencySymbol)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-indigo-100">
                  {hoveredDay.items.map((item) => {
                    const cat = categoryMap.get(item.categoryId);
                    return (
                      <span
                        key={item.id}
                        className="px-2 py-1 bg-white rounded-lg border border-slate-200 text-xs flex items-center gap-1.5 shadow-2xs"
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: cat?.color || '#94a3b8' }}
                        />
                        <span className="font-medium text-slate-800">{item.title}:</span>
                        <span className={`font-mono font-bold ${item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount, currencySymbol)}
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Channel Allocation Strips */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Outflow by Payment Channel
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(paymentMethods).map(([method, amount]) => {
            const pct = totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : 0;
            return (
              <div key={method} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    {getPaymentIcon(method)}
                    <span>{method}</span>
                  </div>
                  <span className="font-mono text-slate-500 font-bold">{pct}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="font-mono font-bold text-slate-900 text-sm">
                  {formatCurrency(amount, currencySymbol)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
