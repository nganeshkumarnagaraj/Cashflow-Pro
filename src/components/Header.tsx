import React, { useState } from 'react';
import { ViewTab } from '../types/finance';
import { Plus, BookOpen, LogIn, LogOut, Cloud, CloudOff, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
  const { currentUser, loading, signInWithGoogle, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-6">
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
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
          <button
            onClick={() => onSelectTab('overview')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'overview'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onSelectTab('budget')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'budget'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            Budgets & Limits
          </button>
          <button
            onClick={() => onSelectTab('transactions')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'transactions'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            Transactions Ledger
          </button>
          <button
            onClick={() => onSelectTab('analytics')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'analytics'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            Visual Analytics
          </button>
        </nav>

        {/* Zone 3: Actions & Auth */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            onClick={onOpenStudioModal}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            title="Developed by NirviAura Publishing and Learning Studio"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden xl:inline">NirviAura Studio</span>
            <span className="xl:hidden sm:inline">Studio</span>
          </button>

          {/* Firebase Authentication & Cloud Sync */}
          {!loading && (
            <>
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-colors text-xs cursor-pointer shadow-2xs"
                    title={`Signed in as ${currentUser.email || currentUser.displayName}`}
                  >
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt="Profile"
                        className="w-5 h-5 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                        {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                      </div>
                    )}
                    <span className="hidden lg:inline font-medium text-slate-800 max-w-[100px] truncate">
                      {currentUser.displayName || 'Account'}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Cloud Firestore Synced" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-2 border-b border-slate-100 text-xs">
                        <div className="font-semibold text-slate-900 truncate">
                          {currentUser.displayName || 'Google Account'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {currentUser.email}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-emerald-600 mt-1">
                          <Cloud className="w-3 h-3" />
                          <span>Firestore Cloud Sync Active</span>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          setIsUserMenuOpen(false);
                          await logout();
                        }}
                        className="w-full mt-1 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-2 cursor-pointer font-medium text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => signInWithGoogle()}
                  className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-2xs"
                  title="Sign in with Google to sync budgets and transactions across devices"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Google Sync</span>
                  <span className="sm:hidden">Sign In</span>
                </button>
              )}
            </>
          )}

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
