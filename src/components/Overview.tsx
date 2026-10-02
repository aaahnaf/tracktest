import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Expense, Currency, DEFAULT_CATEGORIES } from '../lib/types';
import { formatCurrency, getGreeting, getMonthStart, getMonthEnd, formatSmartDate, formatRelativeTime, getInsights } from '../lib/utils';
import { calculateWorthItStats, detectPatterns } from '../lib/analytics';
import { AnimatedNumber } from './AnimatedNumber';
import { PlusIcon, ArrowRightIcon, TrendUpIcon, TrendDownIcon, FoodIcon, TransportIcon, ShoppingIcon, BillsIcon, EntertainmentIcon, HealthIcon, EducationIcon, OtherIcon } from './Icons';
import { parseISO, format } from 'date-fns';

interface OverviewProps {
  expenses: Expense[];
  currency: Currency;
  onAddExpense: () => void;
  onNavigate: (page: 'transactions') => void;
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
  const todayTotal = expenses.filter(e => e.date === format(now, 'yyyy-MM-dd')).reduce((s, e) => s + e.amount, 0);
  const avgPurchase = thisMonthExpenses.length > 0 ? thisMonthTotal / thisMonthExpenses.length : 0;

  const recentExpenses = expenses.slice(0, 5);
  const insights = getInsights(expenses, currency);
  
  // Memory insights
  const worthItStats = useMemo(() => calculateWorthItStats(thisMonthExpenses), [thisMonthExpenses]);
  const patterns = useMemo(() => detectPatterns(expenses), [expenses]);
  
  // Contextual insight - pick the most relevant one
  const contextualInsight = useMemo(() => {
    if (worthItStats && worthItStats.total >= 3) {
      const negativeThisMonth = thisMonthExpenses.filter(e => e.worthItRating === 'not-really' || e.worthItRating === 'no').length;
      if (negativeThisMonth >= 2) {
        return `You marked ${negativeThisMonth} purchases this month as not worth it`;
      }
    }
    
    if (thisMonthExpenses.length > 0) {
      const largest = thisMonthExpenses.reduce((max, e) => e.amount > max.amount ? e : max, thisMonthExpenses[0]);
      if (largest.amount > thisMonthTotal * 0.3) {
        return `Your largest purchase was ${formatCurrency(largest.amount, currency)}`;
      }
    }
    
    if (patterns.length > 0) {
      return patterns[0].description;
    }
    
    return null;
  }, [worthItStats, thisMonthExpenses, patterns, thisMonthTotal, currency]);

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center animate-fade-in">
        {/* Decorative glyph */}
        <div className="relative mb-12">
          <div className="w-32 h-32 border border-[var(--border)] rounded-full flex items-center justify-center">
            <div className="w-20 h-20 border border-[var(--border)] rounded-full flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[var(--accent)] animate-pulse-slow" />
            </div>
          </div>
          {/* Corner dots */}
          <div className="absolute top-0 left-0 w-1 h-1 rounded-full bg-[var(--text-tertiary)]" />
          <div className="absolute top-0 right-0 w-1 h-1 rounded-full bg-[var(--text-tertiary)]" />
          <div className="absolute bottom-0 left-0 w-1 h-1 rounded-full bg-[var(--text-tertiary)]" />
          <div className="absolute bottom-0 right-0 w-1 h-1 rounded-full bg-[var(--text-tertiary)]" />
        </div>

