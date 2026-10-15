import React, { useState, useEffect } from 'react';
import { Category } from '../types/finance';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency } from '../utils/formatters';
import { X, Check, RotateCcw } from 'lucide-react';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  currentBudget: number;
  currentSpent: number;
  currencySymbol: string;
  onSaveBudget: (categoryId: string, newLimit: number) => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  category,
  currentBudget,
  currentSpent,
  currencySymbol,
  onSaveBudget,
}) => {
  const [limit, setLimit] = useState('');

  useEffect(() => {
    if (category) {
      setLimit(currentBudget.toString());
    }
  }, [category, currentBudget, isOpen]);

  if (!isOpen || !category) return null;

  const parsedLimit = parseFloat(limit) || 0;
  const variance = parsedLimit - currentSpent;
  const isOver = currentSpent > parsedLimit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedLimit < 0) return;
    onSaveBudget(category.id, parsedLimit);
    onClose();
  };

  const handleResetToDefault = () => {
    setLimit(category.defaultMonthlyBudget.toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
              style={{
                backgroundColor: `${category.color}20`,
                color: category.color,
              }}
            >
              <CategoryIcon name={category.iconName} className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Adjust Budget: {category.name}
              </h2>
              <span className="text-xs text-slate-500">
                Default allocation: {formatCurrency(category.defaultMonthlyBudget, currencySymbol)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Input field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Monthly Budget Limit ({currencySymbol})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="10"
                min="0"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-base font-semibold focus:outline-hidden focus:border-slate-800"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Real-time simulation info */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between items-center text-slate-600">
              <span>Current Month Spent:</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                {formatCurrency(currentSpent, currencySymbol)}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Projected Balance:</span>
              <span
                className={`font-mono tabular-nums font-semibold ${
                  isOver ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {isOver ? `-${formatCurrency(Math.abs(variance), currencySymbol)} over limit` : `${formatCurrency(variance, currencySymbol)} remaining`}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(parsedLimit > 0 ? (currentSpent / parsedLimit) * 100 : 0, 100)}%`,
                  backgroundColor: isOver ? '#E11D48' : category.color,
                }}
              />
            </div>
          </div>

          {/* Quick preset helpers */}
          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Default ({formatCurrency(category.defaultMonthlyBudget, currencySymbol)})
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Save Limit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
