import React, { useState, useMemo } from 'react';
import { Transaction, Category, TransactionType, PaymentMethod } from '../types/finance';
import { formatCurrency, formatDate, exportTransactionsToCsv } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import {
  Search,
  Filter,
  Download,
  Plus,
  Edit3,
  Trash2,
  ArrowUpDown,
  X,
  CreditCard,
} from 'lucide-react';

interface TransactionLedgerProps {
  transactions: Transaction[];
  categories: Category[];
  currencySymbol: string;
  onOpenAddModal: () => void;
  onOpenEditModal: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionLedger: React.FC<TransactionLedgerProps> = ({
  transactions,
  categories,
  currencySymbol,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Type filter
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;
        // Category filter
        if (categoryFilter !== 'all' && t.categoryId !== categoryFilter) return false;
        // Payment filter
        if (paymentFilter !== 'all' && t.paymentMethod !== paymentFilter) return false;
        // Search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const catName = categoryMap.get(t.categoryId)?.name.toLowerCase() || '';
          const matchTitle = t.title.toLowerCase().includes(query);
          const matchNotes = (t.notes || '').toLowerCase().includes(query);
          const matchCat = catName.includes(query);
          const matchAmount = t.amount.toString().includes(query);
          if (!matchTitle && !matchNotes && !matchCat && !matchAmount) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt;
        }
        if (sortBy === 'date-asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime() || a.createdAt - b.createdAt;
        }
        if (sortBy === 'amount-desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'amount-asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [transactions, typeFilter, categoryFilter, paymentFilter, searchQuery, sortBy, categoryMap]);

  // Aggregate in-view totals
  const totalFilteredIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleExportCsv = () => {
    exportTransactionsToCsv(filteredTransactions, categoryMap);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setPaymentFilter('all');
    setSortBy('date-desc');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    typeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    paymentFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* Top Controls Card */}
      <div className="p-5 sm:p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Transactions Ledger
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive chronological log of all income entries and expense deductions
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-2xs"
              title="Download CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export CSV
            </button>
            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Record
            </button>
          </div>
        </div>

        {/* Real-time In-View Financial Rollup Mini-Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between text-xs">
            <span className="text-emerald-900 font-semibold">Inflow in view:</span>
            <span className="font-mono font-bold text-emerald-700 tabular-nums">
              +{formatCurrency(totalFilteredIncome, currencySymbol)}
            </span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-rose-50/70 border border-rose-100 flex items-center justify-between text-xs">
            <span className="text-rose-900 font-semibold">Outflow in view:</span>
            <span className="font-mono font-bold text-rose-700 tabular-nums">
              -{formatCurrency(totalFilteredExpense, currencySymbol)}
            </span>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs">
            <span className="text-indigo-900 font-semibold">Net in view:</span>
            <span className={`font-mono font-bold tabular-nums ${totalFilteredIncome - totalFilteredExpense >= 0 ? 'text-indigo-700' : 'text-rose-600'}`}>
              {totalFilteredIncome - totalFilteredExpense >= 0 ? '+' : ''}
              {formatCurrency(totalFilteredIncome - totalFilteredExpense, currencySymbol)}
            </span>
          </div>
        </div>

        {/* Filter controls row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Search bar */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by title, notes, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 text-xs focus:outline-hidden focus:border-slate-800 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Selector */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | TransactionType)}
              className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-hidden focus:border-slate-800 focus:bg-white"
            >
              <option value="all">All Types (Income & Expenses)</option>
              <option value="expense">Expenses Only (-)</option>
              <option value="income">Income Only (+)</option>
            </select>
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-hidden focus:border-slate-800 focus:bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-hidden focus:border-slate-800 focus:bg-white"
            >
              <option value="date-desc">Date: Newest First</option>
              <option value="date-asc">Date: Oldest First</option>
              <option value="amount-desc">Amount: Highest First</option>
              <option value="amount-asc">Amount: Lowest First</option>
            </select>
          </div>
        </div>

        {/* Filter reset helper */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>
              Showing {filteredTransactions.length} of {transactions.length} records
            </span>
            <button
              onClick={handleResetFilters}
              className="text-slate-700 hover:text-slate-900 font-medium underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Ledger Table Card */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-800">
              No matching transactions found
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search criteria or add a new transaction to this ledger.
            </p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              + Add Transaction
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4 font-medium">Date</th>
                  <th className="py-3 px-4 font-medium">Category</th>
                  <th className="py-3 px-4 font-medium">Title & Notes</th>
                  <th className="py-3 px-4 font-medium">Payment</th>
                  <th className="py-3 px-4 font-medium text-right">Amount</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => {
                  const cat = categoryMap.get(tx.categoryId);
                  const isExpense = tx.type === 'expense';

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3 px-4 text-slate-500 font-mono whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>

                      {/* Category with Color Swatch */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: cat ? `${cat.color}15` : '#f1f5f9',
                              color: cat ? cat.color : '#64748b',
                            }}
                          >
                            <CategoryIcon name={cat?.iconName || 'DollarSign'} className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {cat?.name || tx.categoryId}
                            </span>
                            <span className="text-[10px] text-slate-400 capitalize">
                              {tx.type}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Title & Notes */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">
                          {tx.title}
                        </div>
                        {tx.notes && (
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {tx.notes}
                          </div>
                        )}
                      </td>

                      {/* Payment Method with Visual Color Pill */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${
                            tx.paymentMethod === 'Cash'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : tx.paymentMethod === 'Bank Transfer'
                              ? 'bg-purple-50 text-purple-700 border border-purple-100'
                              : tx.paymentMethod.includes('Wallet') || tx.paymentMethod.includes('Pay')
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : 'bg-blue-50 text-blue-700 border border-blue-100'
                          }`}
                        >
                          {tx.paymentMethod}
                        </span>
                      </td>

                      {/* Amount with Vibrant Pill */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-bold whitespace-nowrap text-sm">
                        <span
                          className={`px-2.5 py-1 rounded-lg inline-block font-mono ${
                            isExpense
                              ? 'text-rose-700 bg-rose-50 border border-rose-100'
                              : 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                          }`}
                        >
                          {isExpense ? '-' : '+'}
                          {formatCurrency(tx.amount, currencySymbol)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onOpenEditModal(tx)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Ledger Bottom Aggregate Summary Strip */}
        {filteredTransactions.length > 0 && (
          <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
            <div>
              Total filtered records: <strong className="text-slate-900 font-mono">{filteredTransactions.length}</strong>
            </div>
            <div className="flex items-center gap-4 font-mono tabular-nums">
              <span>
                Income in view: <strong className="text-emerald-600">+{formatCurrency(totalFilteredIncome, currencySymbol)}</strong>
              </span>
              <span>·</span>
              <span>
                Expenses in view: <strong className="text-rose-600">-{formatCurrency(totalFilteredExpense, currencySymbol)}</strong>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
