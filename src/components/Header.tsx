import React from 'react';
import { ViewTab } from '../types/finance';
import { Plus, BookOpen } from 'lucide-react';

interface HeaderProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onOpenAddModal: () => void;
  onOpenStudioModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddModal,
  onOpenStudioModal,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6 sm:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            $
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap leading-tight">
              Cashflow Pro
            </span>
            <span className="text-[10px] text-slate-500 font-medium hidden sm:block whitespace-nowrap leading-none mt-0.5">
              By NirviAura Publishing & Learning Studio
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab('overview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              currentTab === 'overview'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onSelectTab('budget')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              currentTab === 'budget'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Budgets & Categories
          </button>
          <button
            onClick={() => onSelectTab('transactions')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              currentTab === 'transactions'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Transactions Ledger
          </button>
          <button
            onClick={() => onSelectTab('analytics')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              currentTab === 'analytics'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Visual Analytics
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenStudioModal}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            title="Developed by NirviAura Publishing and Learning Studio"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden xl:inline">NirviAura Studio</span>
            <span className="xl:hidden sm:inline">Studio</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around px-2 py-1.5 border-t border-slate-100 bg-slate-50/70 overflow-x-auto text-xs">
        <button
          onClick={() => onSelectTab('overview')}
          className={`px-2.5 py-1 font-medium rounded whitespace-nowrap ${
            currentTab === 'overview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => onSelectTab('budget')}
          className={`px-2.5 py-1 font-medium rounded whitespace-nowrap ${
            currentTab === 'budget' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Budgets
        </button>
        <button
          onClick={() => onSelectTab('transactions')}
          className={`px-2.5 py-1 font-medium rounded whitespace-nowrap ${
            currentTab === 'transactions' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Ledger
        </button>
        <button
          onClick={() => onSelectTab('analytics')}
          className={`px-2.5 py-1 font-medium rounded whitespace-nowrap ${
            currentTab === 'analytics' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Visual Charts
        </button>
      </div>
    </header>
  );
};
