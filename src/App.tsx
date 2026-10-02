import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GridIcon, ListIcon, ChartIcon, SettingsIcon, PlusIcon } from './components/Icons';
import { useExpenses } from './hooks/useExpenses';
import { useSettings } from './hooks/useSettings';
import { useTheme } from './hooks/useTheme';
import { Page, Expense } from './lib/types';
import { Overview } from './components/Overview';
import { Transactions } from './components/Transactions';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { AddExpenseModal } from './components/AddExpenseModal';

const NAV_ITEMS: { id: Page; label: string; icon: any }[] = [
  { id: 'overview', label: 'Overview', icon: GridIcon },
  { id: 'transactions', label: 'Transactions', icon: ListIcon },
  { id: 'analytics', label: 'Analytics', icon: ChartIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export default function App() {
  const [page, setPage] = useState<Page>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  
  const { expenses, loading, addExpense, updateExpense, deleteExpense, deleteAll } = useExpenses();
  const { settings, updateSettings } = useSettings();
  const resolvedTheme = useTheme(settings.theme);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setShowAddModal(true);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const handleEdit = useCallback((expense: Expense) => {
    setEditExpense(expense);
    setShowAddModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowAddModal(false);
    setEditExpense(null);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="relative">
          <div className="w-16 h-16 border border-[var(--border)] rounded-full flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse-slow" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] transition-colors duration-300">
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-[var(--border)] bg-[var(--bg)] px-5 py-6">
          {/* Logo */}
          <div className="mb-10 px-2">
            <h1 className="text-lg font-light text-[var(--text-primary)] tracking-tight">What Did I Spend?</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <p className="text-[10px] text-[var(--text-tertiary)] technical-text">Track your spending</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = page === item.id;
              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPage(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/60'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'} />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* Add button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 w-full py-3.5 mt-6 bg-[var(--text-primary)] text-[var(--bg)] rounded-full font-medium text-sm hover:opacity-90 transition-all"
          >
            <PlusIcon size={16} />
            <span>Add expense</span>
          </motion.button>

          {/* Privacy note */}
          <div className="mt-6 flex items-center gap-2 px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <p className="technical-text text-[var(--text-tertiary)]">
              Data stored locally
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-8 pb-28 md:pb-8">
            {/* Page Header (mobile) */}
            <div className="md:hidden mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-light text-[var(--text-primary)] tracking-tight">
                  {NAV_ITEMS.find(n => n.id === page)?.label}
                </h1>
              </div>
              {page !== 'settings' && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setPage('settings')}
                  className="p-2 -mr-2 rounded-full text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                  aria-label="Settings"
                >
                  <SettingsIcon size={18} />
                </motion.button>
              )}
            </div>

            {/* Page Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {page === 'overview' && (
                  <Overview
                    expenses={expenses}
                    currency={settings.currency}
                    onAddExpense={() => setShowAddModal(true)}
                    onNavigate={setPage}
                  />
                )}
                {page === 'transactions' && (
                  <Transactions
                    expenses={expenses}
                    currency={settings.currency}
                    onEdit={handleEdit}
                    onDelete={deleteExpense}
                  />
                )}
                {page === 'analytics' && (
                  <Analytics
                    expenses={expenses}
                    currency={settings.currency}
                  />
                )}
                {page === 'settings' && (
                  <Settings
                    settings={settings}
                    onUpdateSettings={updateSettings}
                    onDeleteAll={deleteAll}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg)]/95 backdrop-blur-xl border-t border-[var(--border)] safe-bottom z-40">
        <div className="flex items-center justify-around px-1 pt-2 pb-1">
          {NAV_ITEMS.slice(0, 2).map(item => {
            const Icon = item.icon;
            const isActive = page === item.id;
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => setPage(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[60px] ${
                  isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </motion.button>
            );
          })}

          {/* Center Add Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center w-12 h-12 -mt-5 bg-[var(--text-primary)] text-[var(--bg)] rounded-full shadow-lg active:scale-90 transition-transform"
            aria-label="Add expense"
          >
            <PlusIcon size={22} />
          </motion.button>

          {NAV_ITEMS.slice(2, 4).map(item => {
            const Icon = item.icon;
            const isActive = page === item.id;
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => setPage(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[60px] ${
                  isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Add/Edit Modal */}
      <AddExpenseModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onSave={addExpense}
        onUpdate={updateExpense}
        editExpense={editExpense}
        currency={settings.currency}
      />
    </div>
  );
}
