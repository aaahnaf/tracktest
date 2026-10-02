import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, Trash2, Edit3 } from 'lucide-react';
import { Expense, Currency, DEFAULT_CATEGORIES } from '../lib/types';
import { formatCurrency, formatSmartDate, formatTime, groupExpensesByDate } from '../lib/utils';
import { parseISO } from 'date-fns';

interface TransactionsProps {
  expenses: Expense[];
  currency: Currency;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export function Transactions({ expenses, currency, onEdit, onDelete }: TransactionsProps) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const filtered = useMemo(() => {
    let result = [...expenses];
    
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e => 
        e.note.toLowerCase().includes(q) || 
        e.category.toLowerCase().includes(q) ||
        e.amount.toString().includes(q)
      );
    }
    
    if (filterCategory !== 'all') {
      result = result.filter(e => e.category === filterCategory);
    }

    switch (sortBy) {
      case 'oldest':
        result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'highest':
        result.sort((a, b) => b.amount - a.amount);
        break;
      case 'lowest':
        result.sort((a, b) => a.amount - b.amount);
        break;
      default:
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return result;
  }, [expenses, search, filterCategory, sortBy]);

  const grouped = useMemo(() => groupExpensesByDate(filtered), [filtered]);

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      onDelete(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] px-6 text-center animate-fade-in">
        <p className="text-[var(--text-secondary)]">No transactions yet.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Search & Filter Bar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search expenses… (press /)"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--accent)] transition-all text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={14} className="text-[var(--text-tertiary)]" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2.5 rounded-xl border transition-all ${
            showFilters ? 'border-[var(--accent)] bg-[var(--bg-secondary)]' : 'border-[var(--border)] hover:border-[var(--text-tertiary)]'
          }`}
        >
          <SlidersHorizontal size={16} className="text-[var(--text-secondary)]" />
        </button>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-4"
          >
            <div className="space-y-3 pb-3">
              {/* Category filter */}
              <div>
                <label className="text-xs font-medium text-[var(--text-tertiary)] mb-1.5 block">Category</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setFilterCategory('all')}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                      filterCategory === 'all' ? 'border-[var(--accent)] bg-[var(--bg-secondary)] text-[var(--text-primary)]' : 'border-[var(--border)] text-[var(--text-secondary)]'
                    }`}
                  >
                    All
                  </button>
                  {DEFAULT_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setFilterCategory(cat.id)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                        filterCategory === cat.id ? 'border-[var(--accent)] bg-[var(--bg-secondary)] text-[var(--text-primary)]' : 'border-[var(--border)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              {/* Sort */}
              <div>
                <label className="text-xs font-medium text-[var(--text-tertiary)] mb-1.5 block">Sort by</label>
                <div className="flex flex-wrap gap-1.5">
                  {(['newest', 'oldest', 'highest', 'lowest'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setSortBy(s)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-all capitalize ${
                        sortBy === s ? 'border-[var(--accent)] bg-[var(--bg-secondary)] text-[var(--text-primary)]' : 'border-[var(--border)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {s === 'highest' ? 'Amount ↓' : s === 'lowest' ? 'Amount ↑' : s === 'newest' ? 'Newest' : 'Oldest'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-[var(--text-tertiary)]">No matching expenses.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([dateKey, items]) => (
            <div key={dateKey}>
              <h3 className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2 px-1">
                {formatSmartDate(dateKey)}
              </h3>
              <div className="space-y-0.5">
                {items.map((expense, i) => {
                  const cat = DEFAULT_CATEGORIES.find(c => c.id === expense.category);
                  const isConfirming = confirmDelete === expense.id;
                  return (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ delay: i * 0.02, duration: 0.15 }}
                      onClick={() => onEdit(expense)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group cursor-pointer sm:cursor-default ${
                        isConfirming ? 'bg-red-50 dark:bg-red-950/20' : 'hover:bg-[var(--bg-secondary)] active:bg-[var(--bg-tertiary)]'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-base shrink-0">
                        {expense.category === 'food' && '🍔'}
                        {expense.category === 'transport' && '🚕'}
                        {expense.category === 'shopping' && '🛍️'}
                        {expense.category === 'bills' && '📄'}
                        {expense.category === 'entertainment' && '🎮'}
                        {expense.category === 'health' && '💊'}
                        {expense.category === 'education' && '📚'}
                        {expense.category === 'other' && '•••'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {expense.note || cat?.name}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)]">
                          {cat?.name} · {formatTime(expense.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">
                          −{formatCurrency(expense.amount, currency)}
                        </span>
                        <div className="flex items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); onEdit(expense); }}
                            className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                            aria-label="Edit"
                          >
                            <Edit3 size={13} className="text-[var(--text-tertiary)]" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(expense.id); }}
                            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors"
                            aria-label={isConfirming ? 'Confirm delete' : 'Delete'}
                          >
                            <Trash2 size={13} className={isConfirming ? 'text-red-500' : 'text-[var(--text-tertiary)]'} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile delete confirmation */}
      {confirmDelete && (
        <div className="sm:hidden fixed bottom-20 left-4 right-4 animate-slide-up">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 shadow-lg flex items-center justify-between">
            <p className="text-sm text-[var(--text-secondary)]">Tap again to delete</p>
            <button
              onClick={() => setConfirmDelete(null)}
              className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
