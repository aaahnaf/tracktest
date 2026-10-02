import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { Expense, Currency, DEFAULT_CATEGORIES } from '../lib/types';
import { formatCurrency, getGreeting, getMonthStart, getMonthEnd, formatSmartDate, formatRelativeTime, getInsights } from '../lib/utils';
import { AnimatedNumber } from './AnimatedNumber';
import { parseISO, format } from 'date-fns';

interface OverviewProps {
  expenses: Expense[];
  currency: Currency;
  onAddExpense: () => void;
  onNavigate: (page: 'transactions') => void;
}

export function Overview({ expenses, currency, onAddExpense, onNavigate }: OverviewProps) {
  const now = new Date();
  const monthStart = getMonthStart(now);
  const monthEnd = getMonthEnd(now);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const thisMonthExpenses = useMemo(() => 
    expenses.filter(e => {
      const d = parseISO(e.date);
      return d >= monthStart && d <= monthEnd;
    }), [expenses, monthStart, monthEnd]);

  const lastMonthExpenses = useMemo(() => 
    expenses.filter(e => {
      const d = parseISO(e.date);
      return d >= lastMonthStart && d <= lastMonthEnd;
    }), [expenses, lastMonthStart, lastMonthEnd]);

  const thisMonthTotal = thisMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const lastMonthTotal = lastMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const diff = thisMonthTotal - lastMonthTotal;

  const recentExpenses = expenses.slice(0, 5);
  const insights = getInsights(expenses, currency);

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center animate-fade-in">
        <div className="relative mb-8">
          <div className="w-20 h-20 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center">
            <span className="text-4xl">💸</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center">
            <Plus size={12} className="text-[var(--bg)]" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Nothing spent yet.</h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-[260px] leading-relaxed">
          Add your first expense and start seeing where your money goes.
        </p>
        <button
          onClick={onAddExpense}
          className="flex items-center gap-2 px-6 py-3.5 bg-[var(--accent)] text-[var(--bg)] rounded-xl font-medium hover:opacity-90 active:scale-[0.97] transition-all shadow-sm"
        >
          <Plus size={18} />
          Add expense
        </button>
        <p className="text-xs text-[var(--text-tertiary)] mt-6 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
          Your data stays on this device
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-[var(--text-secondary)] mb-1">{getGreeting()}</p>
        <div className="flex items-baseline gap-2">
          <AnimatedNumber
            value={thisMonthTotal}
            prefix={`${currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹'} `}
            className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)]"
          />
        </div>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Spent this month</p>
        
        {lastMonthTotal > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            {diff <= 0 ? (
              <TrendingDown size={14} className="text-green-600" />
            ) : (
              <TrendingUp size={14} className="text-red-500" />
            )}
            <span className={`text-sm ${diff <= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {formatCurrency(Math.abs(diff), currency)} {diff <= 0 ? 'less' : 'more'} than last month
            </span>
          </div>
        )}

        {/* Mini sparkline */}
        {thisMonthExpenses.length > 0 && (
          <div className="mt-4 flex items-end gap-[3px] h-8">
            {Array.from({ length: Math.min(now.getDate(), 14) }, (_, i) => {
              const d = new Date(now.getFullYear(), now.getMonth(), i + 1);
              const dateStr = format(d, 'yyyy-MM-dd');
              const dayTotal = expenses.filter(e => e.date === dateStr).reduce((s, e) => s + e.amount, 0);
              const maxDay = Math.max(...Array.from({ length: Math.min(now.getDate(), 14) }, (_, j) => {
                const dd = new Date(now.getFullYear(), now.getMonth(), j + 1);
                return expenses.filter(e => e.date === format(dd, 'yyyy-MM-dd')).reduce((s, e) => s + e.amount, 0);
              }), 1);
              const height = dayTotal > 0 ? Math.max((dayTotal / maxDay) * 100, 8) : 4;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-[var(--accent)] opacity-20 min-w-[3px] max-w-[8px]"
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Today's spending + Quick Add */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl">
          <p className="text-xs text-[var(--text-tertiary)] mb-0.5">Today</p>
          <p className="text-lg font-semibold text-[var(--text-primary)] tabular-nums">
            {formatCurrency(
              expenses.filter(e => e.date === format(now, 'yyyy-MM-dd')).reduce((s, e) => s + e.amount, 0),
              currency
            )}
          </p>
        </div>
        <button
          onClick={onAddExpense}
          className="flex items-center gap-2 px-4 py-3 bg-[var(--accent)] text-[var(--bg)] rounded-xl font-medium text-sm hover:opacity-90 active:scale-[0.97] transition-all shadow-sm shrink-0"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add expense</span>
        </button>
      </div>

      {/* Recent Transactions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-[var(--text-secondary)]">Recent</h3>
          <button
            onClick={() => onNavigate('transactions')}
            className="flex items-center gap-1 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            See all
            <ArrowRight size={14} />
          </button>
        </div>
        <div className="space-y-1">
          {recentExpenses.map((expense, i) => {
            const cat = DEFAULT_CATEGORIES.find(c => c.id === expense.category);
            return (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-base">
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
                    {formatRelativeTime(expense.createdAt)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">
                  −{formatCurrency(expense.amount, currency)}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Your spending</h3>
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="flex items-start gap-3 px-4 py-3 bg-[var(--bg-secondary)] rounded-xl"
              >
                <span className="text-[var(--text-tertiary)] text-sm">→</span>
                <p className="text-sm text-[var(--text-secondary)]">{insight}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
