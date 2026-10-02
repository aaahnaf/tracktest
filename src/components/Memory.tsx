import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Expense, Currency, DEFAULT_CATEGORIES } from '../lib/types';
import { formatCurrency, formatSmartDate } from '../lib/utils';
import { FoodIcon, TransportIcon, ShoppingIcon, BillsIcon, EntertainmentIcon, HealthIcon, EducationIcon, OtherIcon } from './Icons';
import { parseISO, format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface MemoryProps {
  expenses: Expense[];
  currency: Currency;
  onEditExpense: (expense: Expense) => void;
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

export function Memory({ expenses, currency, onEditExpense }: MemoryProps) {
  // Group expenses by month that have memories
  const memoriesByMonth = useMemo(() => {
    const withMemories = expenses.filter(e => e.memoryNote || e.worthItRating || e.futureMeNote);
    
    const byMonth: Record<string, Expense[]> = {};
    withMemories.forEach(e => {
      const monthKey = format(parseISO(e.date), 'yyyy-MM');
      if (!byMonth[monthKey]) byMonth[monthKey] = [];
      byMonth[monthKey].push(e);
    });
    
    return Object.entries(byMonth)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([monthKey, exps]) => ({
        month: monthKey,
        monthLabel: format(parseISO(monthKey + '-01'), 'MMMM yyyy'),
        expenses: exps.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      }));
  }, [expenses]);

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
        <h2 className="text-2xl font-light text-[var(--text-primary)] mb-3 tracking-tight">Your spending story hasn't started yet</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-[320px] leading-relaxed">
          Keep tracking purchases and optionally add memories. Your spending memories will appear here.
        </p>
      </div>
    );
  }

  if (memoriesByMonth.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center animate-fade-in">
        <div className="relative mb-12">
          <div className="w-32 h-32 border border-[var(--border)] rounded-full flex items-center justify-center">
            <div className="w-20 h-20 border border-[var(--border)] rounded-full flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[var(--accent)] animate-pulse-slow" />
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-light text-[var(--text-primary)] mb-3 tracking-tight">No memories yet</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-[320px] leading-relaxed mb-6">
          You have {expenses.length} expenses tracked. Add memories to your purchases to see them here.
        </p>
        <p className="text-xs text-[var(--text-tertiary)]">
          Edit any expense and add "What was this for?" or "Was it worth it?"
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-12">
      {memoriesByMonth.map((monthData, monthIndex) => (
        <motion.div
          key={monthData.month}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: monthIndex * 0.1, duration: 0.4 }}
        >
          {/* Month header */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <h2 className="text-lg font-light text-[var(--text-primary)] tracking-tight">
              {monthData.monthLabel}
            </h2>
            <span className="text-xs text-[var(--text-tertiary)] ml-2">
              {monthData.expenses.length} {monthData.expenses.length === 1 ? 'memory' : 'memories'}
            </span>
          </div>

          {/* Memory cards */}
          <div className="space-y-3">
            {monthData.expenses.map((expense, i) => {
              const Icon = categoryIcons[expense.category] || OtherIcon;
              const categoryName = DEFAULT_CATEGORIES.find(c => c.id === expense.category)?.name || expense.category;
              
              return (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: monthIndex * 0.1 + i * 0.05, duration: 0.3 }}
                  onClick={() => onEditExpense(expense)}
                  className="group p-5 border border-[var(--border)] rounded-2xl hover:border-[var(--border-strong)] transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 border border-[var(--border)] rounded-xl flex items-center justify-center shrink-0 group-hover:border-[var(--border-strong)] transition-colors">
                      <Icon size={20} className="text-[var(--text-secondary)]" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Amount and category */}
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-2xl font-light text-[var(--text-primary)] large-number">
                          {formatCurrency(expense.amount, currency)}
                        </span>
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {categoryName}
                        </span>
                      </div>

                      {/* Note */}
                      {expense.note && (
                        <p className="text-sm text-[var(--text-secondary)] mb-2">
                          {expense.note}
                        </p>
                      )}

                      {/* Memory note */}
                      {expense.memoryNote && (
                        <div className="mt-3 p-3 bg-[var(--bg-secondary)] rounded-xl">
                          <p className="text-xs text-[var(--text-tertiary)] mb-1 technical-text">What was this for?</p>
                          <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                            "{expense.memoryNote}"
                          </p>
                        </div>
                      )}

                      {/* Worth it rating */}
                      {expense.worthItRating && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-xs text-[var(--text-tertiary)]">Worth it:</span>
                          <span className={`text-xs font-medium ${
                            expense.worthItRating === 'absolutely' ? 'text-green-600 dark:text-green-400' :
                            expense.worthItRating === 'mostly' ? 'text-[var(--text-primary)]' :
                            expense.worthItRating === 'not-really' ? 'text-orange-600 dark:text-orange-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {expense.worthItRating === 'absolutely' && 'Absolutely'}
                            {expense.worthItRating === 'mostly' && 'Mostly'}
                            {expense.worthItRating === 'not-really' && 'Not really'}
                            {expense.worthItRating === 'no' && 'No'}
                          </span>
                        </div>
                      )}

                      {/* Future me note */}
                      {expense.futureMeNote && (
                        <div className="mt-3 p-3 border border-[var(--border)] rounded-xl">
                          <p className="text-xs text-[var(--text-tertiary)] mb-1 technical-text">Future me</p>
                          <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic">
                            "{expense.futureMeNote}"
                          </p>
                        </div>
                      )}

                      {/* Date */}
                      <p className="text-xs text-[var(--text-tertiary)] mt-3">
                        {formatSmartDate(expense.date)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
