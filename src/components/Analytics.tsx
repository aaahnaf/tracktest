import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Expense, Currency, DEFAULT_CATEGORIES } from '../lib/types';
import { formatCurrency, getMonthStart, getMonthEnd, getWeekDates, getInsights } from '../lib/utils';
import { AnimatedNumber } from './AnimatedNumber';
import { parseISO, format } from 'date-fns';

interface AnalyticsProps {
  expenses: Expense[];
  currency: Currency;
}

export function Analytics({ expenses, currency }: AnalyticsProps) {
  const now = new Date();
  const monthStart = getMonthStart(now);
  const monthEnd = getMonthEnd(now);

  const thisMonthExpenses = useMemo(() => 
    expenses.filter(e => {
      const d = parseISO(e.date);
      return d >= monthStart && d <= monthEnd;
    }), [expenses, monthStart, monthEnd]);

  const thisMonthTotal = thisMonthExpenses.reduce((s, e) => s + e.amount, 0);

  // Weekly data
  const weekDates = getWeekDates();
  const weeklyData = useMemo(() => {
    return weekDates.map(date => {
      const dayExpenses = expenses.filter(e => e.date === date);
      const total = dayExpenses.reduce((s, e) => s + e.amount, 0);
      return { date, total, label: format(parseISO(date), 'EEE') };
    });
  }, [expenses, weekDates]);

  const maxWeekly = Math.max(...weeklyData.map(d => d.total), 1);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const totals: Record<string, number> = {};
    thisMonthExpenses.forEach(e => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return Object.entries(totals)
      .map(([id, amount]) => ({
        id,
        amount,
        percentage: thisMonthTotal > 0 ? Math.round((amount / thisMonthTotal) * 100) : 0,
        category: DEFAULT_CATEGORIES.find(c => c.id === id),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [thisMonthExpenses, thisMonthTotal]);

  const insights = getInsights(expenses, currency);

  const symbol = currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹';

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] px-6 text-center animate-fade-in">
        <p className="text-[var(--text-secondary)]">No data to analyze yet.</p>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">Start tracking expenses to see insights.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Monthly Total */}
      <div>
        <p className="text-sm text-[var(--text-secondary)] mb-1">This month</p>
        <AnimatedNumber
          value={thisMonthTotal}
          prefix={`${symbol} `}
          className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]"
        />
        <p className="text-sm text-[var(--text-tertiary)] mt-1">total spending</p>
      </div>

      {/* Weekly Chart */}
      <div>
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Last 7 days</h3>
        <div className="flex items-end gap-2 h-32">
          {weeklyData.map((day, i) => (
            <motion.div
              key={day.date}
              initial={{ height: 0 }}
              animate={{ height: `${(day.total / maxWeekly) * 100}%` }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col items-center gap-1.5"
            >
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full rounded-t-md bg-[var(--accent)] opacity-80 min-h-[2px] transition-all"
                  style={{ height: `${(day.total / maxWeekly) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-[var(--text-tertiary)]">{day.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div>
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">By category</h3>
        
        {/* Donut-like visual */}
        <div className="flex items-center gap-6 mb-5">
          <div className="relative w-24 h-24 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              {categoryBreakdown.reduce<{ elements: JSX.Element[]; offset: number }>((acc, item, i) => {
                const cat = item.category;
                const color = cat?.color || '#6b7280';
                const dashArray = `${item.percentage} ${100 - item.percentage}`;
                acc.elements.push(
                  <motion.circle
                    key={item.id}
                    cx="18" cy="18" r="15.915"
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeDasharray={dashArray}
                    strokeDashoffset={-acc.offset}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1, duration: 0.3 }}
                  />
                );
                acc.offset += item.percentage;
                return acc;
              }, { elements: [], offset: 0 }).elements}
            </svg>
          </div>
          <div className="flex-1 space-y-2">
            {categoryBreakdown.slice(0, 5).map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.category?.color || '#6b7280' }}
                />
                <span className="text-sm text-[var(--text-primary)] flex-1">{item.category?.name}</span>
                <span className="text-sm text-[var(--text-tertiary)] tabular-nums">{item.percentage}%</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Detailed list */}
        <div className="space-y-2">
          {categoryBreakdown.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.04 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--bg-secondary)]"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: `${item.category?.color}15` }}>
                {item.id === 'food' && '🍔'}
                {item.id === 'transport' && '🚕'}
                {item.id === 'shopping' && '🛍️'}
                {item.id === 'bills' && '📄'}
                {item.id === 'entertainment' && '🎮'}
                {item.id === 'health' && '💊'}
                {item.id === 'education' && '📚'}
                {item.id === 'other' && '•••'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--text-primary)]">{item.category?.name}</p>
                <div className="mt-1 h-1 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ delay: 0.3 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.category?.color || '#6b7280' }}
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">{formatCurrency(item.amount, currency)}</p>
                <p className="text-xs text-[var(--text-tertiary)]">{item.percentage}%</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Your spending</h3>
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
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