        <h2 className="text-2xl font-light text-[var(--text-primary)] mb-3 tracking-tight">Nothing spent yet</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-10 max-w-[280px] leading-relaxed">
          Add your first expense and start seeing where your money goes.
        </p>
        
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onAddExpense}
          className="group flex items-center gap-3 px-8 py-4 bg-[var(--text-primary)] text-[var(--bg)] rounded-full font-medium hover:opacity-90 transition-all"
        >
          <PlusIcon size={18} />
          <span>Add expense</span>
        </motion.button>

        <div className="mt-12 flex items-center gap-2 text-[var(--text-tertiary)]">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
          <span className="technical-text">Data stored locally</span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header with technical styling */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
          <span className="technical-text text-[var(--text-secondary)]">{getGreeting()}</span>
        </div>
        
        {/* Large amount display */}
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-px bg-[var(--border)]" />
          <div className="pl-6">
            <AnimatedNumber
              value={thisMonthTotal}
              prefix={`${currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹'} `}
              className="text-6xl sm:text-7xl font-light tracking-tight text-[var(--text-primary)] large-number"
            />
            <p className="text-sm text-[var(--text-secondary)] mt-3">
              This month. {thisMonthExpenses.length} {thisMonthExpenses.length === 1 ? 'purchase' : 'purchases'}.
              {avgPurchase > 0 && ` ${formatCurrency(avgPurchase, currency)} average.`}
            </p>
            
            {lastMonthTotal > 0 && (
              <div className="flex items-center gap-2 mt-3">
                {diff <= 0 ? (
                  <TrendDownIcon size={14} className="text-[var(--text-secondary)]" />
                ) : (
                  <TrendUpIcon size={14} className="text-[var(--text-secondary)]" />
                )}
                <span className="text-sm text-[var(--text-secondary)]">
                  {formatCurrency(Math.abs(diff), currency)} {diff <= 0 ? 'less' : 'more'} than last month
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Mini sparkline */}
        {thisMonthExpenses.length > 0 && (
          <div className="mt-8 flex items-end gap-1 h-12">
            {Array.from({ length: Math.min(now.getDate(), 14) }, (_, i) => {
              const d = new Date(now.getFullYear(), now.getMonth(), i + 1);
              const dateStr = format(d, 'yyyy-MM-dd');
              const dayTotal = expenses.filter(e => e.date === dateStr).reduce((s, e) => s + e.amount, 0);
              const maxDay = Math.max(...Array.from({ length: Math.min(now.getDate(), 14) }, (_, j) => {
                const dd = new Date(now.getFullYear(), now.getMonth(), j + 1);
                return expenses.filter(e => e.date === format(dd, 'yyyy-MM-dd')).reduce((s, e) => s + e.amount, 0);
              }), 1);
              const height = dayTotal > 0 ? Math.max((dayTotal / maxDay) * 100, 10) : 5;
              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: i * 0.03, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-1 rounded-sm min-w-[3px] max-w-[6px]"
                  style={{ 
                    backgroundColor: dayTotal > 0 ? 'var(--text-primary)' : 'var(--border)',
                    opacity: dayTotal > 0 ? 0.8 : 0.3
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Contextual Insight */}
      {contextualInsight && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mb-8 p-4 border border-[var(--border)] rounded-2xl"
        >
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1.5 shrink-0" />
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {contextualInsight}
            </p>
          </div>
        </motion.div>
      )}

      {/* Today's spending + Quick Add */}
      <div className="grid grid-cols-2 gap-3 mb-10">
        <div className="relative p-5 border border-[var(--border)] rounded-2xl hover:border-[var(--border-strong)] transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-1 rounded-full bg-[var(--accent)]" />
            <span className="technical-text text-[var(--text-tertiary)]">Today</span>
          </div>
          <p className="text-2xl font-light text-[var(--text-primary)] large-number">
            {formatCurrency(todayTotal, currency)}
          </p>
        </div>
        
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onAddExpense}
          className="group relative p-5 bg-[var(--text-primary)] text-[var(--bg)] rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <PlusIcon size={18} />
          <span className="font-medium text-sm">Add expense</span>
        </motion.button>
      </div>

      {/* Recent Transactions */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-primary)]" />
            <h3 className="technical-text text-[var(--text-secondary)]">Recent</h3>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            className="flex items-center gap-1.5 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors group"
          >
            <span>See all</span>
            <ArrowRightIcon size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
        
        <div className="space-y-1">
          {recentExpenses.map((expense, i) => {
            const Icon = categoryIcons[expense.category] || OtherIcon;
            return (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors group"
              >
                <div className="w-10 h-10 border border-[var(--border)] rounded-xl flex items-center justify-center group-hover:border-[var(--border-strong)] transition-colors">
                  <Icon size={18} className="text-[var(--text-secondary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {expense.note || DEFAULT_CATEGORIES.find(c => c.id === expense.category)?.name}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                    {formatRelativeTime(expense.createdAt)}
                  </p>
                </div>
                <span className="text-sm font-medium text-[var(--text-primary)] large-number">
                  −{formatCurrency(expense.amount, currency)}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <h3 className="technical-text text-[var(--text-secondary)]">Insights</h3>
          </div>
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
                className="flex items-start gap-3 p-4 border border-[var(--border)] rounded-xl hover:border-[var(--border-strong)] transition-colors"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2 shrink-0" />
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{insight}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
