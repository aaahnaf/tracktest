import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Receipt, BarChart3, Settings as SettingsIcon, Plus } from 'lucide-react';
import { useExpenses } from './hooks/useExpenses';
import { useSettings } from './hooks/useSettings';
import { useTheme } from './hooks/useTheme';
import { Page, Expense } from './lib/types';
import { Overview } from './components/Overview';
import { Transactions } from './components/Transactions';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { AddExpenseModal } from './components/AddExpenseModal';

const NAV_ITEMS: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
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
        <div className="w-6 h-6 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] transition-colors duration-200">
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-60 h-screen sticky top-0 border-r border-[var(--border)] bg-[var(--bg)] px-4 py-6">
          {/* Logo */}
          <div className="mb-8 px-2">
            <h1 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight">What Did I Spend?</h1>
            <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">Track your spending</p>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-0.5">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = page === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/60'
                  }`}
                >
                  <Icon size={16} strokeWidth={isActive ? 2 : 1.5} className={isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'} />
                  {item.label}
                  {isActive && (
                    <div className="ml-auto w-1 h-1 rounded-full bg-[var(--accent)]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Add button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 w-full py-3 mt-4 bg-[var(--accent)] text-[var(--bg)] rounded-xl font-medium text-sm hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <Plus size={16} />
            Add expense
          </button>

          {/* Privacy note */}
          <p className="text-[10px] text-[var(--text-tertiary)] mt-4 px-2">
            Your data stays on this device.
          </p>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-8 pb-28 md:pb-8">
            {/* Page Header (mobile) */}
            <div className="md:hidden mb-6 flex items-center justify-between">
              <h1 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
                {NAV_ITEMS.find(n => n.id === page)?.label}
              </h1>
              {page !== 'settings' && (
                <button
                  onClick={() => setPage('settings')}
                  className="p-2 -mr-2 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                  aria-label="Settings"
                >
                  <SettingsIcon size={18} />
                </button>
              )}
            </div>

            {/* Page Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg)]/90 backdrop-blur-xl border-t border-[var(--border)] safe-bottom z-40">
        <div className="flex items-center justify-around px-1 pt-2 pb-1">
          {NAV_ITEMS.slice(0, 2).map(item => {
            const Icon = item.icon;
            const isActive = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[56px] ${
                  isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'
                }`}
              >
                <Icon size={19} strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}

          {/* Center Add Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center w-11 h-11 -mt-4 bg-[var(--accent)] text-[var(--bg)] rounded-full shadow-md shadow-black/10 active:scale-90 transition-transform"
            aria-label="Add expense"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>

          {NAV_ITEMS.slice(2, 4).map(item => {
            const Icon = item.icon;
            const isActive = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[56px] ${
                  isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'
                }`}
              >
                <Icon size={19} strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
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
