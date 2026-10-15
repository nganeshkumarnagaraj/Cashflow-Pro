import React from 'react';
import { X, BookOpen, Sparkles, ShieldCheck, HeartHandshake, Award, ExternalLink, ArrowRight } from 'lucide-react';

interface StudioAttributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: 'overview' | 'budget' | 'transactions' | 'analytics') => void;
}

export const StudioAttributionModal: React.FC<StudioAttributionModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="studio-modal-title"
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-300 block">
                Publisher & Developer
              </span>
              <h2 id="studio-modal-title" className="text-lg font-bold tracking-tight text-white">
                NirviAura Publishing and Learning Studio
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Crafting purposeful educational literature, mindful personal tools, and transformative learning experiences.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* About Statement */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              About This Application
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              <strong>Cashflow Pro</strong> is developed by <strong>NirviAura Publishing and Learning Studio</strong> as an accessible, high-clarity financial management suite. Designed with the modern <strong>Aptos</strong> typeface and human-centered design principles, it delivers clear visibility into daily cash flows without overwhelming clutter.
            </p>
          </div>

          {/* Pillars of Design */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs mb-1">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Default Category Budgets</span>
              </div>
              <p className="text-xs text-slate-600 leading-normal">
                Calibrated standard allowances across living categories to guide healthy spending from day one.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs mb-1">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Aptos Typography</span>
              </div>
              <p className="text-xs text-slate-600 leading-normal">
                Structured with Aptos font for pristine legibility, balanced proportions, and effortless scannability.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Privacy Preserved</span>
              </div>
              <p className="text-xs text-slate-600 leading-normal">
                All records stay stored safely in your browser. No third-party data tracking or transmission.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs mb-1">
                <HeartHandshake className="w-4 h-4 text-blue-600" />
                <span>50/30/20 Financial Rule</span>
              </div>
              <p className="text-xs text-slate-600 leading-normal">
                Automatic real-time benchmarking against essential needs, discretionary wants, and savings.
              </p>
            </div>
          </div>

          {/* Studio Commitment */}
          <div className="p-4 rounded-xl bg-slate-900 text-white text-xs space-y-1.5">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <span>NirviAura Publishing and Learning Studio</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              &ldquo;True wealth begins with clarity of attention and intentional daily practice. We develop thoughtful learning tools that bring clarity, calm, and confidence to everyday life.&rdquo;
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            NirviAura Studio Edition · 2026
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
