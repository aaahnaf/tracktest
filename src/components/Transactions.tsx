import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Expense, Currency, DEFAULT_CATEGORIES } from '../lib/types';
import { formatCurrency, formatSmartDate, formatTime, groupExpensesByDate } from '../lib/utils';
import { parseNaturalQuery } from '../lib/analytics';
import { SearchIcon, FilterIcon, CloseIcon, EditIcon, TrashIcon, FoodIcon, TransportIcon, ShoppingIcon, BillsIcon, EntertainmentIcon, HealthIcon, EducationIcon, OtherIcon } from './Icons';

interface TransactionsProps {
  expenses: Expense[];
  currency: Currency;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const categoryIcons: Record<string, any> = {
  food: FoodIcon,
  transport: TransportIcon,
  shopping: ShoppingIcon,
  bills: BillsIcon,
  entertainment: EntertainmentIcon,
  health: HealthIcon,
  education: EducationIcon,
  other: OtherIcon,
};

export function Transactions({ expenses, currency, onEdit, onDelete }: TransactionsProps) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

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
      // Try natural language search first
      const naturalResults = parseNaturalQuery(search, expenses);
      if (naturalResults.length > 0) {
        result = naturalResults;
      } else {
        // Fallback to simple text search
        const q = search.toLowerCase();
        result = result.filter(e => 
          e.note.toLowerCase().includes(q) || 
          e.category.toLowerCase().includes(q) ||
          e.amount.toString().includes(q) ||
          e.memoryNote?.toLowerCase().includes(q) ||
          e.productName?.toLowerCase().includes(q) ||
          e.merchant?.toLowerCase().includes(q)
        );
      }
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
        <p className="text-sm text-[var(--text-secondary)]">No transactions yet.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Search & Filter Bar */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex-1 relative">
          <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search or ask: 'How much on food last month?'"
            className="w-full pl-11 pr-4 py-3 text-sm bg-transparent border border-[var(--border)] rounded-full focus:outline-none focus:border-[var(--text-primary)] transition-all text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2">
              <CloseIcon size={14} className="text-[var(--text-tertiary)]" />
            </button>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3 rounded-full border transition-all ${
            showFilters ? 'border-[var(--text-primary)] bg-[var(--bg-secondary)]' : 'border-[var(--border)] hover:border-[var(--border-strong)]'
          }`}
        >
          <FilterIcon size={16} className="text-[var(--text-secondary)]" />
        </motion.button>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden mb-6"
          >
            <div className="space-y-4 pb-4">
              {/* Category filter */}
              <div>
                <label className="technical-text text-[var(--text-tertiary)] mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilterCategory('all')}
                    className={`px-4 py-2 text-xs rounded-full border transition-all ${
                      filterCategory === 'all' ? 'border-[var(--text-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)]' : 'border-[var(--border)] text-[var(--text-secondary)]'
                    }`}
                  >
                    All
                  </motion.button>
                  {DEFAULT_CATEGORIES.map(cat => (
                    <motion.button
                      key={cat.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFilterCategory(cat.id)}
                      className={`px-4 py-2 text-xs rounded-full border transition-all ${
                        filterCategory === cat.id ? 'border-[var(--text-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)]' : 'border-[var(--border)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {cat.name}
                    </motion.button>
                  ))}
                </div>
              </div>
              {/* Sort */}
              <div>
                <label className="technical-text text-[var(--text-tertiary)] mb-2 block">Sort by</label>
                <div className="flex flex-wrap gap-2">
                  {(['newest', 'oldest', 'highest', 'lowest'] as const).map(s => (
                    <motion.button
                      key={s}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSortBy(s)}
                      className={`px-4 py-2 text-xs rounded-full border transition-all ${
                        sortBy === s ? 'border-[var(--text-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)]' : 'border-[var(--border)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {s === 'highest' ? 'Amount ↓' : s === 'lowest' ? 'Amount ↑' : s === 'newest' ? 'Newest' : 'Oldest'}
                    </motion.button>
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
        <div className="space-y-8">
          {grouped.map(([dateKey, items]) => (
            <div key={dateKey}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-primary)]" />
                <h3 className="technical-text text-[var(--text-secondary)]">
                  {formatSmartDate(dateKey)}
                </h3>
              </div>
              <div className="space-y-1">
                {items.map((expense, i) => {
                  const Icon = categoryIcons[expense.category] || OtherIcon;
                  const isConfirming = confirmDelete === expense.id;
                  return (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.2 }}
                      onClick={() => onEdit(expense)}
                      className={`flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer sm:cursor-default group ${
                        isConfirming ? 'bg-red-50 dark:bg-red-950/20' : 'hover:bg-[var(--bg-secondary)] active:bg-[var(--bg-tertiary)]'
                      }`}
                    >
                      <div className="w-10 h-10 border border-[var(--border)] rounded-xl flex items-center justify-center group-hover:border-[var(--border-strong)] transition-colors shrink-0">
                        <Icon size={18} className="text-[var(--text-secondary)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {expense.note || DEFAULT_CATEGORIES.find(c => c.id === expense.category)?.name}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                          {DEFAULT_CATEGORIES.find(c => c.id === expense.category)?.name} · {formatTime(expense.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-[var(--text-primary)] large-number">
                          −{formatCurrency(expense.amount, currency)}
                        </span>
                        <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.stopPropagation(); onEdit(expense); }}
                            className="p-1.5 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors"
                            aria-label="Edit"
                          >
                            <EditIcon size={14} className="text-[var(--text-tertiary)]" />
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.stopPropagation(); handleDelete(expense.id); }}
                            className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors"
                            aria-label={isConfirming ? 'Confirm delete' : 'Delete'}
                          >
                            <TrashIcon size={14} className={isConfirming ? 'text-red-500' : 'text-[var(--text-tertiary)]'} />
                          </motion.button>
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
        <div className="sm:hidden fixed bottom-24 left-4 right-4 animate-slide-up">
          <div className="bg-[var(--bg)] border border-[var(--border-strong)] rounded-2xl px-5 py-4 shadow-xl flex items-center justify-between">
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
