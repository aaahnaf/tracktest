import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Expense, Currency, DEFAULT_CATEGORIES } from '../lib/types';
import { formatCurrency, getMonthStart, getMonthEnd } from '../lib/utils';
import { PlusIcon, FoodIcon, TransportIcon, ShoppingIcon, BillsIcon, EntertainmentIcon, HealthIcon, EducationIcon, OtherIcon } from './Icons';
import { AnimatedNumber } from './AnimatedNumber';
import { parseISO, format } from 'date-fns';

interface WidgetsProps {
  expenses: Expense[];
  currency: Currency;
  onAddExpense: () => void;
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

export function Widgets({ expenses, currency, onAddExpense }: WidgetsProps) {
  const now = new Date();
  const monthStart = getMonthStart(now);
  const monthEnd = getMonthEnd(now);

  const thisMonthExpenses = useMemo(() => 
    expenses.filter(e => {
      const d = parseISO(e.date);
      return d >= monthStart && d <= monthEnd;
    }), [expenses, monthStart, monthEnd]);

  const thisMonthTotal = thisMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const todayTotal = expenses.filter(e => e.date === format(now, 'yyyy-MM-dd')).reduce((s, e) => s + e.amount, 0);
  const todayCount = expenses.filter(e => e.date === format(now, 'yyyy-MM-dd')).length;

  const symbol = currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹';

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center animate-fade-in">
        <div className="relative mb-12">
          <div className="w-32 h-32 border border-[var(--border)] rounded-full flex items-center justify-center">
            <div className="w-20 h-20 border border-[var(--border)] rounded-full flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[var(--accent)] animate-pulse-slow" />
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-light text-[var(--text-primary)] mb-3 tracking-tight">No widgets yet</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-[320px] leading-relaxed">
          Start tracking expenses to see your spending widgets.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
          <span className="technical-text text-[var(--text-secondary)]">Widgets</span>
        </div>
        <h1 className="text-2xl font-light text-[var(--text-primary)] tracking-tight">
          Quick access to your spending
        </h1>
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Monthly Total Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="col-span-2 relative overflow-hidden p-6 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl"
        >
          {/* Dot matrix background */}
          <div className="absolute inset-0 dot-pattern opacity-30" />
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-1 rounded-full bg-[var(--accent)]" />
              <span className="technical-text text-[var(--text-tertiary)]">This month</span>
            </div>
            <AnimatedNumber
              value={thisMonthTotal}
              prefix={`${symbol} `}
              className="text-4xl font-light text-[var(--text-primary)] large-number"
            />
            <p className="text-xs text-[var(--text-tertiary)] mt-2">
              {thisMonthExpenses.length} {thisMonthExpenses.length === 1 ? 'purchase' : 'purchases'}
            </p>
          </div>
        </motion.div>

        {/* Today's Spending Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative overflow-hidden p-5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl"
        >
          <div className="absolute inset-0 dot-pattern-dense opacity-20" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-1 rounded-full bg-[var(--accent)]" />
              <span className="technical-text text-[var(--text-tertiary)]">Today</span>
            </div>
            <p className="text-2xl font-light text-[var(--text-primary)] large-number">
              {formatCurrency(todayTotal, currency)}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              {todayCount} {todayCount === 1 ? 'purchase' : 'purchases'}
            </p>
          </div>
        </motion.div>

        {/* Quick Add Widget */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddExpense}
          className="relative overflow-hidden p-5 bg-[var(--text-primary)] text-[var(--bg)] border border-[var(--text-primary)] rounded-2xl flex flex-col items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <div className="absolute inset-0 dot-pattern-accent opacity-20" />
          <div className="relative flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[var(--bg)]/10 flex items-center justify-center">
              <PlusIcon size={20} />
            </div>
            <span className="text-sm font-medium">Add expense</span>
          </div>
        </motion.button>

        {/* Recent Categories Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="col-span-2 relative overflow-hidden p-5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl"
        >
          <div className="absolute inset-0 dot-pattern opacity-20" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-1 rounded-full bg-[var(--accent)]" />
              <span className="technical-text text-[var(--text-tertiary)]">Recent categories</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(thisMonthExpenses.slice(0, 10).map(e => e.category))).slice(0, 5).map((cat, i) => {
                const Icon = categoryIcons[cat] || OtherIcon;
                const catName = DEFAULT_CATEGORIES.find(c => c.id === cat)?.name || cat;
                return (
                  <motion.div
                    key={cat}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg)] border border-[var(--border)] rounded-full"
                  >
                    <Icon size={14} className="text-[var(--text-secondary)]" />
                    <span className="text-xs text-[var(--text-secondary)]">{catName}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Info */}
      <div className="p-4 border border-[var(--border)] rounded-xl">
        <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
          These widgets provide quick access to your spending data. On supported devices, you can add these to your home screen for even faster access.
        </p>
      </div>
    </div>
  );
}
