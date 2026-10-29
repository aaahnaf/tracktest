import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Expense, Currency, DEFAULT_CATEGORIES } from '../lib/types';
import { formatCurrency, formatSmartDate } from '../lib/utils';
import { FoodIcon, TransportIcon, ShoppingIcon, BillsIcon, EntertainmentIcon, HealthIcon, EducationIcon, OtherIcon, PlusIcon, MinusIcon } from './Icons';
import { AnimatedNumber } from './AnimatedNumber';
import { parseISO, format, subMonths, addMonths, isAfter, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface ReplayProps {
  expenses: Expense[];
  currency: Currency;
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

export function Replay({ expenses, currency }: ReplayProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const monthExpenses = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    return expenses
      .filter(e => {
        const d = parseISO(e.date);
        return isWithinInterval(d, { start, end });
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [expenses, selectedMonth]);

  const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handlePrevMonth = () => setSelectedMonth(subMonths(selectedMonth, 1));
  const handleNextMonth = () => {
    const next = addMonths(selectedMonth, 1);
    if (!isAfter(next, new Date())) setSelectedMonth(next);
  };

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
        <h2 className="text-2xl font-light text-[var(--text-primary)] mb-3 tracking-tight">No history to replay</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-[320px] leading-relaxed">
          Start tracking expenses to see your spending timeline.
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
          <span className="technical-text text-[var(--text-secondary)]">Spending Timeline</span>
        </div>
        <h1 className="text-2xl font-light text-[var(--text-primary)] tracking-tight">
          Your spending journey
        </h1>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-2xl">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handlePrevMonth}
          className="p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors"
        >
          <MinusIcon size={16} />
        </motion.button>
        <div className="text-center">
          <p className="text-lg font-light text-[var(--text-primary)]">
            {format(selectedMonth, 'MMMM yyyy')}
          </p>
          <p className="text-xs text-[var(--text-tertiary)] technical-text">
            {monthExpenses.length} {monthExpenses.length === 1 ? 'expense' : 'expenses'}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleNextMonth}
          disabled={isAfter(addMonths(selectedMonth, 1), new Date())}
          className="p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-30"
        >
          <PlusIcon size={16} />
        </motion.button>
      </div>

      {/* Total */}
      <div className="relative overflow-hidden p-6 border border-[var(--border)] rounded-3xl bg-[var(--bg-secondary)]">
        <div className="absolute inset-0 dot-pattern opacity-10" />
        <div className="relative">
          <p className="technical-text text-[var(--text-tertiary)] mb-2">Total spent</p>
          <AnimatedNumber
            value={total}
            prefix={`${currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹'} `}
            className="text-5xl font-light text-[var(--text-primary)] large-number"
          />
        </div>
      </div>

      {/* Timeline */}
      {monthExpenses.length > 0 && (
        <div className="space-y-2">
          {monthExpenses.map((expense, i) => {
            const Icon = categoryIcons[expense.category] || OtherIcon;
            return (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <div className="w-10 h-10 border border-[var(--border)] rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-[var(--text-secondary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {expense.note || DEFAULT_CATEGORIES.find(c => c.id === expense.category)?.name}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                    {formatSmartDate(expense.date)}
                  </p>
                </div>
                <span className="text-sm font-medium text-[var(--text-primary)] large-number">
                  −{formatCurrency(expense.amount, currency)}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
