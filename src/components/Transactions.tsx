import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Expense, Currency, DEFAULT_CATEGORIES } from '../lib/types';
import { formatCurrency, formatSmartDate } from '../lib/utils';
import { GlassCard, TechLabel, GlassPill, Magnetic, staggerParent, riseChild } from './GlassUI';
import { FoodIcon, TransportIcon, ShoppingIcon, BillsIcon, EntertainmentIcon, HealthIcon, EducationIcon, OtherIcon, SearchIcon, EditIcon, TrashIcon } from './Icons';

interface TransactionsProps {
  expenses: Expense[];
  currency: Currency;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => Promise<void>;
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
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) => e.note?.toLowerCase().includes(q) || DEFAULT_CATEGORIES.find((c) => c.id === e.category)?.name.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== 'all') result = result.filter((e) => e.category === categoryFilter);
    return result;
  }, [expenses, search, categoryFilter]);

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, 3, -3, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 glass-card !rounded-full flex items-center justify-center mb-6"
        >
          <SearchIcon size={20} className="text-[var(--text-tertiary)]" />
        </motion.div>
        <p className="text-sm text-[var(--text-secondary)]">No transactions yet.</p>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="show" variants={staggerParent} className="space-y-5">
      {/* header */}
      <motion.div variants={riseChild}>
        <GlassCard tilt={false} className="p-5">
          <div className="relative z-[3] flex items-end justify-between gap-4">
            <div>
              <TechLabel>Transactions</TechLabel>
              <p className="text-3xl font-light tracking-tight large-number mt-2">{filtered.length}</p>
            </div>
            <div className="text-right">
              <p className="technical-text text-[var(--text-tertiary)]">Filtered total</p>
              <p className="text-xl font-medium tabular-nums mt-1">{formatCurrency(total, currency)}</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* filters */}
      <motion.div variants={riseChild} className="space-y-3">
        <div className="glass-card !rounded-full !bg-transparent !border-0 !shadow-none backdrop-blur-none relative">
          <div className="relative z-[3] flex items-center gap-3 px-5 py-3">
            <SearchIcon size={15} className="text-[var(--text-tertiary)] shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes or categories..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
            />
            {search && (
              <button onClick={() => setSearch('')} className="technical-text text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <Magnetic strength={0.2}>
            <GlassPill active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')}>
              All
            </GlassPill>
          </Magnetic>
          {DEFAULT_CATEGORIES.map((cat) => (
            <Magnetic key={cat.id} strength={0.2}>
              <GlassPill active={categoryFilter === cat.id} onClick={() => setCategoryFilter(cat.id)}>
                {cat.name}
              </GlassPill>
            </Magnetic>
          ))}
        </div>
      </motion.div>

      {/* list */}
      <motion.div variants={riseChild} className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((expense, index) => {
            const Icon = categoryIcons[expense.category] || OtherIcon;
            const categoryName = DEFAULT_CATEGORIES.find((c) => c.id === expense.category)?.name || expense.category;
            return (
              <motion.div
                key={expense.id}
                layout
                initial={{ opacity: 0, y: 18, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -60, scale: 0.95, transition: { duration: 0.25 } }}
                transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <GlassCard className="p-4 sm:p-5">
                  <div className="relative z-[3] flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl border border-[var(--glass-border)] flex items-center justify-center shrink-0">
                      <Icon size={17} className="text-[var(--text-secondary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {expense.note || categoryName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-[var(--text-tertiary)]">{categoryName} · {formatSmartDate(expense.date)}</p>
                        {expense.worthItRating === 'absolutely' && (
                          <span className="technical-text text-[var(--accent)]">Worth it</span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-medium text-[var(--text-primary)] tabular-nums mr-1">
                      {formatCurrency(expense.amount, currency)}
                    </p>

                    {confirmDelete === expense.id ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2"
                      >
                        <button
                          onClick={() => { onDelete(expense.id); setConfirmDelete(null); }}
                          className="glass-pill !px-3 !py-1.5 !border-red-500/60 text-red-500"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="glass-pill !px-3 !py-1.5"
                        >
                          Keep
                        </button>
                      </motion.div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEdit(expense)}
                          aria-label="Edit"
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-strong)] transition-all active:scale-90"
                        >
                          <EditIcon size={14} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(expense.id)}
                          aria-label="Delete"
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:text-red-500 hover:bg-[var(--glass-bg-strong)] transition-all active:scale-90"
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-[var(--text-tertiary)] py-12"
          >
            Nothing matches those filters.
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}
