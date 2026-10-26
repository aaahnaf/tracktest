import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';
import './three/scene'; // boot the Three.js world (side-effect module)
import { useExpenses } from './hooks/useExpenses';
import { useTheme } from './hooks/useTheme';
import { Expense, Currency, CURRENCY_SYMBOLS } from './lib/types';
import { Overview } from './components/Overview';
import { Transactions } from './components/Transactions';
import { Analytics } from './components/Analytics';
import { Memory } from './components/Memory';
import { Replay } from './components/Replay';
import { Settings } from './components/Settings';
import { AddExpenseModal } from './components/AddExpenseModal';
import { GlassPill, Magnetic, useSpotlight } from './components/GlassUI';
import { burstFromElement, burstAt } from './three/scene';
import { haptic } from './lib/haptic';

type Tab = 'overview' | 'transactions' | 'analytics' | 'memory' | 'replay' | 'settings';

const TAB_LABELS: Record<Tab, string> = {
  overview: 'Overview',
  transactions: 'Transactions',
  analytics: 'Analytics',
  memory: 'Memory',
  replay: 'Replay',
  settings: 'Settings',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const { expenses, loading, addExpense, updateExpense, deleteExpense, deleteAll } = useExpenses();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [currency, setCurrency] = useState<Currency>(() => {
    try {
      return (localStorage.getItem('wdis-currency') as Currency) || 'BDT';
    } catch {
      return 'BDT';
    }
  });

  useSpotlight();

  // announce page to the 3D scene + fire a nav burst
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('wdis:page', { detail: activeTab }));
    burstAt(0, 0.92, 'nav');
  }, [activeTab]);

  // persist currency
  useEffect(() => {
    try {
      localStorage.setItem('wdis-currency', currency);
    } catch {
      /* noop */
    }
  }, [currency]);

  const handleSaveExpense = async (expense: Expense) => {
    await addExpense(expense);
    burstAt(0, -0.1, 'success');
  };

  const handleUpdateExpense = async (expense: Expense) => {
    await updateExpense(expense);
  };

  const handleDeleteExpense = async (id: string) => {
    await deleteExpense(id);
  };

  const handleDeleteAll = async () => {
    await deleteAll();
  };

  const openEdit = (expense: Expense) => {
    setEditExpense(expense);
    setShowAddModal(true);
  };

  const openAdd = (e?: React.MouseEvent) => {
    setEditExpense(null);
    setShowAddModal(true);
    haptic('medium');
    if (e) burstFromElement(e.currentTarget as Element, 'nav');
  };

  const cycleTheme = () => {
    const order: (typeof theme)[] = ['light', 'dark', 'system'];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
    haptic('light');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative w-16 h-16">
            <motion.div
              className="absolute inset-0 rounded-full border border-[var(--border-strong)]"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-3 rounded-full border border-[var(--border)]"
              animate={{ rotate: -360 }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse-slow" />
            </div>
          </div>
          <p className="technical-text text-[var(--text-tertiary)]">Loading your story…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* ambient layers driven by CSS vars / three.js */}
      <div className="spotlight-layer" aria-hidden />
      <div className="grain-layer" aria-hidden />

      {/* Header — liquid glass bar */}
      <header className="sticky top-0 z-40 px-4 pt-4 pointer-events-none">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          <div className="glass-card !rounded-full px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <button
              onClick={() => setActiveTab('overview')}
              className="flex items-center gap-2.5 group"
              aria-label="Go to overview"
            >
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] accent-glow group-hover:scale-125 transition-transform" />
              <span className="text-sm font-medium tracking-tight text-[var(--text-primary)]">
                What Did I Spend?
              </span>
            </button>

            <div className="flex items-center gap-2">
              {/* Currency selector — glass pills */}
              <div className="hidden sm:flex items-center gap-1.5">
                {(Object.keys(CURRENCY_SYMBOLS) as Currency[]).map((c) => (
                  <Magnetic key={c} strength={0.25}>
                    <GlassPill
                      active={currency === c}
                      onClick={() => {
                        setCurrency(c);
                        haptic('light');
                      }}
                      className="!px-2.5 !py-1.5"
                      aria-label={`Switch currency to ${c}`}
                    >
                      {CURRENCY_SYMBOLS[c]}
                    </GlassPill>
                  </Magnetic>
                ))}
              </div>

              {/* Theme toggle */}
              <Magnetic strength={0.3}>
                <button
                  onClick={cycleTheme}
                  className="glass-pill !px-3 !py-1.5 flex items-center gap-1.5"
                  aria-label={`Theme: ${theme}`}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={resolvedTheme}
                      initial={{ y: 8, opacity: 0, rotate: -30 }}
                      animate={{ y: 0, opacity: 1, rotate: 0 }}
                      exit={{ y: -8, opacity: 0, rotate: 30 }}
                      transition={{ duration: 0.25 }}
                      className="text-xs"
                    >
                      {resolvedTheme === 'dark' ? '◐' : '◑'}
                    </motion.span>
                  </AnimatePresence>
                  <span className="technical-text hidden md:inline">{theme}</span>
                </button>
              </Magnetic>
            </div>
          </div>
        </div>
      </header>

      {/* Main content with cinematic page transitions */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-36 pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 34, scale: 0.985, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -22, scale: 0.99, filter: 'blur(8px)' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'overview' && (
              <Overview
                expenses={expenses}
                currency={currency}
                onAddExpense={() => openAdd()}
                onViewAll={() => setActiveTab('transactions')}
                onViewAnalytics={() => setActiveTab('analytics')}
              />
            )}
            {activeTab === 'transactions' && (
              <Transactions
                expenses={expenses}
                currency={currency}
                onEdit={openEdit}
                onDelete={handleDeleteExpense}
              />
            )}
            {activeTab === 'analytics' && (
              <Analytics expenses={expenses} currency={currency} />
            )}
            {activeTab === 'memory' && (
              <Memory expenses={expenses} currency={currency} onEditExpense={openEdit} />
            )}
            {activeTab === 'replay' && (
              <Replay expenses={expenses} currency={currency} />
            )}
            {activeTab === 'settings' && (
              <Settings
                settings={{ theme, currency, defaultCategory: 'food' }}
                onUpdateSettings={(s) => {
                  if (s.theme) setTheme(s.theme);
                  if (s.currency) setCurrency(s.currency);
                }}
                onDeleteAll={handleDeleteAll}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating action button — liquid glass orb */}
      <div className="fixed bottom-24 right-5 sm:right-8 z-40">
        <Magnetic strength={0.4}>
          <motion.button
            whileHover={{ scale: 1.08, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={openAdd}
            className="relative w-14 h-14 rounded-full flex items-center justify-center text-[var(--text-primary)] shadow-xl cursor-pointer"
            style={{
              background: 'var(--glass-bg-strong)',
              backdropFilter: 'blur(20px) saturate(170%)',
              WebkitBackdropFilter: 'blur(20px) saturate(170%)',
              border: '1px solid var(--glass-border)',
            }}
            aria-label="Add expense"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -6px 14px rgba(0,0,0,0.06)' }}
            />
          </motion.button>
        </Magnetic>
      </div>

      {/* Bottom navigation — floating liquid glass dock */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
        <div className="max-w-2xl mx-auto px-4 pb-4">
          <div
            className="glass-card !rounded-full px-2 py-2 flex items-center justify-between gap-1 overflow-x-auto"
            style={{ scrollbarWidth: 'none' }}
          >
            {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    haptic('light');
                  }}
                  className="relative flex-1 min-w-fit px-3 py-2.5 rounded-full transition-colors"
                  aria-label={TAB_LABELS[tab]}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-glass-active"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'var(--glass-bg-strong)',
                        border: '1px solid var(--glass-border)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                      }}
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    />
                  )}
                  <span
                    className={`relative technical-text whitespace-nowrap ${
                      isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'
                    }`}
                  >
                    {TAB_LABELS[tab]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Add/Edit modal */}
      <AddExpenseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveExpense}
        onUpdate={handleUpdateExpense}
        editExpense={editExpense}
        currency={currency}
      />
    </div>
  );
}
